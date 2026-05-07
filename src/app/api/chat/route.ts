import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { chatWithMetaAI, streamMetaAI, ChatMessage } from '@/lib/meta-ai'
import { PLANS, GUEST_MESSAGES_PER_SESSION } from '@/lib/plans'

// DB is optional — imported lazily so missing DATABASE_URL doesn't crash the module
async function getDB() {
  try {
    const { prisma } = await import('@/lib/prisma')
    return prisma
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, chatId, guestId, stream: wantStream } = body as {
      messages: ChatMessage[]
      chatId?: string
      guestId?: string
      stream?: boolean
    }

    if (!messages?.length) {
      return NextResponse.json({ error: 'Messages requis' }, { status: 400 })
    }

    const session = await getServerSession(authOptions).catch(() => null)
    const userId = (session?.user as any)?.id as string | undefined
    const userPlan = ((session?.user as any)?.plan as string) ?? 'FREE'

    const db = await getDB()

    // ── Rate limiting ──────────────────────────────────────────────
    if (userId && db) {
      try {
        const user = await db.user.findUnique({ where: { id: userId } })
        if (user) {
          const plan = PLANS[user.plan as keyof typeof PLANS]
          if (plan && plan.messagesPerDay !== -1 && user.messagesUsed >= plan.messagesPerDay) {
            return NextResponse.json(
              { error: 'Limite de messages atteinte', upgrade: true, limit: plan.messagesPerDay },
              { status: 429 }
            )
          }
        }
      } catch {
        // DB unavailable — continue without rate limiting
      }
    } else if (!userId) {
      // Guest: check session limit via DB (graceful degradation if DB unavailable)
      if (guestId && db) {
        try {
          let guest = await db.guestSession.findUnique({ where: { guestId } })
          if (!guest) {
            guest = await db.guestSession.create({ data: { guestId } })
          }
          if (guest.messagesUsed >= GUEST_MESSAGES_PER_SESSION) {
            return NextResponse.json(
              {
                error: `Limite de ${GUEST_MESSAGES_PER_SESSION} messages atteinte`,
                upgrade: true,
                register: true,
                limit: GUEST_MESSAGES_PER_SESSION,
              },
              { status: 429 }
            )
          }
        } catch {
          // DB unavailable — allow guest without tracking
        }
      }
    }

    // ── Determine model ────────────────────────────────────────────
    const plan = userId ? PLANS[userPlan as keyof typeof PLANS] ?? PLANS.FREE : PLANS.FREE
    const model = plan.model

    // ── System prompt ──────────────────────────────────────────────
    const systemMsg: ChatMessage = {
      role: 'system',
      content: `Tu es NJP CLAW, un assistant IA conversationnel avancé propulsé par Meta AI (${plan.modelLabel ?? 'Llama 3.1'}).
Tu es utile, précis, et tu réponds toujours en français sauf si l'utilisateur demande une autre langue.
Tu es développé par la plateforme NJP CLAW.`,
    }

    const fullMessages: ChatMessage[] = [
      systemMsg,
      ...messages.filter((m) => m.role !== 'system'),
    ]

    // ── Save user message to DB ────────────────────────────────────
    let activeChatId = chatId
    if (userId && db) {
      try {
        if (!activeChatId) {
          const firstContent = messages.find((m) => m.role === 'user')?.content ?? 'Nouvelle conv.'
          const chat = await db.chat.create({
            data: { userId, model, title: firstContent.slice(0, 60) },
          })
          activeChatId = chat.id
        }
        const lastUser = [...messages].reverse().find((m) => m.role === 'user')
        if (lastUser && activeChatId) {
          await db.message.create({
            data: { chatId: activeChatId, role: 'user', content: lastUser.content },
          })
        }
      } catch {
        // DB unavailable
      }
    }

    // ── Streaming response ─────────────────────────────────────────
    if (wantStream) {
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            let fullResponse = ''
            for await (const chunk of streamMetaAI(fullMessages, model)) {
              fullResponse += chunk
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
            }

            if (userId && activeChatId && db) {
              try {
                await db.message.create({
                  data: { chatId: activeChatId, role: 'assistant', content: fullResponse },
                })
                await db.user.update({
                  where: { id: userId },
                  data: { messagesUsed: { increment: 1 } },
                })
              } catch { /* DB unavailable */ }
            } else if (guestId && db) {
              try {
                await db.guestSession.update({
                  where: { guestId },
                  data: { messagesUsed: { increment: 1 }, lastSeen: new Date() },
                })
              } catch { /* DB unavailable */ }
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ done: true, chatId: activeChatId })}\n\n`)
            )
            controller.close()
          } catch (err: any) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: err.message ?? 'Erreur IA' })}\n\n`)
            )
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // ── Non-streaming ──────────────────────────────────────────────
    const response = await chatWithMetaAI(fullMessages, model)

    if (userId && activeChatId && db) {
      try {
        await db.message.create({
          data: { chatId: activeChatId, role: 'assistant', content: response },
        })
        await db.user.update({
          where: { id: userId },
          data: { messagesUsed: { increment: 1 } },
        })
      } catch { /* DB unavailable */ }
    } else if (guestId && db) {
      try {
        await db.guestSession.update({
          where: { guestId },
          data: { messagesUsed: { increment: 1 }, lastSeen: new Date() },
        })
      } catch { /* DB unavailable */ }
    }

    return NextResponse.json({ message: response, chatId: activeChatId })
  } catch (err: any) {
    console.error('[CHAT API]', err)
    const msg = err?.message ?? 'Erreur interne du serveur'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
