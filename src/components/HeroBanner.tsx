import React from 'react';
import { Play, Sparkles } from 'lucide-react';
import { User } from '../types';

interface HeroBannerProps {
  currentUser: User | null;
  onExploreClick: () => void;
  onHowItWorksClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  currentUser,
  onExploreClick,
  onHowItWorksClick,
}) => {
  return (
    <section className="space-y-4 py-2">
      {/* Pill greeting matching Image 2 */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-950/70 border border-purple-800/40 text-xs font-semibold text-purple-200">
        <span>
          {currentUser ? `Bem-vinda, ${currentUser.name.split(' ')[0]}!` : 'Bem-vindo ao Review!'}
        </span>
        <span>👋</span>
      </div>

      {/* Main Title matching Image 2 */}
      <div className="space-y-0.5">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
          Descubra.
          <br />
          <span className="text-purple-400">Avalie.</span>
          <br />
          Recomende.
        </h1>
      </div>

      {/* Subtitle matching Image 2 */}
      <p className="text-zinc-300 text-xs sm:text-sm max-w-sm leading-relaxed">
        A comunidade que te ajuda a escolher melhor, todos os dias.
      </p>

      {/* Action Buttons matching Image 2 */}
      <div className="flex items-center gap-3 pt-2">
        <button
          id="hero-explore-btn"
          onClick={onExploreClick}
          className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/40 transition-all cursor-pointer"
        >
          Explorar avaliações
        </button>

        <button
          id="hero-how-it-works-btn"
          onClick={onHowItWorksClick}
          className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-zinc-200" />
          <span>Ver como funciona</span>
        </button>
      </div>
    </section>
  );
};
