import { Router, type Request, type Response, type NextFunction } from 'express';
import { MongoClient, type Db } from 'mongodb';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { passwordHash, verifyPassword as verify } from './auth';
import { INITIAL_CATEGORIES } from './src/data/mockData';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const publicUser = (u: any, own = false) => {
  const { _id, passwordHash: secret, email, location, ...user } = u;
  return { ...user, email: own ? email : '', ...(own ? { location } : {}) };
};
const fail = (status: number, message: string) => Object.assign(new Error(message), { status });
const text = (value: unknown, max = 300) => typeof value === 'string' && value.length <= max ? value.trim() : '';

export async function createApi() {
  let db: Db | undefined;
  const uri = process.env.MONGODB_URI;
  if (uri) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    db = client.db(process.env.MONGODB_DB || 'review');
    await Promise.all([
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('users').createIndex({ username: 1 }, { unique: true }),
      db.collection('users').createIndex({ id: 1 }, { unique: true }),
      db.collection('reviews').createIndex({ id: 1 }, { unique: true }),
      db.collection('products').createIndex({ id: 1 }, { unique: true }),
      db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]);
    await db.collection('categories').bulkWrite(INITIAL_CATEGORIES.map(c => ({
      updateOne: { filter: { id: c.id }, update: { $setOnInsert: c }, upsert: true },
    })));
  }
  const router = Router();
  const attempts = new Map<string, { count: number; reset: number }>();
  router.use('/auth', (req, res, next) => {
    if (req.method !== 'POST' || !['/login', '/register', '/password'].includes(req.path)) return next();
    const key = req.ip || 'unknown';
    const now = Date.now();
    for (const [ip, value] of attempts) if (value.reset < now) attempts.delete(ip);
    const window = attempts.get(key) || { count: 0, reset: now + 900000 };
    attempts.set(key, window);
    if (++window.count > 30) return res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos.' });
    next();
  });
  const route = (fn: (req: Request, res: Response) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => { Promise.resolve(fn(req, res)).catch(next); };
  router.use((req, res, next) => {
    if (req.method !== 'GET' && req.headers.origin && req.headers.origin !== `${req.protocol}://${req.get('host')}` && req.headers.origin !== process.env.APP_URL) {
      return res.status(403).json({ error: 'Origem não autorizada.' });
    }
    if (!db) return res.status(503).json({ error: 'Configure MONGODB_URI no arquivo .env para conectar ao banco.' });
    next();
  });
  const users = () => db!.collection('users');
  const actor = async (req: Request) => {
    const cookie = req.headers.cookie?.split(';').map(c => c.trim()).find(c => c.startsWith('review_session='))?.slice(15);
    const session = cookie && await db!.collection('sessions').findOne({ token: hash(cookie), expiresAt: { $gt: new Date() } });
    const user = session && await users().findOne({ id: session.userId });
    if (!user || user.status !== 'active') throw fail(401, 'Entre na sua conta para continuar.');
    return user;
  };
  const session = async (res: Response, user: any) => {
    const token = randomBytes(32).toString('hex');
    await db!.collection('sessions').insertOne({ token: hash(token), userId: user.id, expiresAt: new Date(Date.now() + 604800000) });
    res.cookie('review_session', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 604800000, path: '/' });
    return res.json(publicUser(user, true));
  };
  router.post('/auth/register', route(async (req, res) => {
    const b = req.body;
    const name = text(b.name), email = text(b.email).toLowerCase(), username = text(b.username).toLowerCase();
    const birth = new Date(b.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear() - (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate()) ? 1 : 0);
    if (!name || !/^[a-z0-9_.]{3,40}$/.test(username) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof b.password !== 'string' || b.password.length < 8 || b.password.length > 128 || !Number.isFinite(age) || age < 18 || age > 120) throw fail(400, 'Informe nome, usuário válido, e-mail, senha de 8 a 128 caracteres e idade mínima de 18 anos.');
    const user = { id: randomUUID(), name, username, email, passwordHash: passwordHash(b.password), avatar: '', bio: text(b.bio, 2000), age,
      location: { cep: text(b.location?.cep, 20), city: text(b.location?.city), state: text(b.location?.state, 30), neighborhood: text(b.location?.neighborhood) },
      interests: Array.isArray(b.interests) ? b.interests.filter((i: any) => typeof i === 'string').slice(0, 30) : [],
      isAdmin: false, isVerified: false,
      reviewCount: 0, followersCount: 0, followingCount: 0, status: 'active', createdAt: new Date().toISOString() };
    await users().insertOne(user);
    return session(res, user);
  }));
  router.post('/auth/login', route(async (req, res) => {
    const identifier = text(req.body.identifier).toLowerCase();
    const user = await users().findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user || typeof req.body.password !== 'string' || req.body.password.length > 128 || !verify(req.body.password, user.passwordHash) || user.status !== 'active') throw fail(401, 'E-mail/usuário ou senha incorretos, ou conta suspensa.');
    return session(res, user);
  }));
  router.post('/auth/logout', route(async (req, res) => {
    const user = await actor(req);
    await db!.collection('sessions').deleteMany({ userId: user.id });
    res.clearCookie('review_session', { path: '/' });
    res.json({ success: true });
  }));
  router.post('/auth/password', route(async (req, res) => {
    const user = await actor(req);
    if (typeof req.body.currentPassword !== 'string' || req.body.currentPassword.length > 128 || !verify(req.body.currentPassword, user.passwordHash)) throw fail(400, 'Senha atual incorreta.');
    if (typeof req.body.password !== 'string' || req.body.password.length < 8 || req.body.password.length > 128) throw fail(400, 'Use uma senha de 8 a 128 caracteres.');
    await users().updateOne({ id: user.id }, { $set: { passwordHash: passwordHash(req.body.password) } });
    res.json({ success: true });
  }));
  router.get('/state', route(async (req, res) => {
    const user = await actor(req);
    const [allUsers, products, reviews, categories] = await Promise.all(['users', 'products', 'reviews', 'categories'].map(c => db!.collection(c).find({}, { projection: { _id: 0 } }).toArray()));
    const userView = (u: any) => ({ ...publicUser(u, u.id === user.id), reviewCount: reviews.filter(r => r.userId === u.id && r.status !== 'barred').length });
    const productViews = products.map(p => {
      const related = reviews.filter(r => r.status === 'approved' && (r.productId === p.id || r.productName.toLowerCase() === p.name.toLowerCase()));
      return { ...p, reviewCount: related.length, rating: related.length ? Number((related.reduce((sum, r) => sum + r.rating, 0) / related.length).toFixed(1)) : 0,
        recommendPercentage: related.length ? Math.round(100 * related.filter(r => r.recommend).length / related.length) : 0, featuredReviewIds: related.map(r => r.id) };
    });
    res.json({ currentUser: userView(user), allUsers: allUsers.map(userView), products: productViews,
      reviews: reviews.filter(r => user.isAdmin || r.status !== 'barred' || r.userId === user.id).map(({ likedBy = [], bookmarkedBy = [], reportedBy = [], ...r }) => ({ ...r, hasLiked: likedBy.includes(user.id), hasBookmarked: bookmarkedBy.includes(user.id) })), categories });
  }));
  router.post('/changes', route(async (req, res) => {
    const user = await actor(req);
    const { collection, before, after } = req.body;
    if (!['users', 'products', 'reviews'].includes(collection) || (!before && !after)) throw fail(400, 'Alteração inválida.');
    const id = after?.id || before?.id;
    if (typeof id !== 'string' || id.length > 100) throw fail(400, 'Identificador inválido.');
    const col = db!.collection(collection);
    const stored = await col.findOne({ id });
    if (!after) {
      if (collection !== 'reviews' || !stored || (!user.isAdmin && stored.userId !== user.id)) throw fail(403, 'Exclusão não autorizada.');
      await col.deleteOne({ id });
      return res.json({ success: true });
    }
    if (!stored) {
      if (before || collection === 'users') throw fail(409, 'Registro indisponível. Atualize a página.');
      if (collection === 'reviews') {
        if (!text(after.content, 20000) || !text(after.productName) || !Number.isFinite(after.rating) || after.rating < 1 || after.rating > 5 || !Array.isArray(after.images) || after.images.length > 10) throw fail(400, 'Avaliação inválida.');
        await col.insertOne({ ...after, _id: undefined, id, userId: user.id, userName: user.name, userHandle: user.username, userAvatar: user.avatar, userVerified: user.isVerified, status: 'approved', likes: 0, bookmarksCount: 0, commentsCount: 0, comments: [], likedBy: [], bookmarkedBy: [], reportedBy: [], reportCount: 0, reported: false, hasLiked: false, hasBookmarked: false, createdAt: new Date().toISOString() });
      } else {
        if (!text(after.name) || !Array.isArray(after.images)) throw fail(400, 'Produto inválido.');
        const allowed = ['id', 'name', 'category', 'subcategory', 'rating', 'reviewCount', 'recommendPercentage', 'images', 'description', 'criteriaBreakdown', 'offers', 'featuredReviewIds'];
        await col.insertOne(Object.fromEntries(allowed.filter(k => k in after).map(k => [k, after[k]])));
      }
      return res.json({ success: true });
    }
    const changed = Object.keys(after).filter(k => k !== 'id' && JSON.stringify(after[k]) !== JSON.stringify(before?.[k]));
    if (changed.some(k => k.startsWith('$') || k.includes('.') || k === '__proto__')) throw fail(400, 'Campo inválido.');
    if (collection === 'users') {
      if (changed.includes('username') && (typeof after.username !== 'string' || !/^[a-z0-9_.]{3,40}$/.test(after.username))) throw fail(400, 'Use um nome de usuário de 3 a 40 caracteres: letras minúsculas, números, ponto ou sublinhado.');
      if (changed.includes('name') && !text(after.name)) throw fail(400, 'Nome inválido.');
      if (changed.includes('bio') && typeof after.bio !== 'string') throw fail(400, 'Biografia inválida.');
      if (changed.includes('status') && !['active', 'suspended'].includes(after.status)) throw fail(400, 'Status inválido.');
    }
    const set: Record<string, any> = {};
    const filter: Record<string, any> = { id };
    const allowed = collection === 'users'
      ? (user.id === id ? ['name', 'username', 'avatar', 'bio', 'interests', 'preferences'] : []).concat(user.isAdmin ? ['status', 'isVerified'] : [])
      : collection === 'products' ? ['offers']
      : (stored.userId === user.id ? ['userName', 'userHandle', 'userAvatar'] : []).concat(user.isAdmin ? ['status', 'barReason', 'reported', 'reportCount'] : []);
    for (const key of changed) {
      if (allowed.includes(key)) { set[key] = after[key]; filter[key] = before?.[key] ?? { $exists: false }; }
    }
    if (collection === 'users' && changed.includes('userRatings')) {
      const rating = after.userRatings?.[user.id];
      if (!Number.isFinite(rating) || rating < 1 || rating > 5 || id === user.id) throw fail(400, 'Nota inválida.');
      await col.updateOne({ id }, { $set: { [`userRatings.${user.id}`]: rating } });
      const updated = await col.findOne({ id });
      const values = Object.values(updated!.userRatings) as number[];
      await col.updateOne({ id }, { $set: { rating: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)), ratingCount: values.length } });
    }
    if (Object.keys(set).length && !(await col.updateOne(filter, { $set: set })).matchedCount) throw fail(409, 'Outra pessoa alterou este registro. Atualize a página para tentar novamente.');
    if (collection === 'reviews') {
      for (const [flag, field, count] of [['hasLiked', 'likedBy', 'likes'], ['hasBookmarked', 'bookmarkedBy', 'bookmarksCount']] as const) {
        if (!changed.includes(flag)) continue;
        const add = !!after[flag];
        await col.updateOne({ id, [field]: add ? { $ne: user.id } : user.id }, add
          ? { $addToSet: { [field]: user.id }, $inc: { [count]: 1 } }
          : { $pull: { [field]: user.id } as any, $inc: { [count]: -1 } });
      }
      if (changed.includes('comments')) {
        const comments = after.comments.filter((c: any) => !before.comments.some((old: any) => old.id === c.id));
        for (const c of comments) {
          if (!text(c.content, 5000) || typeof c.id !== 'string') throw fail(400, 'Comentário inválido.');
          await col.updateOne({ id, 'comments.id': { $ne: c.id } }, { $push: { comments: { id: c.id, content: c.content, userId: user.id, userName: user.name, userAvatar: user.avatar, likes: 0, createdAt: new Date().toISOString() } } as any, $inc: { commentsCount: 1 } });
        }
      }
      if (changed.includes('reported') && after.reported && !user.isAdmin) await col.updateOne({ id, reportedBy: { $ne: user.id } }, { $addToSet: { reportedBy: user.id }, $inc: { reportCount: 1 }, $set: { reported: true, reportReason: 'Denunciado para verificação da administração' } });
    }
    res.json({ success: true });
  }));
  router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.code === 11000 ? 409 : err.status || 500).json({ error: err.code === 11000 ? 'E-mail ou usuário já cadastrado.' : err.status ? err.message : 'Não foi possível concluir a operação no banco de dados.' });
  });
  return router;
}
