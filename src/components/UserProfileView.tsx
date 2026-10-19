import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  Grid,
  List,
  Bookmark,
  Heart,
  Plus,
  ArrowLeft,
  Share2,
  Edit3,
  ExternalLink,
  ShoppingBag,
  MapPin,
  Trash2,
} from 'lucide-react';
import { User, Review, Product } from '../types';
import { EditProfileModal } from './EditProfileModal';

interface UserProfileViewProps {
  user: User;
  currentUser: User | null;
  reviews: Review[];
  onOpenCreateReview: () => void;
  onSelectProductByName: (productName: string) => void;
  onBack: () => void;
  onUpdateUser?: (updatedUser: User) => void;
  onDeleteReview?: (reviewId: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  currentUser,
  reviews,
  onOpenCreateReview,
  onSelectProductByName,
  onBack,
  onUpdateUser,
  onDeleteReview,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'likes'>('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);

  // Filter reviews by this user
  const userReviews = reviews.filter((r) => r.userHandle === user.username || r.userId === user.id);
  const bookmarkedReviews = reviews.filter((r) => r.hasBookmarked);
  const likedReviews = reviews.filter((r) => r.hasLiked);

  const displayedReviews =
    activeTab === 'posts'
      ? userReviews
      : activeTab === 'saved'
      ? bookmarkedReviews
      : likedReviews;

  const filteredByNiche = selectedNiche
    ? displayedReviews.filter((r) => r.category.toLowerCase() === selectedNiche.toLowerCase())
    : displayedReviews;

  const isOwnProfile = currentUser?.username === user.username || currentUser?.id === user.id;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Top back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Feed</span>
      </button>

      {/* Profile Header (Instagram style) */}
      <div className="cosmic-card rounded-3xl p-6 sm:p-8 border border-purple-800/40 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl -z-10" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/* Avatar with gradient ring */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-amber-400">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover border-2 border-[#120826]"
                referrerPolicy="no-referrer"
              />
            </div>
            {user.isVerified && (
              <div className="absolute bottom-1 right-1 p-1 bg-[#120826] rounded-full">
                <CheckCircle2 className="w-5 h-5 text-purple-400 fill-purple-400/20" />
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">{user.name}</h2>
                  {user.isVerified && (
                    <CheckCircle2 className="w-5 h-5 text-purple-400 fill-purple-400/20" />
                  )}
                  {user.isAdmin && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-600/40 text-purple-200 border border-purple-500/40">
                      Administradora
                    </span>
                  )}
                </div>
                <p className="text-xs text-purple-300 mt-0.5">@{user.username}</p>
              </div>

              {/* Action buttons (Instagram style: Editar Perfil / Nova Avaliação) */}
              <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
                {isOwnProfile ? (
                  <>
                    <button
                      id="profile-edit-btn"
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white bg-purple-950/70 hover:bg-purple-900/80 border border-purple-800/60 shadow-sm transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Editar Perfil</span>
                    </button>

                    <button
                      id="profile-create-review-btn"
                      onClick={onOpenCreateReview}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nova Avaliação</span>
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          setCopiedProfileLink(true);
                          setTimeout(() => setCopiedProfileLink(false), 2500);
                        }}
                        className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                        title="Compartilhar Perfil"
                      >
                        <Share2 className="w-4 h-4" />
                        {copiedProfileLink && (
                          <span className="text-[10px] text-emerald-400 font-bold animate-in fade-in">Copiado!</span>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <button className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all cursor-pointer">
                    Seguir
                  </button>
                )}
              </div>
            </div>

            {/* Counters Row */}
            <div className="flex items-center justify-center sm:justify-start gap-6 text-xs py-1">
              <div>
                <strong className="text-white font-extrabold">{userReviews.length}</strong>{' '}
                <span className="text-zinc-400">avaliações</span>
              </div>
              <div>
                <strong className="text-white font-extrabold">{user.followersCount}</strong>{' '}
                <span className="text-zinc-400">seguidores</span>
              </div>
              <div>
                <strong className="text-white font-extrabold">{user.followingCount}</strong>{' '}
                <span className="text-zinc-400">seguindo</span>
              </div>
            </div>

            {/* Bio */}
            {user.bio ? (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
                {user.bio}
              </p>
            ) : isOwnProfile ? (
              <p className="text-xs text-purple-400 italic cursor-pointer hover:underline" onClick={() => setIsEditModalOpen(true)}>
                + Adicionar uma biografia ao seu perfil...
              </p>
            ) : null}

            {/* Interests badges */}
            {user.interests && user.interests.length > 0 && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap pt-1">
                {user.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-900/50"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs and Layout Toggle */}
      <div className="flex items-center justify-between border-b border-purple-900/50 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-4 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'posts'
                ? 'border-purple-500 text-white font-extrabold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Avaliações ({userReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'saved'
                ? 'border-purple-500 text-white font-extrabold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Salvos ({bookmarkedReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'likes'
                ? 'border-purple-500 text-white font-extrabold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Curtidas ({likedReviews.length})
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-purple-950/40 p-1 rounded-xl border border-purple-900/30">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            title="Grade de fotos"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            title="Lista detalhada"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reviews Content */}
      {filteredByNiche.length === 0 ? (
        <div className="cosmic-card p-12 text-center rounded-3xl border border-purple-900/40 space-y-3">
          <p className="text-zinc-300 text-sm font-semibold">Nenhuma avaliação nesta seção ainda.</p>
          <p className="text-zinc-500 text-xs max-w-sm mx-auto">
            Compartilhe sua experiência sobre um produto, loja, restaurante ou perfume para inspirar a comunidade.
          </p>
          {isOwnProfile && (
            <button
              onClick={onOpenCreateReview}
              className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              Publicar Minha Primeira Avaliação
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Instagram-style 3-Column Grid with overlay */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {filteredByNiche.map((rev) => (
            <div
              key={rev.id}
              onClick={() => onSelectProductByName(rev.productName)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-purple-950/40 border border-purple-900/40 cursor-pointer cosmic-card-hover"
            >
              {rev.images && rev.images.length > 0 ? (
                <img
                  src={rev.images[0]}
                  alt={rev.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-purple-950/60 to-[#140b2a]">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{rev.category}</span>
                  <p className="text-xs text-zinc-300 line-clamp-4 italic">"{rev.content}"</p>
                  <span className="text-xs font-bold text-white">{rev.productName}</span>
                </div>
              )}

              {/* Rating pill top left */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-amber-300 flex items-center gap-1 z-10">
                <Star className="w-3 h-3 fill-amber-300" />
                <span>{rev.rating.toFixed(1)}</span>
              </div>

              {/* Trash button top right for admin or author */}
              {onDeleteReview && (currentUser?.isAdmin || (currentUser && (currentUser.id === rev.userId || currentUser.username.toLowerCase() === rev.userHandle.toLowerCase()))) && (
                <div className="absolute top-2.5 right-2.5 z-20" onClick={(e) => e.stopPropagation()}>
                  {confirmDeleteId === rev.id ? (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-red-950 border border-red-500 text-[10px] shadow-lg">
                      <span className="text-red-200 font-bold">Apagar?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteReview(rev.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 cursor-pointer"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(rev.id)}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600/80 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Apagar esta avaliação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Hover Dark Overlay (Instagram style) */}
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5 text-center">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                    {rev.category}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {rev.productName}
                  </h4>
                  <p className="text-[11px] text-zinc-300 line-clamp-2 mt-1 italic">
                    "{rev.content}"
                  </p>
                  {rev.purchaseInfo && (
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700/50 text-[10px] text-emerald-300">
                      <ShoppingBag className="w-2.5 h-2.5" />
                      <span>{rev.purchaseInfo.storeName} • {rev.purchaseInfo.priceFormatted || 'Preço indicado'}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-4 text-xs font-bold text-white">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    {rev.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 fill-white" />
                    {rev.bookmarksCount || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode */
        <div className="space-y-3">
          {filteredByNiche.map((rev) => (
            <div
              key={rev.id}
              onClick={() => onSelectProductByName(rev.productName)}
              className="p-4 rounded-2xl cosmic-card border border-purple-900/40 flex items-center justify-between gap-4 cursor-pointer hover:border-purple-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                {rev.images && rev.images.length > 0 ? (
                  <img
                    src={rev.images[0]}
                    alt={rev.productName}
                    className="w-14 h-14 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-purple-950/60 flex items-center justify-center text-purple-400 font-bold text-xs border border-purple-900/50">
                    {rev.category.slice(0, 3)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                      {rev.category}
                    </span>
                    {rev.purchaseInfo && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                        <ShoppingBag className="w-2.5 h-2.5" />
                        {rev.purchaseInfo.storeName}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{rev.productName}</h4>
                  <p className="text-xs text-zinc-300 line-clamp-1 mt-0.5">"{rev.content}"</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs shrink-0">
                <div className="flex items-center gap-1 font-bold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{rev.rating.toFixed(1)}</span>
                </div>
                <span className="text-zinc-400">{rev.likes} likes</span>

                {onDeleteReview && (currentUser?.isAdmin || (currentUser && (currentUser.id === rev.userId || currentUser.username.toLowerCase() === rev.userHandle.toLowerCase()))) && (
                  confirmDeleteId === rev.id ? (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-red-950 border border-red-500/80 text-[10px]" onClick={(e) => e.stopPropagation()}>
                      <span className="text-red-200 font-bold">Apagar?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteReview(rev.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 cursor-pointer"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(rev.id);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                      title="Apagar postagem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isOwnProfile && currentUser && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentUser={currentUser}
          onSaveProfile={(updated) => {
            if (onUpdateUser) {
              onUpdateUser(updated);
            }
          }}
        />
      )}
    </div>
  );
};
