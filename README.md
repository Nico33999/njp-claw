# NJP CLAW — Plateforme IA propulsée par Meta AI

Plateforme conversationnelle complète utilisant Meta AI (Llama 3.1) nativement, sans inscription requise pour les accès de base.

## Stack technique

- **Frontend** : Next.js 14 (App Router) + React 18 + Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : SQLite via Prisma
- **Auth** : NextAuth.js (credentials + OAuth Google/GitHub)
- **Paiements** : Stripe (abonnements)
- **IA** : Meta AI / Llama 3.1 (8B free → 70B Pro → 405B Ultimate)

## Plans

| Plan | Modèle | Messages | Prix |
|------|--------|----------|------|
| **Gratuit (invité)** | Llama 3.1 8B | 5/session | Gratuit, sans compte |
| **Gratuit (compte)** | Llama 3.1 8B | 20/jour | Gratuit |
| **Pro** | Llama 3.1 70B | 500/jour | 9,99€/mois |
| **Ultimate** | Llama 3.1 405B | Illimité | 29,99€/mois |

## Installation

```bash
# 1. Cloner et installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés

# 3. Initialiser la base de données
npx prisma db push

# 4. Lancer en développement
npm run dev
```

## Configuration de l'IA

### Option 1 : Ollama (recommandé, local)
```bash
# Installer Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.1

# Dans .env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

### Option 2 : Together AI (cloud, gratuit)
```bash
# Dans .env
TOGETHER_API_KEY=your_key_here
```

### Option 3 : Meta AI Web (automatique)
La plateforme tente automatiquement l'API web de Meta AI en premier.

## Variables d'environnement

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# Optionnel : OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# Stripe (pour les paiements)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ULTIMATE_PRICE_ID="price_..."

# Ollama (optionnel)
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.1"

# Together AI (optionnel)
TOGETHER_API_KEY=""
```
