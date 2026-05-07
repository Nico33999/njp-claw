export const PLANS = {
  FREE: {
    name: 'Gratuit',
    messagesPerDay: 20,
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    modelLabel: 'NJP Standard',
    features: [
      '20 messages / jour',
      'Moteur NJP Standard',
      'Accès sans inscription',
      'Mode Novice & Expert',
    ],
    price: 0,
    priceId: null,
  },
  PRO: {
    name: 'Pro',
    messagesPerDay: 500,
    model: 'meta-llama/Llama-3.1-70B-Instruct',
    modelLabel: 'NJP Pro',
    features: [
      '500 messages / jour',
      'Moteur NJP Pro (8× plus puissant)',
      'Historique persistant',
      'Export des conversations',
      'Bibliothèque de prompts',
      'Support email',
    ],
    price: 9.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  ULTIMATE: {
    name: 'Ultimate',
    messagesPerDay: -1,
    model: 'meta-llama/Meta-Llama-3.1-405B-Instruct',
    modelLabel: 'NJP Ultimate',
    features: [
      'Messages illimités',
      'Moteur NJP Ultimate (le plus puissant)',
      'Historique illimité',
      'Export multi-format',
      'Accès API personnel',
      'Support prioritaire 24/7',
    ],
    price: 29.99,
    priceId: process.env.STRIPE_ULTIMATE_PRICE_ID,
  },
} as const

export type PlanKey = keyof typeof PLANS

export const GUEST_MESSAGES_PER_SESSION = 5
