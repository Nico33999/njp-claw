import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalide' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan
      if (userId && plan) {
        const messagesLimit =
          plan === 'ULTIMATE' ? 999999 : plan === 'PRO' ? 500 : 20
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: plan as any,
            stripeSubscriptionId: session.subscription as string,
            messagesLimit,
            messagesUsed: 0,
          },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: sub.id },
      })
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: 'FREE', stripeSubscriptionId: null, messagesLimit: 20, messagesUsed: 0 },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
