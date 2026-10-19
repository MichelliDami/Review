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
  CheckCircle2,
  ChevronRight,
  Shield,
  MoreHorizontal,
} from 'lucide-react';
import { User, CategoryItem } from '../types';

interface CategoriesSidebarProps {
  categories: CategoryItem[];
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
  currentUser: User | null;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenAuthModal: () => void;
}

export const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  currentUser,
  onOpenProfile,
  onOpenAdmin,
  onOpenAuthModal,
}) => {
  // Mapping of category icon names
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop':
        return <Laptop className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4" />;
      case 'Dumbbell':
        return <Dumbbell className="w-4 h-4" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'Film':
        return <Film className="w-4 h-4" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'Music':
        return <Music className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  return (
    <aside className="space-y-5">
      {/* 1. CATEGORIES CARD (Matching Image 2 top right) */}
      <div className="cosmic-card rounded-2xl p-4 border border-purple-900/40">
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
          <h3 className="text-sm font-bold text-white tracking-tight">Categorias</h3>
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
          >
            Ver todas
          </button>
        </div>

        <div className="mt-3 space-y-1">
          {categories.slice(0, 10).map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                id={`cat-filter-${cat.id}`}
                onClick={() => onSelectCategory(isSelected ? null : cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-purple-950/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isSelected ? 'text-purple-300' : 'text-purple-400/80'}>
                    {renderIcon(cat.iconName)}
                  </span>
                  <span>{cat.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 opacity-60" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. USER PROFILE CARD (Matching Image 2 bottom right) */}
      <div className="cosmic-card rounded-2xl p-5 border border-purple-900/40 text-center relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 text-left">
          <h3 className="text-sm font-bold text-white">Seu perfil</h3>
        </div>

        {currentUser ? (
          <div className="mt-2 flex flex-col items-center">
            {/* Avatar with verified badge */}
            <div className="relative mb-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-purple-500 shadow-lg shadow-purple-900/40"
                referrerPolicy="no-referrer"
              />
              {currentUser.isVerified && (
                <div className="absolute bottom-0 right-0 p-1 bg-[#140c2a] rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                </div>
              )}
            </div>

            {/* Name & Handle */}
            <div className="flex items-center gap-1.5 justify-center">
              <h4 className="text-base font-bold text-white">{currentUser.name.split(' ')[0]}</h4>
              {currentUser.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-400/20" />
              )}
            </div>
            <p className="text-xs text-purple-300">@{currentUser.username}</p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4 py-3 border-y border-purple-900/40 text-center">
              <div>
                <span className="block text-sm font-extrabold text-white">
                  {currentUser.reviewCount}
                </span>
                <span className="text-[10px] text-zinc-400">avaliações</span>
              </div>
              <div>
                <span className="block text-sm font-extrabold text-white">
                  {currentUser.followersCount}
                </span>
                <span className="text-[10px] text-zinc-400">seguidores</span>
              </div>
              <div>
                <span className="block text-sm font-extrabold text-white">
                  {currentUser.followingCount}
                </span>
                <span className="text-[10px] text-zinc-400">seguindo</span>
              </div>
            </div>

            {/* View Profile Action */}
            <button
              id="sidebar-view-profile-btn"
              onClick={onOpenProfile}
              className="w-full mt-4 py-2 px-4 rounded-xl text-xs font-bold text-white bg-purple-600/50 hover:bg-purple-600 border border-purple-500/40 transition-all cursor-pointer shadow-md shadow-purple-900/30"
            >
              Ver meu perfil
            </button>

            {/* Admin Badge & Link if Nicole */}
            {currentUser.isAdmin && (
              <button
                id="sidebar-open-admin-btn"
                onClick={onOpenAdmin}
                className="w-full mt-2 py-2 px-4 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Painel Administrativo</span>
              </button>
            )}
          </div>
        ) : (
          <div className="mt-2 py-4 flex flex-col items-center">
            <p className="text-xs text-zinc-300 mb-3">
              Entre para publicar suas avaliações, seguir criadores e salvar seus produtos favoritos.
            </p>
            <button
              id="sidebar-login-prompt-btn"
              onClick={onOpenAuthModal}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors cursor-pointer"
            >
              Entrar ou Criar conta
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
