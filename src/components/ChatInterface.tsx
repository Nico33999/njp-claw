'use client'
// ... existing imports

import { MobileBuilderMode } from './MobileBuilderMode';

// Add new state
// const [mobileMode, setMobileMode] = useState<'pro' | 'max' | null>(null);

// In the top bar or expert settings, add:
// <MobileBuilderMode onModeSelect={setMobileMode} currentMode={mobileMode} />

// Update the system prompt logic to include mobile instructions when mobileMode is set
// Example in sendMessage or API call:
// if (mobileMode) {
//   systemPrompt += `\n\nMODE MOBILE ACTIF: Tu es maintenant en mode Rork. Génère des applications React Native + Expo complètes et production-ready pour iOS et Android. Utilise Expo Router pour la navigation, des composants modernes, et fournis un code propre et structuré.`;
// }

// Also add a helper function to generate Expo Snack link from generated code
// This makes the preview truly live like Rork

export function generateExpoSnackUrl(code: string): string {
  const encoded = encodeURIComponent(code);
  return `https://snack.expo.dev/?platform=ios&name=NJP%20Mobile&dependencies=expo-router%40%2A,react-native-safe-area-context%40%2A,lucide-react-native%40%2A&code=${encoded}`;
}
