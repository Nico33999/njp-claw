'use client';

import { useState } from 'react';
import { Smartphone, Download, ExternalLink, Zap } from 'lucide-react';

interface MobileBuilderModeProps {
  onModeSelect: (mode: 'pro' | 'max') => void;
  currentMode?: 'pro' | 'max' | null;
}

export function MobileBuilderMode({ onModeSelect, currentMode }: MobileBuilderModeProps) {
  return (
    <div className="glass-strong rounded-2xl p-5 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">Mode Mobile App Builder</h3>
          <p className="text-xs text-white/50">Comme Rork • iOS + Android natif</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Rork Pro - React Native + Expo */}
        <button
          onClick={() => onModeSelect('pro')}
          className={`p-4 rounded-xl border text-left transition-all ${currentMode === 'pro' 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-white">Rork Pro</span>
          </div>
          <div className="text-xs text-white/60 space-y-1">
            <div>• React Native + Expo</div>
            <div>• iOS + Android + Web</div>
            <div>• Production ready</div>
            <div>• Expo Snack preview</div>
          </div>
          <div className="mt-3 text-[10px] text-blue-400 font-medium">Recommandé pour la plupart des apps</div>
        </button>

        {/* Rork Max - Native iOS SwiftUI */}
        <button
          onClick={() => onModeSelect('max')}
          className={`p-4 rounded-xl border text-left transition-all ${currentMode === 'max' 
            ? 'border-purple-500 bg-purple-500/10' 
            : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-white">Rork Max</span>
          </div>
          <div className="text-xs text-white/60 space-y-1">
            <div>• Native SwiftUI (iOS)</div>
            <div>• Apple platforms complets</div>
            <div>• Widgets, Live Activities, AR</div>
            <div>• Meilleur design Apple</div>
          </div>
          <div className="mt-3 text-[10px] text-purple-400 font-medium">Pour apps iOS premium</div>
        </button>
      </div>

      <div className="mt-4 text-[10px] text-white/40 flex items-center gap-2">
        <Download className="w-3 h-3" />
        Export complet prêt pour App Store / Play Store
      </div>
    </div>
  );
}
