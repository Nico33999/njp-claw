import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chatWithMetaAI, streamMetaAI, ChatMessage } from '@/lib/meta-ai'
import { PLANS, GUEST_MESSAGES_PER_SESSION } from '@/lib/plans'

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

    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    const userPlan = ((session?.user as any)?.plan as string) ?? 'FREE'

    // ── Rate limiting ──────────────────────────────────────────────
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

      const plan = PLANS[user.plan as keyof typeof PLANS]
      if (plan.messagesPerDay !== -1 && user.messagesUsed >= plan.messagesPerDay) {
        return NextResponse.json(
          {
            error: 'Limite de messages atteinte',
            upgrade: true,
            limit: plan.messagesPerDay,
          },
          { status: 429 }
        )
      }
    } else {
      // Guest session
      if (!guestId) {
        return NextResponse.json({ error: 'Session invité requise' }, { status: 400 })
      }
      let guest = await prisma.guestSession.findUnique({ where: { guestId } })
      if (!guest) {
        guest = await prisma.guestSession.create({ data: { guestId } })
      }
      if (guest.messagesUsed >= GUEST_MESSAGES_PER_SESSION) {
        return NextResponse.json(
          {
            error: `Limite de ${GUEST_MESSAGES_PER_SESSION} messages atteinte pour les invités`,
            upgrade: true,
            register: true,
            limit: GUEST_MESSAGES_PER_SESSION,
          },
          { status: 429 }
        )
      }
    }

    // ── Determine model ────────────────────────────────────────────
    const plan = userId ? PLANS[userPlan as keyof typeof PLANS] ?? PLANS.FREE : PLANS.FREE
    const model = plan.model

    // ── Add system prompt ──────────────────────────────────────────
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

    // ── Save to DB (chat + user message) ──────────────────────────
    let activeChatId = chatId
    if (userId) {
      if (!activeChatId) {
        const firstContent = messages.find((m) => m.role === 'user')?.content ?? 'Nouvelle conv.'
        const chat = await prisma.chat.create({
          data: {
            userId,
            model,
            title: firstContent.slice(0, 60),
          },
        })
        activeChatId = chat.id
      }
      const lastUser = [...messages].reverse().find((m) => m.role === 'user')
      if (lastUser) {
        await prisma.message.create({
          data: { chatId: activeChatId!, role: 'user', content: lastUser.content },
        })
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

            // Save assistant message + increment counter
            if (userId && activeChatId) {
              await prisma.message.create({
                data: { chatId: activeChatId, role: 'assistant', content: fullResponse },
              })
              await prisma.user.update({
                where: { id: userId },
                data: { messagesUsed: { increment: 1 } },
              })
            } else if (guestId) {
              await prisma.guestSession.update({
                where: { guestId },
                data: { messagesUsed: { increment: 1 }, lastSeen: new Date() },
              })
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ done: true, chatId: activeChatId })}\n\n`)
            )
            controller.close()
          } catch (err) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: 'Erreur lors de la génération' })}\n\n`
              )
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

    // ── Non-streaming response ─────────────────────────────────────
    const response = await chatWithMetaAI(fullMessages, model)

    if (userId && activeChatId) {
      await prisma.message.create({
        data: { chatId: activeChatId, role: 'assistant', content: response },
      })
      await prisma.user.update({
        where: { id: userId },
        data: { messagesUsed: { increment: 1 } },
      })
    } else if (guestId) {
      await prisma.guestSession.update({
        where: { guestId },
        data: { messagesUsed: { increment: 1 }, lastSeen: new Date() },
      })
    }

    return NextResponse.json({ message: response, chatId: activeChatId })
  } catch (err: any) {
    console.error('[CHAT API]', err)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
