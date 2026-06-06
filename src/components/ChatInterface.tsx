// Add import
// import { FlootMode } from './FlootMode';

// Add state
// const [flootMode, setFlootMode] = useState<string | null>(null);

// In the UI, you can show <FlootMode onActivate={setFlootMode} /> when user clicks a button

// When flootMode is active, append to system prompt:
// if (flootMode === 'plan-build') {
//   system += '\n\nMODE FLOOT PLAN+BUILD: Commence toujours par un plan étape par étape clair, puis construis itérativement. Montre le plan avant le code.';
// }
// if (flootMode === 'auto-fix') {
//   system += '\n\nMODE AUTO-FIX: Après chaque génération, analyse le code pour les bugs et propose des corrections.';
// }
// if (flootMode === 'fullstack') {
//   system += '\n\nMODE FULL-STACK: Génère toujours le schéma Prisma + routes API + authentification NextAuth.';
// }
// if (flootMode === 'seo') {
//   system += '\n\nMODE SEO: Ajoute meta tags, sitemap.xml, robots.txt et structured data.';
// }

// Also add a "Fix this bug" button next to the preview that sends the current code back to AI with "Fix and improve this code".
