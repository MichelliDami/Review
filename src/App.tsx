import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CosmicBackground } from './components/CosmicBackground';
import { HeroBanner } from './components/HeroBanner';
import { TrendingCarousel } from './components/TrendingCarousel';
import { FeedSection } from './components/FeedSection';
import { CategoriesSidebar } from './components/CategoriesSidebar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CreateReviewModal } from './components/CreateReviewModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { UserProfileView } from './components/UserProfileView';
import { CategoriesView } from './components/CategoriesView';
import { DiscoverProfilesView } from './components/DiscoverProfilesView';
import { HowItWorksModal } from './components/HowItWorksModal';
import { SettingsModal } from './components/SettingsModal';

import { useDatabase } from './useDatabase';
import { User, Product, Review, CategoryItem } from './types';
import { Sparkles, Filter, X, Search as SearchIcon } from 'lucide-react';



// String normalization for accent-insensitive, case-insensitive search
const normalizeText = (text: string) =>
  (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export default function App() {
  // Theme state: 'dark' (Cosmic) or 'light' (Clean)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('review_theme');
      return (saved as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('review_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const { currentUser, allUsers, products, reviews, categories, setCurrentUser, setAllUsers, setProducts, setReviews, loading, error, saving, reload, login, logout } = useDatabase();

  useEffect(() => {
    if (currentUser?.preferences?.theme) setTheme(currentUser.preferences.theme);
  }, [currentUser?.id]);
  const changeTheme = (nextTheme: 'dark' | 'light') => {
    setTheme(nextTheme);
    if (!currentUser) return;
    const updated = { ...currentUser, preferences: { ...currentUser.preferences, theme: nextTheme } };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  // Navigation, Niche Filter & Search States
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle Search Input: Typing immediately redirects to Feed ('inicio')
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      if (selectedUserForProfile) {
        setSelectedUserForProfile(null);
      }
      if (activeTab !== 'inicio') {
        setActiveTab('inicio');
      }
    }
  };

  // Modals and Overlays
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isCreateReviewModalOpen, setIsCreateReviewModalOpen] = useState<boolean>(false);
  const [targetProductForReview, setTargetProductForReview] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Review interaction handlers
  const handleLikeReview = (reviewId: string) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const nextHasLiked = !r.hasLiked;
          return {
            ...r,
            hasLiked: nextHasLiked,
            likes: nextHasLiked ? r.likes + 1 : Math.max(0, r.likes - 1),
          };
        }
        return r;
      })
    );
  };

  const handleBookmarkReview = (reviewId: string) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const nextBookmarked = !r.hasBookmarked;
          return {
            ...r,
            hasBookmarked: nextBookmarked,
            bookmarksCount: nextBookmarked ? r.bookmarksCount + 1 : Math.max(0, r.bookmarksCount - 1),
          };
        }
        return r;
      })
    );
  };

  const handleAddComment = (reviewId: string, text: string) => {
    if (!currentUser) return;

    const newComment = {
      id: `comm_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: text,
      createdAt: 'Agora mesmo',
      likes: 0,
    };

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const existingComments = r.comments || [];
          return {
            ...r,
            commentsCount: (r.commentsCount || 0) + 1,
            comments: [newComment, ...existingComments],
          };
        }
        return r;
      })
    );
  };

  const handleReportReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            reported: true,
            reportCount: (r.reportCount || 0) + 1,
            reportReason: 'Denunciado para verificação da administração',
          };
        }
        return r;
      })
    );
    showToast('Agradecemos pelo alerta! Esta postagem foi enviada para moderação da equipe administrativa.');
  };

  // Requirement: Deletar postagem (Admin pode apagar de todos, usuário apaga a sua)
  const handleDeleteReview = (reviewId: string) => {
    const reviewToDelete = reviews.find((r) => r.id === reviewId);
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));

    if (reviewToDelete) {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === reviewToDelete.userId || u.username === reviewToDelete.userHandle) {
            return {
              ...u,
              reviewCount: Math.max(0, u.reviewCount - 1),
            };
          }
          return u;
        })
      );
      if (
        currentUser &&
        (currentUser.id === reviewToDelete.userId || currentUser.username === reviewToDelete.userHandle)
      ) {
        setCurrentUser((prev) =>
          prev ? { ...prev, reviewCount: Math.max(0, prev.reviewCount - 1) } : null
        );
      }
      showToast('Postagem de avaliação excluída com sucesso.');
    }
  };

  // Rate user profile from Discover view
  const handleRateUser = (targetUserId: string, rating: number) => {
    if (!currentUser) return;
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetUserId) {
          const existingRatings = u.userRatings || {};
          const nextRatings = { ...existingRatings, [currentUser.id]: rating };
          const values = Object.values(nextRatings);
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          return {
            ...u,
            userRatings: nextRatings,
            rating: Number(avg.toFixed(1)),
            ratingCount: values.length,
          };
        }
        return u;
      })
    );
  };

  // Requirement 5 & 6: Publishing Review & Synchronizing Products
  const handlePublishReview = (newReview: Review, createdProduct?: Product) => {
    setReviews((prev) => [newReview, ...prev]);

    // Update or add product to catalog and trending
    if (createdProduct) {
      setProducts((prev) => {
        const existingIdx = prev.findIndex(
          (p) => p.name.toLowerCase().trim() === createdProduct.name.toLowerCase().trim()
        );
        if (existingIdx >= 0) {
          const existing = prev[existingIdx];
          const updatedOffers = createdProduct.offers.length > 0
            ? [...createdProduct.offers, ...existing.offers]
            : existing.offers;
          const updated = {
            ...existing,
            reviewCount: existing.reviewCount + 1,
            offers: updatedOffers,
            featuredReviewIds: [newReview.id, ...existing.featuredReviewIds],
          };
          const copy = [...prev];
          copy[existingIdx] = updated;
          return copy;
        } else {
          return [createdProduct, ...prev];
        }
      });
    }

    // Update user's review count
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        reviewCount: currentUser.reviewCount + 1,
      };
      setCurrentUser(updatedUser);
      setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    }
  };

  // Requirement 7: Profile editing handler
  const handleUpdateUser = (updatedUser: User) => {
    const oldUsername = currentUser?.username;
    setCurrentUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

    if (selectedUserForProfile?.id === updatedUser.id) {
      setSelectedUserForProfile(updatedUser);
    }

    // Update reviews authored by this user
    setReviews((prev) =>
      prev.map((r) => {
        if (r.userId === updatedUser.id || (oldUsername && r.userHandle === oldUsername)) {
          return {
            ...r,
            userName: updatedUser.name,
            userHandle: updatedUser.username,
            userAvatar: updatedUser.avatar,
          };
        }
        return r;
      })
    );
  };

  const handleSelectProductByName = (productName: string) => {
    const found = products.find(
      (p) => p.name.toLowerCase().trim() === productName.toLowerCase().trim()
    );
    if (found) {
      setSelectedProductForDetail(found);
    } else {
      // Create a transient product view from the review
      const relatedReview = reviews.find(
        (r) => r.productName.toLowerCase().trim() === productName.toLowerCase().trim()
      );
      const fallbackProduct: Product = {
        id: `prod_${Date.now()}`,
        name: productName,
        category: relatedReview?.category || 'Geral',
        subcategory: relatedReview?.subcategory || 'Avaliações',
        rating: relatedReview?.rating || 5.0,
        reviewCount: 1,
        recommendPercentage: relatedReview?.recommend ? 100 : 80,
        images: relatedReview?.images && relatedReview.images.length > 0
          ? relatedReview.images
          : ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80'],
        description: `Visualização de avaliações comunitárias para ${productName}.`,
        criteriaBreakdown: {
          quality: relatedReview?.criteria?.quality || 4.8,
          costBenefit: relatedReview?.criteria?.costBenefit || 4.6,
          durability: relatedReview?.criteria?.durability || 4.7,
          design: 4.8,
        },
        offers: relatedReview?.purchaseInfo
          ? [
              {
                id: `off_${Date.now()}`,
                storeName: relatedReview.purchaseInfo.storeName,
                price: relatedReview.purchaseInfo.price || 0,
                priceFormatted: relatedReview.purchaseInfo.priceFormatted || 'Ver oferta',
                url: relatedReview.purchaseInfo.url || '#',
              },
            ]
          : [],
        featuredReviewIds: relatedReview ? [relatedReview.id] : [],
      };
      setSelectedProductForDetail(fallbackProduct);
    }
  };

  const handleSelectUser = (userHandle: string) => {
    const clean = userHandle.replace('@', '').toLowerCase();
    const found = allUsers.find((u) => u.username.toLowerCase() === clean);
    if (found) {
      setSelectedUserForProfile(found);
    } else if (currentUser && currentUser.username.toLowerCase() === clean) {
      setSelectedUserForProfile(currentUser);
    }
  };

  const handleLogout = () => {
    void logout();
    setSelectedUserForProfile(null);
    setIsAdminOpen(false);
  };

  // Requirement 2 & 4: Robust Accent-Insensitive and Plural-Aware Filter
  const publicFeedReviews = reviews.filter((r) => {
    if (r.status === 'barred') return false;

    const normCat = normalizeText(r.category);
    const normSubcat = normalizeText(r.subcategory || '');
    const normProd = normalizeText(r.productName);
    const normContent = normalizeText(r.content);
    const normUser = normalizeText(r.userName);
    const normHandle = normalizeText(r.userHandle);
    const normStore = normalizeText(r.purchaseInfo?.storeName || '');

    // Search query matching (Lupa de pesquisa)
    if (searchQuery.trim()) {
      const q = normalizeText(searchQuery);
      const qSingular = q.endsWith('s') && q.length > 3 ? q.slice(0, -1) : q;
      const qPlural = q + 's';

      const matchProduct = normProd.includes(q) || normProd.includes(qSingular);
      const matchCategory =
        normCat.includes(q) ||
        normCat.includes(qSingular) ||
        normCat.includes(qPlural) ||
        q.includes(normCat);
      const matchSubcategory = normSubcat.includes(q) || normSubcat.includes(qSingular);
      const matchContent = normContent.includes(q) || normContent.includes(qSingular);
      const matchUser = normUser.includes(q) || normHandle.includes(q);
      const matchStore = normStore.includes(q);

      if (!matchProduct && !matchCategory && !matchSubcategory && !matchContent && !matchUser && !matchStore) {
        return false;
      }

      // If user is searching explicitly, allow cross-category results so nothing is hidden
      return true;
    }

    // Filter by selected niche/category when no search query
    if (selectedCategory) {
      const targetCat = normalizeText(selectedCategory);
      if (normCat !== targetCat && !normCat.includes(targetCat)) {
        return false;
      }
    }

    return true;
  });

  // =========================================================================
  // REQUIREMENT 1: MANDATORY GATE SCREEN
  // If not logged in, the FIRST screen shown is the Login / Password screen!
  // =========================================================================
  if (loading) return <div className="min-h-screen bg-[#0e0720] text-white flex items-center justify-center">Carregando dados...</div>;
  if (error) return <div className="min-h-screen bg-[#0e0720] text-white flex flex-col gap-4 items-center justify-center p-6" role="alert"><p>{error}</p><button onClick={() => void reload()} className="rounded-xl bg-purple-600 px-5 py-3">Recarregar dados</button></div>;

  if (!currentUser) {
    return (
      <div className={`min-h-screen text-white relative font-sans ${theme === 'light' ? 'theme-light' : ''}`}>
        <CosmicBackground />
        <AuthModal
          isOpen={true}
          isGate={true}
          onClose={() => {}}
          onLoginSuccess={(user) => {
            void login(user);
          }}
          allUsers={allUsers}
          setAllUsers={setAllUsers}
        />
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED APPLICATION
  // =========================================================================
  return (
    <div className={`min-h-screen text-white relative font-sans selection:bg-purple-600 selection:text-white transition-colors duration-200 ${
      theme === 'light' ? 'theme-light' : ''
    }`}>
      {/* Background with stars & nebula */}
      <CosmicBackground />

      {saving && <div role="status" className="fixed bottom-4 left-4 z-50 rounded-xl bg-purple-950 px-4 py-2 text-xs text-white">Salvando altera??es...</div>}
      {/* Main Top Navigation Header */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedUserForProfile(null);
        }}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        onOpenCreateModal={() => {
          setTargetProductForReview(null);
          setIsCreateReviewModalOpen(true);
        }}
        onOpenAuthModal={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenProfile={() => {
          setSelectedUserForProfile(currentUser);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* If user selected a profile, show profile view (with Editar Perfil & Deletar) */}
        {selectedUserForProfile ? (
          <UserProfileView
            user={selectedUserForProfile}
            currentUser={currentUser}
            reviews={reviews}
            onOpenCreateReview={() => {
              setTargetProductForReview(null);
              setIsCreateReviewModalOpen(true);
            }}
            onSelectProductByName={handleSelectProductByName}
            onBack={() => setSelectedUserForProfile(null)}
            onUpdateUser={handleUpdateUser}
            onDeleteReview={handleDeleteReview}
          />
        ) : activeTab === 'descobrir' ? (
          /* New Discover Profiles & Community Ratings View */
          <DiscoverProfilesView
            allUsers={allUsers}
            currentUser={currentUser}
            reviews={reviews}
            onSelectUser={handleSelectUser}
            onRateUser={handleRateUser}
          />
        ) : activeTab === 'categorias' ? (
          /* Categories Exploration View -> Clicking category redirects directly to feed */
          <CategoriesView
            categories={categories}
            products={products}
            reviews={reviews}
            selectedCategory={selectedCategory}
            onSelectCategoryAndGoToFeed={(catName) => {
              setSelectedCategory(catName);
              setActiveTab('inicio');
              const feed = document.getElementById('feed-section-anchor');
              feed?.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectProduct={(p) => setSelectedProductForDetail(p)}
          />
        ) : (
          /* Default Home Feed View (Matching Image 2 Layout) */
          <>
            {/* Quick Niche Pills Filter Bar (Requirement 2) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === null
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-purple-950/40 text-zinc-300 hover:bg-purple-900/50 border border-purple-900/50'
                }`}
              >
                Todos os Nichos
              </button>

              {['Perfumes', 'Tecnologia', 'Beleza', 'Moda', 'Restaurantes', 'Filmes e Séries', 'Livros', 'Casa', 'Eventos', 'Músicas', 'Lojas', 'Games', 'Viagens'].map((niche) => {
                const isSelected = selectedCategory?.toLowerCase() === niche.toLowerCase();
                return (
                  <button
                    key={niche}
                    onClick={() => setSelectedCategory(isSelected ? null : niche)}
                    className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-purple-950/40 text-zinc-300 hover:bg-purple-900/50 border border-purple-900/40'
                    }`}
                  >
                    {niche}
                  </button>
                );
              })}

              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-2.5 py-1 text-xs text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer bg-purple-900/40 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpar Filtro</span>
                </button>
              )}
            </div>

            {/* Search Query Feedback Banner (Requirement 4) */}
            {searchQuery && (
              <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-800/50 flex items-center justify-between text-xs animate-in fade-in">
                <div className="flex items-center gap-2 text-zinc-200">
                  <SearchIcon className="w-4 h-4 text-purple-400" />
                  <span>
                    Buscando por: <strong>"{searchQuery}"</strong> • {publicFeedReviews.length} postagem(ns) encontrada(s)
                  </span>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-purple-300 hover:text-white font-bold cursor-pointer"
                >
                  Limpar busca
                </button>
              </div>
            )}

            {/* Grid Layout: Main Stream (cols 8) vs Sidebar (cols 4) matching Image 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left & Center: Hero Banner + Trending Carousel + Feed */}
              <div className="lg:col-span-8 space-y-8">
                {/* Upper Section: Split Hero Banner & Trending Carousel */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-5">
                    <HeroBanner
                      currentUser={currentUser}
                      onExploreClick={() => {
                        const feed = document.getElementById('feed-section-anchor');
                        feed?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      onHowItWorksClick={() => setIsHowItWorksOpen(true)}
                    />
                  </div>

                  <div className="md:col-span-7">
                    <TrendingCarousel
                      products={products}
                      onSelectProduct={(p) => setSelectedProductForDetail(p)}
                      onViewAllTrending={() => setActiveTab('em-alta')}
                      selectedCategory={selectedCategory}
                    />
                  </div>
                </div>

                {/* Divider anchor */}
                <div id="feed-section-anchor" className="border-t border-purple-900/30 pt-2" />

                {/* Main Feed Section (Pessoas que você segue / Feed de Avaliações) */}
                <FeedSection
                  reviews={publicFeedReviews}
                  currentUser={currentUser}
                  onLikeReview={handleLikeReview}
                  onBookmarkReview={handleBookmarkReview}
                  onAddComment={handleAddComment}
                  onReportReview={handleReportReview}
                  onSelectProductByName={handleSelectProductByName}
                  onSelectUser={handleSelectUser}
                  onSelectCategory={(cat) => setSelectedCategory(cat)}
                  onOpenCreateReview={() => {
                    setTargetProductForReview(null);
                    setIsCreateReviewModalOpen(true);
                  }}
                  onDeleteReview={handleDeleteReview}
                  activeCategory={selectedCategory}
                />
              </div>

              {/* Right: Categorias Sidebar + Seu Perfil Card */}
              <div className="lg:col-span-4">
                <CategoriesSidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  currentUser={currentUser}
                  onOpenProfile={() => {
                    setSelectedUserForProfile(currentUser);
                  }}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  onOpenAuthModal={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* PRODUCT DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onOpenCreateReviewForProduct={(product) => {
          setSelectedProductForDetail(null);
          setTargetProductForReview(product);
          setIsCreateReviewModalOpen(true);
        }}
        reviews={reviews}
        currentUser={currentUser}
        onLikeReview={handleLikeReview}
        onBookmarkReview={handleBookmarkReview}
      />

      {/* CREATE REVIEW MODAL (With "Onde você comprou" & Strict Device Photos) */}
      <CreateReviewModal
        isOpen={isCreateReviewModalOpen}
        onClose={() => setIsCreateReviewModalOpen(false)}
        currentUser={currentUser}
        onPublishReview={handlePublishReview}
        targetProduct={targetProductForReview}
      />

      {/* AUTH MODAL (Can also be opened manually if needed) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          void login(user);
        }}
        initialMode={authModalMode}
        allUsers={allUsers}
        setAllUsers={setAllUsers}
        isGate={false}
      />

      {/* Painel de administra??o */}
      {isAdminOpen && (
        <AdminPanel
          currentUser={currentUser}
          reviews={reviews}
          setReviews={setReviews}
          allUsers={allUsers}
          setAllUsers={setAllUsers}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* SETTINGS MODAL (Theme, Account Info, Password Recovery, Logout) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        allUsers={allUsers}
        setAllUsers={setAllUsers}
        theme={theme}
        setTheme={changeTheme}
        onLogout={handleLogout}
      />

      {/* HOW IT WORKS MODAL */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onStart={() => {
          const feed = document.getElementById('feed-section-anchor');
          feed?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Global In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm px-4 py-3 rounded-2xl bg-purple-950/95 border border-purple-500/80 text-white text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in slide-in-from-bottom-3 fade-in">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
