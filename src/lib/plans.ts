export const PLANS = {
  FREE: {
    name: 'Gratuit',
    messagesPerDay: 20,
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    modelLabel: 'Llama 3.1 8B',
    features: [
      '20 messages / jour',
      'Modèle Llama 3.1 8B',
      'Accès sans inscription',
      'Historique de la session',
    ],
    limitations: [
      'Pas d\'historique persistant',
      'Modèle basique',
    ],
    price: 0,
    priceId: null,
  },
  PRO: {
    name: 'Pro',
    messagesPerDay: 500,
    model: 'meta-llama/Llama-3.1-70B-Instruct',
    modelLabel: 'Llama 3.1 70B',
    features: [
      '500 messages / jour',
      'Modèle Llama 3.1 70B',
      'Historique persistant',
      'Export des conversations',
      'Priorité de traitement',
      'Support email',
    ],
    limitations: [],
    price: 9.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  ULTIMATE: {
    name: 'Ultimate',
    messagesPerDay: -1,
    model: 'meta-llama/Meta-Llama-3.1-405B-Instruct',
    modelLabel: 'Llama 3.1 405B',
    features: [
      'Messages illimités',
      'Modèle Llama 3.1 405B (le + puissant)',
      'Historique illimité',
      'Export multi-format',
      'Accès API personnel',
      'Support prioritaire 24/7',
      'Accès aux nouvelles fonctionnalités en avant-première',
    ],
    limitations: [],
    price: 29.99,
    priceId: process.env.STRIPE_ULTIMATE_PRICE_ID,
  },
} as const

export type PlanKey = keyof typeof PLANS

export const GUEST_MESSAGES_PER_SESSION = 5
