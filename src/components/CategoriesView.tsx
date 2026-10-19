import React from 'react';
import {
  Laptop,
  Sparkles,
  Home,
  Shirt,
  Dumbbell,
  BookOpen,
  Film,
  Calendar,
  Gamepad2,
  Flame,
  Utensils,
  Music,
  Plane,
  Store,
  Star,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { CategoryItem, Product, Review } from '../types';

interface CategoriesViewProps {
  categories: CategoryItem[];
  products: Product[];
  reviews: Review[];
  selectedCategory: string | null;
  onSelectCategoryAndGoToFeed: (categoryName: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  reviews,
  selectedCategory,
  onSelectCategoryAndGoToFeed,
  onSelectProduct,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop': return <Laptop className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'Home': return <Home className="w-5 h-5" />;
      case 'Shirt': return <Shirt className="w-5 h-5" />;
      case 'Dumbbell': return <Dumbbell className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Film': return <Film className="w-5 h-5" />;
      case 'Utensils': return <Utensils className="w-5 h-5" />;
      case 'Calendar': return <Calendar className="w-5 h-5" />;
      case 'Music': return <Music className="w-5 h-5" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5" />;
      case 'Plane': return <Plane className="w-5 h-5" />;
      case 'Store': return <Store className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Explorar Nichos & Categorias
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Selecione uma categoria para ser direcionada imediatamente para as postagens e avaliações correspondentes no feed.
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const countReviews = reviews.filter(
            (r) => r.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
          ).length;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategoryAndGoToFeed(cat.name)}
              className="p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden group cosmic-card border-purple-900/40 hover:border-purple-500 hover:scale-[1.02] shadow-lg hover:shadow-purple-900/30"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-950/70 text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 group-hover:text-purple-300">
                  <span>Ver postagens</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  {cat.name}
                </h4>
                <span className="text-[11px] text-zinc-400">
                  {countReviews > 0
                    ? `${countReviews} ${countReviews === 1 ? 'postagem' : 'postagens'}`
                    : 'Acessar nicho no feed'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
