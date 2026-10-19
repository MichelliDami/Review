import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Star,
  CheckCircle2,
  MoreHorizontal,
  ChevronRight,
  Send,
  Flag,
  ShoppingBag,
  ExternalLink,
  Store,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';
import { Review, User } from '../types';

interface FeedSectionProps {
  reviews: Review[];
  currentUser: User | null;
  onLikeReview: (reviewId: string) => void;
  onBookmarkReview: (reviewId: string) => void;
  onAddComment: (reviewId: string, text: string) => void;
  onReportReview: (reviewId: string) => void;
  onSelectProductByName: (productName: string) => void;
  onSelectUser: (userHandle: string) => void;
  onSelectCategory?: (category: string) => void;
  onOpenCreateReview?: () => void;
  onDeleteReview?: (reviewId: string) => void;
  activeCategory?: string | null;
}

export const FeedSection: React.FC<FeedSectionProps> = ({
  reviews,
  currentUser,
  onLikeReview,
  onBookmarkReview,
  onAddComment,
  onReportReview,
  onSelectProductByName,
  onSelectUser,
  onSelectCategory,
  onOpenCreateReview,
  onDeleteReview,
  activeCategory,
}) => {
  const [activeFeedTab, setActiveFeedTab] = useState<'following' | 'explore'>('explore');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedLinkReviewId, setCopiedLinkReviewId] = useState<string | null>(null);

  const toggleComments = (reviewId: string) => {
    setExpandedComments((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  const handleSendComment = (reviewId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[reviewId]?.trim();
    if (!text) return;
    onAddComment(reviewId, text);
    setCommentInputs((prev) => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <section className="space-y-4">
      {/* Header and Feed toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveFeedTab('explore')}
            className={`text-sm sm:text-base font-bold transition-colors cursor-pointer ${
              activeFeedTab === 'explore'
                ? 'text-white border-b-2 border-purple-500 pb-1'
                : 'text-zinc-400 hover:text-white pb-1'
            }`}
          >
            Feed de Avaliações
          </button>
          <span className="text-zinc-600">•</span>
          <button
            onClick={() => setActiveFeedTab('following')}
            className={`text-sm sm:text-base font-bold transition-colors cursor-pointer ${
              activeFeedTab === 'following'
                ? 'text-white border-b-2 border-purple-500 pb-1'
                : 'text-zinc-400 hover:text-white pb-1'
            }`}
          >
            Pessoas que você segue
          </button>
        </div>

        {activeCategory && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-950/70 border border-purple-800/50 text-purple-300 font-semibold">
            Nicho: {activeCategory}
          </span>
        )}
      </div>

      {/* Reviews Stream */}
      <div className="space-y-5">
        {reviews.length === 0 ? (
          /* Engaging Empty State when no reviews exist */
          <div className="p-8 sm:p-12 text-center cosmic-card rounded-3xl border border-purple-800/40 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-950/60 border border-purple-600/40 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-900/30">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-base sm:text-lg font-bold text-white">
                {activeCategory
                  ? `Nenhuma avaliação encontrada em "${activeCategory}"`
                  : 'Nenhuma avaliação publicada ainda'}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Você pode ser a primeira pessoa a compartilhar uma avaliação sobre um perfume, roupa, eletrônico, loja ou restaurante!
              </p>
            </div>
            {onOpenCreateReview && (
              <button
                onClick={onOpenCreateReview}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Fazer Primeira Avaliação</span>
              </button>
            )}
          </div>
        ) : (
          reviews.map((review) => {
            const isCommentsOpen = !!expandedComments[review.id];
            const currentCommentText = commentInputs[review.id] || '';

            return (
              <article
                key={review.id}
                id={`review-card-${review.id}`}
                className="cosmic-card rounded-2xl p-4 sm:p-6 border border-purple-900/40 transition-all hover:border-purple-700/60 shadow-lg"
              >
                {/* Header: User Info + Time + Options Menu */}
                <div className="flex items-center justify-between pb-3.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onSelectUser(review.userHandle)}
                      className="relative group cursor-pointer"
                    >
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover border border-purple-500/40 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => onSelectUser(review.userHandle)}
                          className="text-xs sm:text-sm font-bold text-white hover:text-purple-300 transition-colors cursor-pointer"
                        >
                          @{review.userHandle}
                        </button>
                        {review.userVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
                        )}
                        <span className="text-[11px] text-zinc-400">avaliou</span>
                        <button
                          onClick={() => onSelectProductByName(review.productName)}
                          className="text-[11px] font-bold text-purple-300 hover:underline cursor-pointer"
                        >
                          {review.productName}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-zinc-500">{review.createdAt}</span>
                        {onSelectCategory && (
                          <button
                            onClick={() => onSelectCategory(review.category)}
                            className="text-[10px] text-purple-400 hover:text-purple-300 uppercase tracking-wider font-semibold cursor-pointer"
                          >
                            • {review.category}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Direct Trash Button (Admin or Author) + Options Menu */}
                  <div className="flex items-center gap-1.5">
                    {/* Direct Trash Can button */}
                    {onDeleteReview && (currentUser?.isAdmin || (currentUser && (currentUser.id === review.userId || currentUser.username.toLowerCase() === review.userHandle.toLowerCase()))) && (
                      <div className="relative">
                        {confirmDeleteId === review.id ? (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-red-950 border border-red-500/80 text-xs shadow-lg animate-in fade-in">
                            <span className="text-[11px] font-bold text-red-200">Excluir?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteReview(review.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] cursor-pointer shadow transition-colors"
                              title="Confirmar exclusão desta postagem"
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-[10px] cursor-pointer transition-colors"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(review.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors cursor-pointer group/trash"
                            title={currentUser?.isAdmin && review.userId !== currentUser.id ? 'Excluir postagem (Como Administradora)' : 'Excluir postagem'}
                          >
                            <Trash2 className="w-4 h-4 group-hover/trash:scale-110 transition-transform" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Context menu for report / options */}
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === review.id ? null : review.id)}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-purple-900/40 transition-colors cursor-pointer"
                        title="Mais opções"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {menuOpenId === review.id && (
                        <div className="absolute right-0 mt-1 w-48 cosmic-card rounded-xl p-1.5 shadow-2xl z-30 border border-purple-800/60 space-y-0.5">
                          {/* Delete post option (Admin can delete all, user can delete own) */}
                          {onDeleteReview && (currentUser?.isAdmin || (currentUser && (currentUser.id === review.userId || currentUser.username.toLowerCase() === review.userHandle.toLowerCase()))) && (
                            <button
                              onClick={() => {
                                onDeleteReview(review.id);
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span>{currentUser?.isAdmin && review.userId !== currentUser.id ? 'Apagar postagem (ADM)' : 'Apagar postagem'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              onReportReview(review.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-purple-900/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Flag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Reportar postagem</span>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(window.location.href);
                              setCopiedLinkReviewId(review.id);
                              setTimeout(() => setCopiedLinkReviewId(null), 2500);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-purple-900/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>Compartilhar link</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Review Content Box */}
                <div className="space-y-3.5">
                  {/* Text & rating info header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => onSelectProductByName(review.productName)}
                      className="text-base sm:text-lg font-bold text-white hover:text-purple-300 transition-colors text-left cursor-pointer"
                    >
                      {review.productName}
                    </button>

                    {/* Stars badge */}
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-800/50 text-xs font-bold text-amber-300">
                      <Star className="w-3.5 h-3.5 fill-amber-300" />
                      <span>{review.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Verified purchase & recommend badges */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    {review.isVerifiedPurchase && (
                      <span className="px-2 py-0.5 font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 rounded-full">
                        ✓ Compra verificada
                      </span>
                    )}
                    {review.recommend ? (
                      <span className="px-2 py-0.5 font-semibold text-purple-300 bg-purple-950/50 border border-purple-800/40 rounded-full">
                        ★ Recomenda este item
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 font-semibold text-red-400 bg-red-950/50 border border-red-800/40 rounded-full">
                        ✗ Não recomenda
                      </span>
                    )}
                  </div>

                  {/* Review text */}
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                    "{review.content}"
                  </p>

                  {/* Attached photos STRICTLY from user device (Req 6) */}
                  {review.images && review.images.length > 0 && (
                    <div className={`pt-2 ${
                      review.images.length === 1
                        ? 'max-w-md'
                        : review.images.length === 2
                        ? 'grid grid-cols-2 gap-2 max-w-lg'
                        : 'grid grid-cols-3 gap-2 max-w-xl'
                    }`}>
                      {review.images.map((img, i) => (
                        <div
                          key={i}
                          className="rounded-2xl overflow-hidden bg-purple-950/40 border border-purple-800/40 aspect-square sm:aspect-4/3"
                        >
                          <img
                            src={img}
                            alt={`${review.productName} foto ${i + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => window.open(img, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Criteria rating pills if provided */}
                  {review.criteria && (
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-purple-900/30 text-[10px]">
                      {review.criteria.quality && (
                        <span className="text-zinc-300 bg-purple-950/50 px-2.5 py-1 rounded-lg border border-purple-900/40">
                          Qualidade: ★ {review.criteria.quality}
                        </span>
                      )}
                      {review.criteria.costBenefit && (
                        <span className="text-zinc-300 bg-purple-950/50 px-2.5 py-1 rounded-lg border border-purple-900/40">
                          Custo-benefício: ★ {review.criteria.costBenefit}
                        </span>
                      )}
                      {review.criteria.durability && (
                        <span className="text-zinc-300 bg-purple-950/50 px-2.5 py-1 rounded-lg border border-purple-900/40">
                          Durabilidade: ★ {review.criteria.durability}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* REQUIREMENT 5: ONDE COMPRAR / ONDE FOI COMPRADO CARD */}
                  {/* ======================================================== */}
                  {review.purchaseInfo && (
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-purple-950/70 border border-purple-600/40 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-900/50 text-purple-300 border border-purple-700/50">
                          {review.purchaseInfo.type === 'physical' ? (
                            <Store className="w-4 h-4 text-amber-300" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-purple-300" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                              {review.purchaseInfo.type === 'physical' ? 'Loja Física Onde Comprou' : 'Onde Comprar'}
                            </span>
                            {review.purchaseInfo.location && (
                              <span className="text-[10px] text-purple-300">• {review.purchaseInfo.location}</span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                            <span>{review.purchaseInfo.storeName}</span>
                            {review.purchaseInfo.priceFormatted && (
                              <span className="text-emerald-400 font-extrabold font-mono text-xs">
                                {review.purchaseInfo.priceFormatted}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {review.purchaseInfo.url && (
                        <a
                          href={review.purchaseInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
                        >
                          <span>{review.purchaseInfo.type === 'physical' ? 'Ver Como Chegar' : 'Ver Oferta'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons (Instagram style: Like, Comment, Bookmark) */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-purple-900/30 text-xs text-zinc-400">
                  <div className="flex items-center gap-4">
                    {/* Like button */}
                    <button
                      onClick={() => onLikeReview(review.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        review.hasLiked ? 'text-pink-500 font-bold' : 'hover:text-pink-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${review.hasLiked ? 'fill-pink-500' : ''}`} />
                      <span>{review.likes}</span>
                    </button>

                    {/* Comment button */}
                    <button
                      onClick={() => toggleComments(review.id)}
                      className="flex items-center gap-1.5 hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{review.commentsCount || review.comments?.length || 0}</span>
                    </button>

                    {/* Share */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          setCopiedLinkReviewId(review.id);
                          setTimeout(() => setCopiedLinkReviewId(null), 2500);
                        }}
                        className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
                        title="Compartilhar"
                      >
                        <Share2 className="w-4 h-4" />
                        {copiedLinkReviewId === review.id && (
                          <span className="text-[10px] text-emerald-400 font-bold animate-in fade-in">Copiado!</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bookmark button */}
                  <button
                    onClick={() => onBookmarkReview(review.id)}
                    className={`transition-colors cursor-pointer ${
                      review.hasBookmarked ? 'text-purple-400' : 'hover:text-purple-400'
                    }`}
                    title="Salvar avaliação"
                  >
                    <Bookmark className={`w-4 h-4 ${review.hasBookmarked ? 'fill-purple-400' : ''}`} />
                  </button>
                </div>

                {/* Inline Comments Drawer */}
                {isCommentsOpen && (
                  <div className="mt-3 pt-3 border-t border-purple-900/30 space-y-3 animate-in fade-in">
                    {/* Comments List */}
                    {review.comments && review.comments.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {review.comments.map((comment) => (
                          <div key={comment.id} className="p-2.5 rounded-xl bg-purple-950/40 text-xs flex gap-2.5">
                            <img
                              src={comment.userAvatar}
                              alt={comment.userName}
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                            <div className="flex-1">
                              <span className="font-bold text-white mr-1.5">{comment.userName}:</span>
                              <span className="text-zinc-300">{comment.content}</span>
                              <span className="text-[10px] text-zinc-500 block mt-1">{comment.createdAt}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-400 italic">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                    )}

                    {/* Add Comment Input */}
                    {currentUser && (
                      <form onSubmit={(e) => handleSendComment(review.id, e)} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Adicione um comentário para esta avaliação..."
                          value={currentCommentText}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [review.id]: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 text-xs bg-purple-950/60 border border-purple-900/60 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="submit"
                          disabled={!currentCommentText.trim()}
                          className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl cursor-pointer transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
