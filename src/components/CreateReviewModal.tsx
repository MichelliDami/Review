import React, { useState } from 'react';
import {
  X,
  Star,
  Upload,
  Sparkles,
  Check,
  ThumbsUp,
  ThumbsDown,
  ShoppingBag,
  Link as LinkIcon,
  Store,
  DollarSign,
  Search,
  ExternalLink,
  Trash2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { User, Product, Review, ReviewPurchaseInfo } from '../types';
import confetti from 'canvas-confetti';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onPublishReview: (newReview: Review, createdProduct?: Product) => void;
  targetProduct?: Product | null;
}

// Helper to parse Brazilian currency strings cleanly (e.g. 4.199, 4.199,00, 4199, R$ 4199)
const parseBrazilianPrice = (input: string): { num: number; formatted: string } => {
  if (!input || !input.trim()) return { num: 0, formatted: '' };
  let str = input.replace(/[R$\s\u00a0]/g, '').trim();
  if (str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if ((str.match(/\./g) || []).length === 1 && str.split('.')[1].length === 2) {
    // Already in 4199.00 decimal format
  } else {
    // 4.199 -> thousand separator, remove dot
    str = str.replace(/\./g, '');
  }
  const num = parseFloat(str) || 0;
  const formatted = num > 0
    ? `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : (input.trim() ? (input.trim().startsWith('R$') ? input.trim() : `R$ ${input.trim()}`) : '');
  return { num, formatted };
};

// Helper to detect store name from URL
const detectStoreFromUrl = (urlStr: string): { storeName: string; suggestedPrice?: number } => {
  try {
    let clean = urlStr.trim().toLowerCase();
    if (!clean.startsWith('http')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    const host = parsed.hostname.replace('www.', '');

    // Amazon domain check including shortlinks like a.co, amzn.to, amzn.com
    if (
      host.includes('amazon') ||
      host === 'a.co' ||
      host.endsWith('.a.co') ||
      host.includes('amzn')
    ) {
      return { storeName: 'Amazon' };
    }

    if (host.includes('mercadolivre') || host.includes('mercadolibre') || host.includes('meli') || host === 'ml.com') {
      return { storeName: 'Mercado Livre' };
    }
    if (host.includes('sephora')) {
      return { storeName: 'Sephora' };
    }
    if (host.includes('shein')) {
      return { storeName: 'SHEIN' };
    }
    if (host.includes('shopee') || host === 'shp.ee') {
      return { storeName: 'Shopee' };
    }
    if (host.includes('magazineluiza') || host.includes('magalu')) {
      return { storeName: 'Magazine Luiza' };
    }
    if (host.includes('zara')) {
      return { storeName: 'Zara' };
    }
    if (host.includes('kabum')) {
      return { storeName: 'KaBuM!' };
    }
    if (host.includes('boticario')) {
      return { storeName: 'O Boticário' };
    }
    if (host.includes('natura')) {
      return { storeName: 'Natura' };
    }
    if (host.includes('centauro')) {
      return { storeName: 'Centauro' };
    }
    if (host.includes('fastshop')) {
      return { storeName: 'Fast Shop' };
    }
    if (host.includes('casasbahia')) {
      return { storeName: 'Casas Bahia' };
    }
    if (host.includes('aliexpress') || host.includes('ali.ski')) {
      return { storeName: 'AliExpress' };
    }
    if (host.includes('apple')) {
      return { storeName: 'Apple Store' };
    }

    // Capitalize first part of domain
    const domainName = host.split('.')[0];
    if (domainName && domainName.length > 1) {
      return { storeName: domainName.charAt(0).toUpperCase() + domainName.slice(1) };
    }
    return { storeName: 'Loja Online' };
  } catch {
    return { storeName: 'Loja Online' };
  }
};

export const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPublishReview,
  targetProduct,
}) => {
  const [productName, setProductName] = useState(targetProduct?.name || '');
  const [category, setCategory] = useState(targetProduct?.category || 'Perfumes');
  const [subcategory, setSubcategory] = useState(targetProduct?.subcategory || '');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Criteria ratings
  const [qualityRating, setQualityRating] = useState(5);
  const [costBenefitRating, setCostBenefitRating] = useState(5);
  const [durabilityRating, setDurabilityRating] = useState(5);

  const [content, setContent] = useState('');
  const [recommend, setRecommend] = useState<boolean>(true);
  const [isVerifiedPurchase, setIsVerifiedPurchase] = useState<boolean>(true);

  // STRICT REQUIREMENT 6: Only device-uploaded photos!
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [formError, setFormError] = useState('');

  // REQUIREMENT 5: "Onde você comprou"
  const [purchaseChannel, setPurchaseChannel] = useState<'online' | 'physical' | 'none'>('online');
  const [onlineUrl, setOnlineUrl] = useState('');
  const [detectedStoreName, setDetectedStoreName] = useState('');
  const [onlinePriceInput, setOnlinePriceInput] = useState('');
  const [isSearchingUrl, setIsSearchingUrl] = useState(false);

  // Physical store state
  const [physicalStoreName, setPhysicalStoreName] = useState('');
  const [physicalLocation, setPhysicalLocation] = useState('');
  const [physicalPriceInput, setPhysicalPriceInput] = useState('');

  if (!isOpen) return null;

  // Handle uploading device photos
  const handleDevicePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('Uma ou mais fotos excederam o limite de 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setUploadedPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (indexToRemove: number) => {
    setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Online Store URL lookup
  const handleUrlDetection = async (url: string) => {
    setOnlineUrl(url);
    if (!url.trim()) {
      setDetectedStoreName('');
      return;
    }

    const fallbackInfo = detectStoreFromUrl(url);
    setDetectedStoreName(fallbackInfo.storeName);
    setIsSearchingUrl(true);

    try {
      const res = await fetch('/api/parse-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.storeName) setDetectedStoreName(data.storeName);
        if (data.priceFormatted) {
          setOnlinePriceInput(data.priceFormatted);
        } else if (data.price) {
          setOnlinePriceInput(`R$ ${data.price.toFixed(2)}`);
        }
        if (!productName.trim() && data.title) {
          setProductName(data.title.slice(0, 80));
        }
      }
    } catch (e) {
      console.log('API parse failed, using client fallback', e);
    } finally {
      setIsSearchingUrl(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!currentUser) return;

    if (!productName.trim() || !content.trim()) {
      setFormError('Por favor, preencha o nome do item e o texto da sua avaliação.');
      return;
    }

    // Build Purchase Info if provided
    let purchaseInfo: ReviewPurchaseInfo | undefined = undefined;

    if (purchaseChannel === 'online' && onlineUrl.trim()) {
      let finalUrl = onlineUrl.trim();
      if (!finalUrl.startsWith('http')) {
        finalUrl = 'https://' + finalUrl;
      }
      const { num, formatted } = parseBrazilianPrice(onlinePriceInput);
      purchaseInfo = {
        type: 'online',
        storeName: detectedStoreName || detectStoreFromUrl(finalUrl).storeName,
        price: num,
        priceFormatted: formatted || (onlinePriceInput.trim() ? `R$ ${onlinePriceInput.trim()}` : 'Preço na oferta'),
        url: finalUrl,
      };
    } else if (purchaseChannel === 'physical' && physicalStoreName.trim()) {
      const { num, formatted } = parseBrazilianPrice(physicalPriceInput);
      const searchTarget = `${physicalStoreName.trim()} ${physicalLocation.trim()}`.trim();
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchTarget)}`;
      purchaseInfo = {
        type: 'physical',
        storeName: physicalStoreName.trim(),
        price: num,
        priceFormatted: formatted || 'Consultar na loja',
        location: physicalLocation.trim() || undefined,
        url: mapsUrl,
      };
    }

    // STRICT REQUIREMENT 6: Only device-uploaded photos!
    const finalImages = [...uploadedPhotos];

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userHandle: currentUser.username,
      userAvatar: currentUser.avatar,
      userVerified: currentUser.isVerified,
      productName: productName.trim(),
      category: category,
      subcategory: subcategory.trim() || 'Geral',
      rating: rating,
      criteria: {
        quality: qualityRating,
        costBenefit: costBenefitRating,
        durability: durabilityRating,
      },
      content: content.trim(),
      images: finalImages, // Only photos from device!
      purchaseInfo: purchaseInfo,
      likes: 0,
      hasLiked: false,
      commentsCount: 0,
      comments: [],
      bookmarksCount: 0,
      hasBookmarked: false,
      isVerifiedPurchase: isVerifiedPurchase,
      recommend: recommend,
      createdAt: 'Agora mesmo',
      status: 'approved',
    };

    // Auto-create product for catalog and trending carousel
    const cleanPrice = purchaseInfo?.price || 199;
    const createdProduct: Product = {
      id: targetProduct?.id || `prod_${Date.now()}`,
      name: productName.trim(),
      category: category,
      subcategory: subcategory.trim() || category,
      rating: rating,
      reviewCount: 1,
      recommendPercentage: recommend ? 100 : 0,
      images: finalImages.length > 0 ? finalImages : ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80'],
      description: `Avaliação feita por @${currentUser.username}: "${content.trim().slice(0, 140)}..."`,
      criteriaBreakdown: {
        quality: qualityRating,
        costBenefit: costBenefitRating,
        durability: durabilityRating,
        design: rating,
      },
      offers: purchaseInfo
        ? [
            {
              id: `off_${Date.now()}`,
              storeName: purchaseInfo.storeName,
              price: cleanPrice,
              priceFormatted: purchaseInfo.priceFormatted || `R$ ${cleanPrice.toFixed(2)}`,
              url: purchaseInfo.url || '#',
              badge: purchaseInfo.type === 'online' ? 'Indicado pelo autor' : 'Loja Física',
            },
          ]
        : [],
      featuredReviewIds: [newReview.id],
    };

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onPublishReview(newReview, createdProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl cosmic-card rounded-3xl overflow-hidden border border-purple-800/50 shadow-2xl my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-900/40 flex items-center justify-between bg-[#0e0720]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-600/30 text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Criar Nova Avaliação</h3>
              <p className="text-[11px] text-zinc-400">Poste sua resenha sincera para a comunidade</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-purple-950/70 hover:bg-purple-900 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* User Preview */}
          {currentUser && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-950/30 border border-purple-900/30">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-purple-500/50"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-xs font-bold text-white">
                  Postando como <span className="text-purple-300">@{currentUser.username}</span>
                </p>
                <p className="text-[11px] text-zinc-400">
                  Sua avaliação aparecerá no feed geral e poderá ser filtrada pelo nicho que você escolher.
                </p>
              </div>
            </div>
          )}

          {/* Product Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">O que você está avaliando?</label>
              <input
                id="review-product-name-input"
                type="text"
                required
                placeholder="Ex: Dior Sauvage, iPhone 15, Calça Jeans Zara, Fasano..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Nicho / Categoria</label>
              <select
                id="review-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Perfumes">Perfumes</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Beleza">Beleza & Cosméticos</option>
                <option value="Moda">Moda & Roupas</option>
                <option value="Restaurantes">Restaurantes & Gastronomia</option>
                <option value="Filmes e Séries">Filmes e Séries</option>
                <option value="Músicas">Músicas & Álbuns</option>
                <option value="Livros">Livros</option>
                <option value="Casa">Casa & Eletro</option>
                <option value="Eventos">Eventos & Shows</option>
                <option value="Games">Games</option>
                <option value="Viagens">Viagens & Hotéis</option>
                <option value="Lojas">Lojas & E-commerce</option>
              </select>
            </div>
          </div>

          {/* Star Rating Selection */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">Sua nota geral</span>
              <span className="text-[11px] text-zinc-400">Clique para selecionar de 1 a 5 estrelas</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'text-zinc-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-black text-amber-400 ml-2">
                {(hoverRating || rating)}.0
              </span>
            </div>
          </div>

          {/* Detailed Criteria Scores */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-900/30 text-center">
              <span className="text-[10px] text-zinc-400 block mb-1">Qualidade</span>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQualityRating(s)}
                    className={`text-xs ${qualityRating >= s ? 'text-amber-400' : 'text-zinc-600'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-900/30 text-center">
              <span className="text-[10px] text-zinc-400 block mb-1">Custo-benefício</span>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCostBenefitRating(s)}
                    className={`text-xs ${costBenefitRating >= s ? 'text-amber-400' : 'text-zinc-600'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-900/30 text-center">
              <span className="text-[10px] text-zinc-400 block mb-1">Durabilidade</span>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDurabilityRating(s)}
                    className={`text-xs ${durabilityRating >= s ? 'text-amber-400' : 'text-zinc-600'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Review Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Sua avaliação detalhada (Estilo Instagram)
            </label>
            <textarea
              id="review-content-textarea"
              rows={4}
              required
              placeholder="O que você achou dos pontos fortes, pontos fracos, desempenho, fixação, acabamento ou sabor? Vale a pena comprar?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>

          {/* ======================================================== */}
          {/* REQUIREMENT 5: ONDE VOCÊ COMPROU? (Link / Loja Física) */}
          {/* ======================================================== */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-indigo-950/30 border border-purple-700/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-bold text-white">Onde você comprou?</span>
              </div>
              <div className="flex items-center gap-1 bg-purple-950/60 p-1 rounded-xl border border-purple-800/40">
                <button
                  type="button"
                  onClick={() => setPurchaseChannel('online')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                    purchaseChannel === 'online'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    <span>Loja Online / Link</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPurchaseChannel('physical')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                    purchaseChannel === 'physical'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    <span>Loja Física</span>
                  </span>
                </button>
              </div>
            </div>

            {purchaseChannel === 'online' ? (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-300 flex items-center justify-between">
                    <span>Link do produto ou site onde comprou</span>
                    <span className="text-purple-300">Busca e identifica a loja e preço automaticamente</span>
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <input
                      type="url"
                      placeholder="Cole o link (ex: https://mercadolivre.com.br/item ou https://amazon.com.br/...)"
                      value={onlineUrl}
                      onChange={(e) => handleUrlDetection(e.target.value)}
                      className="w-full pl-10 pr-24 py-2.5 text-xs bg-purple-950/60 border border-purple-900/80 rounded-xl text-white focus:outline-none focus:border-purple-400 placeholder-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleUrlDetection(onlineUrl)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                    >
                      {isSearchingUrl ? 'Buscando...' : 'Buscar Site'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-300">Loja identificada</label>
                    <input
                      type="text"
                      placeholder="Ex: Amazon, Mercado Livre, Sephora..."
                      value={detectedStoreName}
                      onChange={(e) => setDetectedStoreName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-purple-950/60 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-300">Preço no site / Pago (R$)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                      <input
                        type="text"
                        placeholder="Ex: 4.199,00 ou 299,00"
                        value={onlinePriceInput}
                        onChange={(e) => setOnlinePriceInput(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-purple-950/60 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                </div>

                {detectedStoreName && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-700/50 flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>
                        Loja: <strong>{detectedStoreName}</strong> • {onlinePriceInput.trim() ? (onlinePriceInput.trim().startsWith('R$') ? onlinePriceInput.trim() : `R$ ${onlinePriceInput.trim()}`) : 'Preço pronto'}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">Botão "Ver Ofertas" ativado</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-300">Nome da Loja Física / Restaurante</label>
                    <input
                      type="text"
                      placeholder="Ex: Zara Shopping Iguatemi, O Boticário..."
                      value={physicalStoreName}
                      onChange={(e) => setPhysicalStoreName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-purple-950/60 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-300">Cidade / Bairro</label>
                    <input
                      type="text"
                      placeholder="Ex: São Paulo, SP"
                      value={physicalLocation}
                      onChange={(e) => setPhysicalLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-purple-950/60 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-300">Preço pago (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                    <input
                      type="text"
                      placeholder="Ex: 180,00"
                      value={physicalPriceInput}
                      onChange={(e) => setPhysicalPriceInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-purple-950/60 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {physicalStoreName && (
                  <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-700/50 text-[11px] text-purple-300 flex items-center justify-between">
                    <span>O Review gerará o link direto de localização e mapa para esta loja física.</span>
                    <span className="font-bold text-amber-300">Loja física</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* REQUIREMENT 6: PHOTO UPLOAD STRICTLY FROM DEVICE ONLY!   */}
          {/* ======================================================== */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <span>Fotos da sua avaliação</span>
                <span className="text-[10px] text-purple-300 font-normal">(apenas fotos enviadas do seu dispositivo)</span>
              </label>
              {uploadedPhotos.length > 0 && (
                <span className="text-[11px] text-purple-400 font-bold">
                  {uploadedPhotos.length} foto(s) selecionada(s)
                </span>
              )}
            </div>

            {photoError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{photoError}</span>
              </p>
            )}

            {/* Custom file input */}
            <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-purple-700/60 bg-purple-950/20 hover:bg-purple-900/30 cursor-pointer transition-colors text-xs text-purple-300">
              <Upload className="w-4 h-4" />
              <span className="font-semibold">Clique para carregar fotos do seu dispositivo</span>
              <input
                id="review-device-photos-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleDevicePhotosUpload}
                className="hidden"
              />
            </label>

            {/* Uploaded photos thumbnail list with delete buttons */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                {uploadedPhotos.map((photoUrl, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-purple-500/60 group">
                    <img
                      src={photoUrl}
                      alt={`Foto carregada ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/90 text-white hover:bg-red-500 transition-colors cursor-pointer shadow-md"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded text-[9px] bg-black/70 text-white font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[10px] text-zinc-400 italic">
              * Apenas as fotos que você carregar aparecerão na sua avaliação. Se não carregar nenhuma foto, a avaliação será postada em formato de texto.
            </p>
          </div>

          {/* Extra Toggles: Recomenda & Compra verificada */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-purple-900/30 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-300">Você recomenda este item?</span>
              <button
                type="button"
                onClick={() => setRecommend(true)}
                className={`p-1.5 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                  recommend
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-purple-950/40 text-zinc-400 hover:bg-purple-900/40'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Sim</span>
              </button>
              <button
                type="button"
                onClick={() => setRecommend(false)}
                className={`p-1.5 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                  !recommend
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-purple-950/40 text-zinc-400 hover:bg-purple-900/40'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Não</span>
              </button>
            </div>

            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isVerifiedPurchase}
                onChange={(e) => setIsVerifiedPurchase(e.target.checked)}
                className="rounded border-purple-800 text-purple-600 focus:ring-purple-500"
              />
              <span>Marcar como Compra Verificada</span>
            </label>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/70 text-xs text-red-200 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            id="submit-publish-review-btn"
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/40 cursor-pointer transition-all"
          >
            Publicar Avaliação na Comunidade ✨
          </button>
        </form>
      </div>
    </div>
  );
};
