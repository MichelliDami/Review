import React from 'react';
import { X, Search, Star, ShieldCheck, Heart } from 'lucide-react';
import { ReviewPlatformIllustration } from './ReviewPlatformIllustration';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onStart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl cosmic-card rounded-3xl overflow-hidden border border-purple-800/50 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-purple-950/60 hover:bg-purple-900 text-zinc-300 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-xs font-semibold text-purple-300">
            <span>Guia da Comunidade Review</span>
            <span>✨</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Como funciona o Review?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
            Uma rede social focada 100% em avaliações autênticas, transparentes e úteis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/40 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Descubra Nichos</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Filtre produtos e serviços de perfumes, moda, tecnologia, cinema e gastronomia.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/40 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Avalie como no Insta</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Publique fotos, notas de 1 a 5 estrelas e detalhe custo-benefício e qualidade no seu perfil.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/40 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Segurança +18</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ambiente moderado exclusivamente para maiores de 18 anos, livre de golpes e spam.
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={() => {
              onClose();
              onStart();
            }}
            className="py-3 px-8 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/40 cursor-pointer transition-all"
          >
            Começar a Explorar
          </button>
        </div>
      </div>
    </div>
  );
};
