import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { INITIAL_CATEGORIES } from '../src/data/mockData';
import type { Product, Review } from '../src/types';

// Illustrative photos are downloaded to public so the site does not depend on remote image requests.
const catalogs: Record<string, { names: string[]; photos: string[]; detail: string }> = {
  perfumes: { names: ['Brisa Floral', 'Âmbar Noturno', 'Jardim de Íris', 'Cítrico Solar', 'Madeira Serena', 'Rosa de Inverno'], photos: ['photo-1541643600914-78b084683601', 'photo-1587017539504-67cfbddac569'], detail: 'Fragrância' },
  tecnologia: { names: ['Fone Wave', 'Headphone Studio', 'Fone Air Beat', 'Headset Focus', 'Headphone Travel', 'Fone Sound Mini'], photos: ['photo-1546435770-a3e426bf472b', 'photo-1505740420928-5e560c06d30e'], detail: 'Áudio' },
  beleza: { names: ['Sérum Hidra', 'Óleo Lumina', 'Creme Essencial', 'Kit Ritual', 'Loção Suave', 'Elixir Natural'], photos: ['photo-1608571423902-eed4a5ad8108', 'photo-1556229010-6c3f2c9ca5f8'], detail: 'Cuidados pessoais' },
  moda: { names: ['Tênis Street', 'Tênis Runner', 'Tênis Minimal', 'Tênis Classic', 'Tênis Move', 'Tênis City'], photos: ['photo-1542291026-7eec264c27ff', 'photo-1549298916-b41d501d3772'], detail: 'Calçados' },
  restaurantes: { names: ['Café da Praça', 'Bistrô Aurora', 'Café Entre Amigos', 'Café Jardim', 'Café da Esquina', 'Café Varanda'], photos: ['photo-1509042239860-f550ce710b93', 'photo-1442512595331-e89e73853f31'], detail: 'Cafeterias' },
  filmes: { names: ['Além do Horizonte', 'Noites de Outubro', 'A Última Sessão', 'Entre Dois Mundos', 'Luzes da Cidade', 'O Tempo de Voltar'], photos: ['photo-1489599849927-2ee91cede3ba', 'photo-1517604931442-7e0c8ed2963c'], detail: 'Cinema e streaming' },
  musicas: { names: ['Aurora Acústica', 'Ritmos da Cidade', 'Maré de Sons', 'Noite em Vinil', 'Entre Acordes', 'Som do Amanhã'], photos: ['photo-1516280440614-37939bbacd81', 'photo-1511379938547-c1f69419868d'], detail: 'Álbuns e shows' },
  livros: { names: ['Cartas ao Amanhã', 'O Jardim Secreto do Tempo', 'Caminhos de Papel', 'Depois da Chuva', 'A Casa das Histórias', 'Pequenos Recomeços'], photos: ['photo-1544947950-fa07a98d237f', 'photo-1507842217343-583bb7270b66'], detail: 'Ficção' },
  casa: { names: ['Sala Aconchego', 'Cantinho Minimal', 'Espaço Sereno', 'Ambiente Natural', 'Sala de Estar Aurora', 'Decoração Horizonte'], photos: ['photo-1600210492486-724fe5c67fb0', 'photo-1484154218962-a197022b5858'], detail: 'Decoração' },
  eventos: { names: ['Festival Luzes', 'Encontro Cultural', 'Noite de Verão', 'Festival Horizonte', 'Palco da Cidade', 'Celebração Aurora'], photos: ['photo-1492684223066-81342ee5ff30', 'photo-1459749411175-04bf5292ceea'], detail: 'Festivais' },
  esportes: { names: ['Treino Energia', 'Programa Movimento', 'Circuito Ativo', 'Rotina Equilíbrio', 'Treino Superação', 'Projeto Vida Ativa'], photos: ['photo-1517836357463-d25dfeac3438', 'photo-1534438327276-14e5300c3a48'], detail: 'Treino e academia' },
  games: { names: ['Controle Nova', 'Gamepad Pulse', 'Controle Infinity', 'Gamepad Orbit', 'Controle Arcade', 'Gamepad Horizon'], photos: ['photo-1486401899868-0e435ed85128', 'photo-1511512578047-dfb367046420'], detail: 'Acessórios gamer' },
  viagens: { names: ['Refúgio Tropical', 'Rota do Mar', 'Destino Paraíso', 'Escapada Azul', 'Horizonte de Verão', 'Ilha Serena'], photos: ['photo-1507525428034-b723cf961d3e', 'photo-1476514525535-07fb3b4ae5f1'], detail: 'Destinos' },
  lojas: { names: ['Loja Vitrine', 'Galeria Urbana', 'Loja Estação', 'Espaço Tendência', 'Loja Boulevard', 'Mercado Aurora'], photos: ['photo-1441986300917-64674bd600d8', 'photo-1473181488821-2d23949a045a'], detail: 'Lojas físicas' },
};
const client = new MongoClient(process.env.MONGODB_URI || '', { serverSelectionTimeoutMS: 12000 });
const createdAt = new Date().toISOString();
const commentText = [
  'Gostei da apresentação e da foto. Esse exemplo ajuda a comparar as opções.',
  'Achei interessante! Gostaria de saber mais sobre os detalhes dessa opção.',
  'O custo-benefício parece um bom ponto para discutir nesta avaliação.',
  'Boa descrição. Eu também daria atenção à qualidade e ao acabamento.',
  'Gostei de ver os pontos positivos e o que poderia melhorar.',
  'Vou salvar esta avaliação para comparar com as outras da categoria.',
];

