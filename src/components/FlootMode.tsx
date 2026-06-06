'use client';

import { useState } from 'react';
import { Target, Zap, Bug, Search, Rocket, Layers } from 'lucide-react';

export function FlootMode({ onActivate }: { onActivate: (mode: string) => void }) {
  const features = [
    { id: 'plan-build', label: 'Plan + Build itératif', icon: Target, desc: 'L\'IA fait un plan étape par étape puis construit' },
    { id: 'auto-fix', label: 'Auto-Fix & Debug', icon: Bug, desc: 'Détecte les bugs et les corrige automatiquement' },
    { id: 'fullstack', label: 'Full-Stack (DB + Auth)', icon: Layers, desc: 'Génère base de données + authentification' },
    { id: 'seo', label: 'SEO & Growth Tools', icon: Search, desc: 'Sitemap, meta tags, analytics intégrés' },
    { id: 'one-click-deploy', label: 'One-Click Deploy', icon: Rocket, desc: 'Déploiement Vercel / Production ready' },
  ];

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="font-bold text-xl">Mode Floot</div>
          <div className="text-xs text-white/50">Toutes les fonctionnalités avancées</div>
        </div>
      </div>

      <div className="space-y-2">
        {features.map((f) => (
          <button
            key={f.id}
            onClick={() => onActivate(f.id)}
            className="w-full flex items-start gap-4 p-4 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 text-left transition-all group"
          >
            <div className="mt-0.5 text-violet-400 group-hover:text-violet-300">
              <f.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">{f.label}</div>
              <div className="text-sm text-white/60">{f.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 text-center text-[10px] text-white/40">
        Mode Floot = Expérience YC S25 • Full power
      </div>
    </div>
  );
}
