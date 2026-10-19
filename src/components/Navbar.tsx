import React, { useState } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  Plus,
  Shield,
  User as UserIcon,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Settings,
  X,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCreateModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  onOpenSettings?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenCreateModal,
  onOpenAuthModal,
  onOpenAdmin,
  onOpenProfile,
  onOpenSettings,
  onLogout,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, text: 'Bem-vinda ao Review! Comece postando sua primeira avaliação.', time: '1m atrás' },
    { id: 2, text: 'Filtre nichos como Perfumes e Restaurantes para ver avaliações focadas.', time: '5m atrás' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d071d]/85 backdrop-blur-xl border-b border-purple-900/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            id="brand-logo-btn"
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-1.5 group cursor-pointer focus:outline-none"
          >
            <span className="text-2xl font-black tracking-tight text-white group-hover:text-purple-300 transition-colors">
              Review
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 group-hover:scale-125 transition-transform" />
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'inicio', label: 'Início' },
              { id: 'descobrir', label: 'Descobrir' },
              { id: 'categorias', label: 'Categorias' },
              { id: 'em-alta', label: 'Em alta' },
            ].map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'text-white bg-purple-600/30 border border-purple-500/50 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-purple-950/40'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Search input (Lupa de pesquisa - Requirement 4) */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/80" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Buscar produtos, perfumes, tecnologia, lojas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-16 py-2 text-xs md:text-sm bg-purple-950/40 border border-purple-900/60 rounded-full text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300 hover:text-white cursor-pointer px-1 py-0.5 rounded hover:bg-purple-900/40"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Right actions: Post review button, Notifications, Settings, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser && (
            <button
              id="create-review-nav-btn"
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-bold rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Avaliar</span>
            </button>
          )}

          {/* Admin quick access button if user is Nicole/Admin */}
          {currentUser?.isAdmin && (
            <button
              id="nav-admin-panel-quick-btn"
              onClick={onOpenAdmin}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
              title="Acessar Painel de Moderação e Relatórios"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Painel ADM</span>
            </button>
          )}

          {/* Notifications button */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserDropdownOpen(false);
              }}
              className="p-2 text-zinc-300 hover:text-white rounded-full hover:bg-purple-950/60 relative transition-colors cursor-pointer"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
            </button>

            {/* Notifications Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 cosmic-card rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 border border-purple-800/40">
                <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
                  <h4 className="text-sm font-semibold text-white">Notificações</h4>
                  <span className="text-xs text-purple-300">Recentes</span>
                </div>
                <div className="mt-2 space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 transition-colors cursor-pointer text-xs"
                    >
                      <p className="text-zinc-200">{n.text}</p>
                      <span className="text-[10px] text-purple-400 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings button (Requirement 8) */}
          {onOpenSettings && (
            <button
              id="nav-settings-btn"
              onClick={onOpenSettings}
              className="p-2 text-zinc-300 hover:text-white rounded-full hover:bg-purple-950/60 transition-colors cursor-pointer"
              title="Configurações do Site"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          {/* User Profile / Login */}
          {currentUser ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-purple-950/60 border border-purple-900/40 transition-colors cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-purple-400/50"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-semibold text-white hidden sm:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
                {currentUser.isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
                )}
                <ChevronDown className="w-3.5 h-3.5 text-purple-300" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 cosmic-card rounded-2xl p-2 shadow-2xl z-50 border border-purple-800/40">
                  <div className="p-3 border-b border-purple-900/40">
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      {currentUser.name}
                      {currentUser.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
                      )}
                    </p>
                    <p className="text-xs text-purple-300">@{currentUser.username}</p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">{currentUser.email}</p>
                    {currentUser.isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-full">
                        Administradora
                      </span>
                    )}
                  </div>

                  <div className="py-1.5 space-y-1">
                    <button
                      id="dropdown-profile-btn"
                      onClick={() => {
                        onOpenProfile();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-purple-900/40 rounded-xl transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-purple-400" />
                      <span>Meu Perfil</span>
                    </button>

                    <button
                      id="dropdown-create-btn"
                      onClick={() => {
                        onOpenCreateModal();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-purple-900/40 rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-purple-400" />
                      <span>Fazer Nova Avaliação</span>
                    </button>

                    {onOpenSettings && (
                      <button
                        id="dropdown-settings-btn"
                        onClick={() => {
                          onOpenSettings();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-purple-900/40 rounded-xl transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-purple-400" />
                        <span>Configurações</span>
                      </button>
                    )}

                    {currentUser.isAdmin && (
                      <button
                        id="dropdown-admin-btn"
                        onClick={() => {
                          onOpenAdmin();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/20 rounded-xl transition-colors cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Painel Administrativo</span>
                      </button>
                    )}

                    <div className="border-t border-purple-900/40 my-1" />

                    <button
                      id="dropdown-logout-btn"
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="nav-login-btn"
              onClick={onOpenAuthModal}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer shadow-md shadow-purple-600/30"
            >
              Entrar
            </button>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="sm:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/80" />
          <input
            type="text"
            placeholder="Buscar perfumes, tecnologia, lojas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-2 text-xs bg-purple-950/50 border border-purple-900/60 rounded-full text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