try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI ausente');
  // Validate every remote photo before adding records, then keep local copies.
  const directory = resolve('public/demo');
  await mkdir(directory, { recursive: true });
  for (const category of INITIAL_CATEGORIES) {
    const catalog = catalogs[category.id];
    let available = 0;
    for (const [i, photo] of catalog.photos.entries()) {
      try {
        const response = await fetch(`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=800&q=75`, { signal: AbortSignal.timeout(20000) });
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('Imagem indisponível');
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length < 1000) throw new Error('Imagem inválida');
        await writeFile(resolve(directory, `${category.id}-${available + 1}.jpg`), bytes);
        available++;
      } catch { console.log(`${category.name}: foto ${i + 1} indisponível, usando outra foto da mesma categoria.`); }
    }
    if (!available) throw new Error(`Nenhuma foto válida para ${category.name}`);
    catalog.photos = Array.from({ length: available }, (_, i) => `/demo/${category.id}-${i + 1}.jpg`);
  }
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'review');
  const users = await db.collection('users').find({ id: { $in: Array.from({ length: 6 }, (_, i) => `demo_user_${i + 1}`) } }).sort({ id: 1 }).toArray();
  if (users.length !== 6) throw new Error('Execute npm run seed antes para criar os perfis fictícios.');
  let added = 0, addedComments = 0;
  for (const [categoryIndex, category] of INITIAL_CATEGORIES.entries()) {
    const catalog = catalogs[category.id];
    const products = db.collection('products');
    const reviews = db.collection('reviews');
    const existing = await products.find({ category: category.name, id: { $regex: '^demo_product_' } }).sort({ id: 1 }).toArray();
    for (let i = existing.length; i < 6; i++) {
      const id = `demo_product_${category.id}_${i + 1}`;
      const reviewId = `demo_review_${category.id}_${i + 1}`;
      const rating = [5, 4, 4, 3, 5, 4][i];
      const price = Number((29.9 + categoryIndex * 17 + i * 24).toFixed(2));
      const product: Product = {
        id, name: `${catalog.names[i]} (Demo)`, category: category.name, subcategory: catalog.detail,
        images: [catalog.photos[i % catalog.photos.length]], isVerified: false,
        description: `${catalog.names[i]}: exemplo fictício de ${category.name.toLowerCase()} para explorar a comunidade. Foto ilustrativa; nome, oferta e preço de demonstração.`,
        rating, reviewCount: 1, recommendPercentage: rating >= 4 ? 100 : 0,
        criteriaBreakdown: { quality: rating, costBenefit: 4, durability: 4, design: 5 },
        featuredReviewIds: [reviewId], offers: [{ id: `demo_offer_${category.id}_${i + 1}`, storeName: 'Loja de demonstração', price,
          priceFormatted: price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), url: 'https://example.com', badge: 'Oferta fictícia' }],
      };
      const result = await products.updateOne({ id }, { $setOnInsert: product }, { upsert: true });
      added += result.upsertedCount;
    }
    const categoryProducts = await products.find({ category: category.name, id: { $regex: '^demo_product_' } }).sort({ id: 1 }).toArray();
    for (const [i, product] of categoryProducts.entries()) {
      // Update demo photos only; preserve any real records, reviews and comments.
      const image = catalog.photos[i % catalog.photos.length];
      await products.updateOne({ id: product.id }, { $set: { images: [image] } });
      const author = users[(categoryIndex + i) % users.length];
      const reviewId = product.featuredReviewIds?.[0] || `demo_review_${category.id}_${i + 1}`;
      const review: Review = {
        id: reviewId, productId: product.id, productName: product.name, category: category.name, subcategory: product.subcategory,
        userId: author.id, userName: author.name, userHandle: author.username, userAvatar: author.avatar, userVerified: false,
        rating: product.rating, criteria: product.criteriaBreakdown, images: [image],
        content: `Avaliação fictícia para demonstração: ${product.name}. ${[
          'Gostei da apresentação e dos detalhes. A experiência descrita é positiva, com destaque para a qualidade.',
          'Uma opção interessante para comparar nesta categoria. O custo-benefício é bom, mas alguns detalhes poderiam melhorar.',
          'O visual chamou minha atenção e a proposta é fácil de entender. Gostaria de explorar mais opções semelhantes.',
          'A proposta funciona para o dia a dia. No cenário de teste, o ponto forte é a praticidade.',
          'Minha impressão neste exemplo foi muito boa. Os detalhes e o cuidado na apresentação se destacam.',
          'Vale comparar com outras opções da categoria. Gostei do conjunto, embora o preço mereça atenção.',
        ][i % 6]}`,
        purchaseInfo: { type: 'online', storeName: 'Loja de demonstração', price: product.offers[0].price, priceFormatted: product.offers[0].priceFormatted, url: 'https://example.com' },
        likes: 0, bookmarksCount: 0, commentsCount: 0, comments: [], recommend: product.rating >= 4,
        isVerifiedPurchase: false, createdAt, status: 'approved', reported: false, reportCount: 0,
      };
      await reviews.updateOne({ id: reviewId }, { $setOnInsert: { ...review, likedBy: [], bookmarkedBy: [], reportedBy: [] } }, { upsert: true });
      await reviews.updateOne({ id: reviewId, productId: product.id, userId: { $in: users.map(u => u.id) } }, { $set: { images: [image] } });
      const stored = await reviews.findOne({ id: reviewId });
      if (!stored || !users.some(u => u.id === stored.userId)) continue;
      // Add only what's missing. Existing comments, including real users' comments, remain intact.
      for (let j = stored.comments?.length || 0; j < 6; j++) {
        const commenter = users[(i + j + 1) % users.length];
        const comment = { id: `demo_comment_${product.id}_${j + 1}`, userId: commenter.id, userName: commenter.name,
          userAvatar: commenter.avatar, content: `Comentário fictício: ${commentText[j]}`, createdAt, likes: 0 };
        const result = await reviews.updateOne({ id: reviewId, 'comments.id': { $ne: comment.id } }, {
          $push: { comments: comment } as any, $inc: { commentsCount: 1 },
        });
        addedComments += result.modifiedCount;
      }
    }
    console.log(`${category.name}: ${categoryProducts.length} produtos de demonstração.`);
  }
  // Verify actual relations and counters, not just insertion results.
  const allProducts = await db.collection('products').find({ id: { $regex: '^demo_product_' } }).toArray();
  let commentCount = 0;
  for (const category of INITIAL_CATEGORIES) {
    if (allProducts.filter(p => p.category === category.name).length < 6) throw new Error(`Categoria incompleta: ${category.name}`);
  }
  for (const product of allProducts) {
    const review = await db.collection('reviews').findOne({ productId: product.id, id: { $regex: '^demo_review_' } });
    if (!review || review.comments.length < 6 || review.commentsCount !== review.comments.length) throw new Error(`Comentários incompletos: ${product.id}`);
    commentCount += review.comments.length;
  }
  for (const user of users) {
    const count = await db.collection('reviews').countDocuments({ userId: user.id, status: { $ne: 'barred' } });
    await db.collection('users').updateOne({ id: user.id }, { $set: { reviewCount: count } });
  }
  console.log(`Verificado: ${allProducts.length} produtos em ${INITIAL_CATEGORIES.length} categorias, ${commentCount} comentários. Novos: ${added} produtos e ${addedComments} comentários.`);
} catch (error: any) {
  console.error('Falha ao completar demonstração:', error.codeName || error.code || error.message);
  process.exitCode = 1;
} finally { await client.close(); }
