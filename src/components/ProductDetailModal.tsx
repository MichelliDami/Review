import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  ThumbsUp,
  Heart,
  MessageCircle,
  Share2,
  ShoppingBag,
} from 'lucide-react';
import { Product, Review, User } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCreateReviewForProduct: (product: Product) => void;
  reviews: Review[];
  currentUser: User | null;
  onLikeReview: (reviewId: string) => void;
  onBookmarkReview: (reviewId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCreateReviewForProduct,
  reviews,
  currentUser,
  onLikeReview,
  onBookmarkReview,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) return null;

  // Filter reviews matching this product
  const productReviews = reviews.filter(
    (r) =>
      r.productId === product.id ||
      r.productName.toLowerCase().trim() === product.name.toLowerCase().trim()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-6xl cosmic-card rounded-3xl overflow-hidden border border-purple-800/50 shadow-2xl my-auto animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Top Header bar with Breadcrumbs & Close */}
        <div className="px-6 py-4 border-b border-purple-900/40 flex items-center justify-between bg-[#0e0720]/80">
          {/* Breadcrumbs matching Image 2 */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 overflow-x-auto">
            <span className="hover:text-white cursor-pointer">Início</span>
            <span>&gt;</span>
            <span className="hover:text-white cursor-pointer">{product.category}</span>
            <span>&gt;</span>
            <span className="hover:text-white cursor-pointer">{product.subcategory}</span>
            <span>&gt;</span>
            <span className="text-white font-semibold truncate">{product.name}</span>
          </div>

          <button
            id="close-product-detail-modal"
            onClick={onClose}
            className="p-1.5 rounded-full bg-purple-950/70 hover:bg-purple-900 text-zinc-300 hover:text-white transition-colors cursor-pointer ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content (Matching lower half of Image 2) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 1. LEFT GALLERY: Thumbnails + Main Photo (lg:col-span-5) */}
            <div className="lg:col-span-5 flex gap-3">
              {/* Vertical Thumbnails */}
              <div className="flex flex-col gap-2 shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-purple-500 scale-105 shadow-md shadow-purple-900/50'
                        : 'border-purple-900/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>

              {/* Big Hero Image */}
              <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-purple-950/40 border border-purple-800/40 flex items-center justify-center group">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition-colors cursor-pointer"
                  title="Salvar produto"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. MIDDLE COLUMN: Info, Criteria Breakdown, Where to Buy (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Title & Subcategory */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">{product.name}</h2>
                  {product.isVerified && (
                    <CheckCircle2 className="w-5 h-5 text-purple-400 fill-purple-400/20 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-purple-300 mt-0.5">
                  {product.category} • {product.subcategory}
                </p>
              </div>

              {/* Rating & Recommendation Pill */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/40 text-amber-300 font-extrabold text-sm">
                    <Star className="w-4 h-4 fill-amber-300" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-zinc-300 font-medium">
                    {product.reviewCount.toLocaleString('pt-BR')} avaliações
                  </span>
                </div>

                {/* 94% recomendam Banner */}
                <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-900/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white">{product.recommendPercentage}% recomendam</span>
                      <span className="text-[10px] text-zinc-400 block">Baseado nas avaliações</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-purple-400 font-semibold cursor-pointer hover:underline">
                    Ver análise &gt;
                  </span>
                </div>
              </div>

              {/* Criteria Scores Grid (Qualidade, Custo-benefício, Durabilidade, Design) */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-purple-950/30 border border-purple-900/40 text-xs">
                <div className="p-2 rounded-xl bg-[#140b28]">
                  <span className="text-[11px] text-zinc-400 block">Qualidade</span>
                  <div className="flex items-center gap-1 font-bold text-white mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{product.criteriaBreakdown?.quality || 4.7}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#140b28]">
                  <span className="text-[11px] text-zinc-400 block">Custo-benefício</span>
                  <div className="flex items-center gap-1 font-bold text-white mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{product.criteriaBreakdown?.costBenefit || 4.6}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#140b28]">
                  <span className="text-[11px] text-zinc-400 block">Durabilidade</span>
                  <div className="flex items-center gap-1 font-bold text-white mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{product.criteriaBreakdown?.durability || 4.8}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#140b28]">
                  <span className="text-[11px] text-zinc-400 block">Design</span>
                  <div className="flex items-center gap-1 font-bold text-white mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{product.criteriaBreakdown?.design || 4.9}</span>
                  </div>
                </div>
              </div>

              {/* Sobre o produto */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sobre o produto</h4>
                <p className="text-xs text-zinc-300 leading-relaxed mt-1">
                  {product.description}
                </p>
              </div>

              {/* Onde comprar (Store Offers) */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-bold text-white">Onde comprar</h4>
                  </div>
                  <span className="text-[10px] text-zinc-400">Preços atualizados</span>
                </div>

                <div className="space-y-2">
                  {product.offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#150c2d] hover:bg-purple-900/30 transition-colors"
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">{offer.storeName}</span>
                        <span className="text-xs font-extrabold text-emerald-400">{offer.priceFormatted}</span>
                      </div>
                      <a
                        href={offer.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors inline-flex items-center gap-1"
                      >
                        <span>Ver oferta</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Já tem este produto? Deixe sua avaliação */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/50 to-indigo-900/40 border border-purple-600/40 flex items-center justify-between gap-2">
                <div>
                  <h5 className="text-xs font-bold text-white">Já tem este produto?</h5>
                  <p className="text-[11px] text-purple-200">Deixe sua avaliação e ajude outras pessoas!</p>
                </div>
                <button
                  id="detail-evaluate-now-btn"
                  onClick={() => onOpenCreateReviewForProduct(product)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/40 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Avaliar agora</span>
                </button>
              </div>
            </div>

            {/* 3. RIGHT COLUMN: Avaliações em destaque (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-purple-900/40">
                <h4 className="text-sm font-bold text-white">Avaliações em destaque</h4>
                <span className="text-xs text-purple-400 font-semibold cursor-pointer hover:underline">
                  Ver todas
                </span>
              </div>

              <div className="space-y-3">
                {productReviews.length > 0 ? (
                  productReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 rounded-2xl bg-purple-950/40 border border-purple-900/40 space-y-2 text-xs"
                    >
                      {/* Author row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.userAvatar}
                            alt={rev.userName}
                            className="w-7 h-7 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-white block">@{rev.userHandle}</span>
                            <span className="text-[10px] text-zinc-500">{rev.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 font-bold text-amber-300">
                          <Star className="w-3.5 h-3.5 fill-amber-300" />
                          <span>{rev.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {rev.isVerifiedPurchase && (
                        <span className="inline-block px-2 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-950/40 rounded-full">
                          Compra verificada
                        </span>
                      )}

                      <p className="text-zinc-300 text-xs leading-relaxed">
                        "{rev.content}"
                      </p>

                      {rev.purchaseInfo && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-[10px] text-emerald-300">
                          <span>{rev.purchaseInfo.storeName} • <strong>{rev.purchaseInfo.priceFormatted}</strong></span>
                          {rev.purchaseInfo.url && (
                            <a href={rev.purchaseInfo.url} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white flex items-center gap-0.5 font-bold">
                              <span>Ver</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Thumbnails if attached */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-1.5 pt-1">
                          {rev.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Review attachment"
                              className="w-12 h-12 rounded-lg object-cover border border-purple-900/40"
                              referrerPolicy="no-referrer"
                            />
                          ))}
                        </div>
                      )}

                      {/* Interactions */}
                      <div className="flex items-center justify-between pt-2 border-t border-purple-950 text-zinc-400 text-[11px]">
                        <button
                          onClick={() => onLikeReview(rev.id)}
                          className={`flex items-center gap-1 cursor-pointer ${
                            rev.hasLiked ? 'text-pink-500 font-bold' : 'hover:text-pink-400'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${rev.hasLiked ? 'fill-pink-500' : ''}`} />
                          <span>{rev.likes}</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{rev.commentsCount || rev.comments?.length || 0}</span>
                        </div>
                        <button
                          onClick={() => onBookmarkReview(rev.id)}
                          className={`cursor-pointer ${
                            rev.hasBookmarked ? 'text-purple-400' : 'hover:text-purple-400'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${rev.hasBookmarked ? 'fill-purple-400' : ''}`} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 italic p-3">
                    Ainda não há avaliações cadastradas para este produto. Seja a primeira pessoa a avaliar!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
