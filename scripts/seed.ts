import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { passwordHash } from '../auth';
import { INITIAL_CATEGORIES } from '../src/data/mockData';
import type { Product, Review, User } from '../src/types';

if (!process.env.MONGODB_URI) throw new Error('Configure MONGODB_URI no .env.');
const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
const catalog = [
  { name: 'Aurora Eau de Parfum (Demo)', category: 'Perfumes', subcategory: 'Floral', image: 'photo-1541643600914-78b084683601', price: 189.9, rating: 5, description: 'Fragrância floral fictícia com notas cítricas e fundo amadeirado.', review: 'Gostei da proposta floral e do frasco. No cenário de teste, a fragrância acompanha bem a rotina e tem um acabamento delicado.' },
  { name: 'Pulse Headphones (Demo)', category: 'Tecnologia', subcategory: 'Fones de ouvido', image: 'photo-1546435770-a3e426bf472b', price: 249.9, rating: 4, description: 'Fone sem fio fictício com almofadas macias e controles laterais.', review: 'As almofadas são confortáveis e os controles são fáceis de encontrar. Gostaria de um estojo mais compacto para levar na mochila.' },
  { name: 'Essencial Sérum Facial (Demo)', category: 'Beleza', subcategory: 'Skincare', image: 'photo-1608571423902-eed4a5ad8108', price: 79.9, rating: 4, description: 'Sérum fictício para ilustrar a categoria de cuidados com a pele.', review: 'A embalagem é prática e a textura imaginada é leve. Este cadastro serve para testar fotos, critérios e comentários na categoria de beleza.' },
  { name: 'Urban Tênis Casual (Demo)', category: 'Moda', subcategory: 'Calçados', image: 'photo-1542291026-7eec264c27ff', price: 219.9, rating: 5, description: 'Tênis casual fictício para passeios e combinações do dia a dia.', review: 'O visual combina com roupas casuais e o acabamento chama atenção. No exemplo, o ponto forte é o conforto para passeios curtos.' },
  { name: 'Páginas de Outono (Demo)', category: 'Livros', subcategory: 'Ficção', image: 'photo-1544947950-fa07a98d237f', price: 49.9, rating: 4, description: 'Romance fictício sobre encontros e recomeços, criado para demonstração.', review: 'A proposta da história é acolhedora, com capítulos curtos e ritmo tranquilo. Uma boa ficha de exemplo para explorar avaliações de livros.' },
  { name: 'Café Horizonte (Demo)', category: 'Restaurantes', subcategory: 'Cafeterias', image: 'photo-1509042239860-f550ce710b93', price: 24.9, rating: 3, description: 'Cafeteria fictícia com cafés especiais e ambiente aconchegante.', review: 'O ambiente imaginado é agradável para conversar. Neste cenário de teste, o café chegou bem apresentado, mas o atendimento poderia ser mais rápido.' },
];
const profiles = [
  ['Ana Martins', 'ana', 'Perfumes'], ['Bruno Costa', 'bruno', 'Tecnologia'],
  ['Camila Rocha', 'camila', 'Beleza'], ['Diego Alves', 'diego', 'Moda'],
  ['Elisa Santos', 'elisa', 'Livros'], ['Felipe Lima', 'felipe', 'Restaurantes'],
];
const now = new Date();
const date = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
// These visual demo profiles have random, undisclosed passwords and no admin access.
const users = profiles.map(([name, handle, interest], i) => ({
  id: `demo_user_${i + 1}`, name: `${name} (Demo)`, username: `demo.${handle}`,
  email: `demo.${handle}@example.com`, avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=review-demo-${handle}`,
  passwordHash: passwordHash(randomBytes(32).toString('hex')),
  isAdmin: false, isVerified: false, age: 23 + i, bio: `Perfil fictício para demonstração. Interesse em ${interest.toLowerCase()}.`,
  reviewCount: 1, followersCount: 0, followingCount: 0, interests: [interest, 'Tecnologia'],
  status: 'active' as const, createdAt: date(14 + i),
  userRatings: { [`demo_user_${(i + 1) % 6 + 1}`]: 4 }, rating: 4, ratingCount: 1,
  preferences: { theme: 'dark' as const, likes: true, comments: true, trending: false },
} satisfies User & { passwordHash: string }));

const products: Product[] = catalog.map((item, i) => ({
  id: `demo_product_${i + 1}`, name: item.name, category: item.category, subcategory: item.subcategory,
  images: [photo(item.image)], description: `${item.description} Foto ilustrativa; produto e preço fictícios.`,
  isVerified: false, rating: item.rating, reviewCount: 1, recommendPercentage: item.rating >= 4 ? 100 : 0,
  criteriaBreakdown: { quality: item.rating, costBenefit: Math.max(1, item.rating - 1), durability: 4, design: 5 },
  featuredReviewIds: [`demo_review_${i + 1}`],
  offers: [{ id: `demo_offer_${i + 1}`, storeName: 'Loja de demonstração', price: item.price,
    priceFormatted: item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), url: 'https://example.com', badge: 'Oferta fictícia' }],
}));

const commentTexts = [
  'Comentário de demonstração: adorei a descrição! Como seria a embalagem?',
  'Comentário de demonstração: ótimo exemplo para comparar conforto e preço.',
  'Comentário de demonstração: a foto ajuda bastante a visualizar o produto.',
  'Comentário de demonstração: gostei da combinação de cores!',
  'Comentário de demonstração: essa sinopse me deixou curioso.',
  'Comentário de demonstração: seria bom conhecer mais opções do cardápio.',
];
const reviews = catalog.map((item, i) => {
  const author = users[i], commenter = users[(i + 1) % users.length];
  const likedBy = users.filter((_, j) => j !== i).slice(0, i % 3 + 1).map(u => u.id);
  const bookmarkedBy = [commenter.id];
  return {
    id: `demo_review_${i + 1}`, userId: author.id, userName: author.name, userHandle: author.username,
    userAvatar: author.avatar, userVerified: false, productId: products[i].id, productName: item.name,
    category: item.category, subcategory: item.subcategory, rating: item.rating,
    criteria: products[i].criteriaBreakdown, content: `Avaliação fictícia para demonstração. ${item.review}`,
    images: products[i].images,
    purchaseInfo: { type: 'online' as const, storeName: 'Loja de demonstração', price: item.price,
      priceFormatted: products[i].offers[0].priceFormatted, url: 'https://example.com' },
    likes: likedBy.length, likedBy, bookmarksCount: bookmarkedBy.length, bookmarkedBy,
    commentsCount: 1, comments: [{ id: `demo_comment_${i + 1}`, userId: commenter.id,
      userName: commenter.name, userAvatar: commenter.avatar, content: commentTexts[i], createdAt: date(i), likes: 0 }],
    hasLiked: false, hasBookmarked: false, isVerifiedPurchase: false, recommend: item.rating >= 4,
    createdAt: date(i), status: 'approved' as const, reported: false, reportCount: 0, reportedBy: [],
  } satisfies Review & { likedBy: string[]; bookmarkedBy: string[]; reportedBy: string[] };
});

const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 12000 });
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'review');
  // Only insert missing demo IDs. Never overwrite existing records or edited demos.
  for (const [name, records] of [ ['users', users], ['products', products], ['reviews', reviews], ['categories', INITIAL_CATEGORIES] ] as const) {
    const result = await db.collection(name).bulkWrite(records.map(record => ({
      updateOne: { filter: { id: record.id }, update: { $setOnInsert: record }, upsert: true },
    })));
    console.log(`${name}: ${result.upsertedCount} novos registros; ${result.matchedCount} já existentes.`);
  }
  for (const [collection, ids] of [['users', users.map(u => u.id)], ['products', products.map(p => p.id)], ['reviews', reviews.map(r => r.id)]] as const) {
    const count = await db.collection(collection).countDocuments({ id: { $in: [...ids] } });
    if (count !== 6) throw new Error(`Falha na verificação de ${collection}.`);
  }
  console.log('Verificado: 6 perfis, 6 produtos, 6 avaliações, com 6 comentários e 6 ofertas nos registros novos. Fotos ilustrativas externas.');
} catch (error: any) {
  console.error('Não foi possível concluir o seed:', error.codeName || error.code || error.name);
  process.exitCode = 1;
} finally { await client.close(); }
