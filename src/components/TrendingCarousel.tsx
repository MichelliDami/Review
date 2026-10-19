import React, { useRef } from 'react';
import { Flame, Star, Bookmark, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface TrendingCarouselProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewAllTrending: () => void;
  selectedCategory?: string | null;
}

export const TrendingCarousel: React.FC<TrendingCarouselProps> = ({
  products,
  onSelectProduct,
  onViewAllTrending,
  selectedCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase())
    : products;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Flame className="w-5 h-5 text-purple-400 fill-purple-400/20" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Em alta</h3>
          {selectedCategory && (
            <span className="text-xs text-purple-300 font-normal">({selectedCategory})</span>
          )}
        </div>
        {filteredProducts.length > 0 && (
          <button
            onClick={onViewAllTrending}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="cosmic-card rounded-2xl p-4 sm:p-5 border border-purple-900/40 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-900/30 text-purple-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Nenhum item em alta no momento</p>
            <p className="text-[11px] text-zinc-400">
              Conforme você e outros membros avaliarem perfumes, tecnologia, moda e lojas, eles aparecerão em destaque aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-purple-950/90 border border-purple-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-900 shadow-xl cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Carousel Container */}
          <div
            ref={scrollRef}
            className="flex items-stretch gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="w-44 sm:w-52 shrink-0 cosmic-card rounded-2xl p-3 snap-start cursor-pointer cosmic-card-hover flex flex-col justify-between group/card relative"
              >
                {/* Image & Bookmark */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-purple-950/40 mb-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm text-zinc-300 hover:text-purple-400 transition-colors"
                    title="Salvar produto"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info */}
                <div>
                  <span className="text-[11px] font-medium text-purple-400 uppercase tracking-wider block">
                    {product.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover/card:text-purple-300 transition-colors line-clamp-1 mt-0.5">
                    {product.name}
                  </h4>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      ({product.reviewCount} {product.reviewCount === 1 ? 'avaliação' : 'avaliações'})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-purple-950/90 border border-purple-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-900 shadow-xl cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};
