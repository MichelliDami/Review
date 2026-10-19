export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  isVerified?: boolean;
  isAdmin?: boolean;
  age: number;
  location?: { cep: string; city: string; state: string; neighborhood: string };
  bio?: string;
  reviewCount: number;
  followersCount: number;
  followingCount: number;
  interests: string[];
  status: 'active' | 'suspended';
  createdAt: string;
  preferences?: { theme?: 'dark' | 'light'; likes?: boolean; comments?: boolean; trending?: boolean };
  rating?: number;
  ratingCount?: number;
  userRatings?: Record<string, number>;
}

export interface StoreOffer {
  id: string;
  storeName: string;
  price: number;
  priceFormatted: string;
  url: string;
  badge?: string;
}

export interface ReviewComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface ReviewCriteria {
  quality?: number; // Qualidade
  costBenefit?: number; // Custo-benefício
  durability?: number; // Durabilidade
  design?: number; // Design
  [key: string]: number | undefined;
}

export interface ReviewPurchaseInfo {
  type: 'online' | 'physical';
  storeName: string;
  price?: number;
  priceFormatted?: string;
  url?: string;
  location?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  userVerified?: boolean;
  
  productId?: string;
  productName: string;
  category: string;
  subcategory?: string;
  
  rating: number; // 1 to 5
  criteria?: ReviewCriteria;
  
  content: string;
  images: string[];
  
  purchaseInfo?: ReviewPurchaseInfo;

  likes: number;
  hasLiked?: boolean;
  
  commentsCount: number;
  comments: ReviewComment[];
  
  bookmarksCount: number;
  hasBookmarked?: boolean;
  
  isVerifiedPurchase?: boolean;
  recommend: boolean; // Recomenda o produto
  
  createdAt: string;
  status: 'approved' | 'pending' | 'barred';
  barReason?: string;
  reported?: boolean;
  reportCount?: number;
  reportReason?: string;
}

export interface Product {
  id: string;
  name: string;
  isVerified?: boolean;
  category: string;
  subcategory: string;
  rating: number;
  reviewCount: number;
  recommendPercentage: number;
  images: string[];
  description: string;
  criteriaBreakdown: {
    quality: number;
    costBenefit: number;
    durability: number;
    design: number;
  };
  offers: StoreOffer[];
  featuredReviewIds: string[];
}

export interface CategoryItem {
  id: string;
  name: string;
  iconName: string;
  color?: string;
  description?: string;
  popularItems?: string[];
}
