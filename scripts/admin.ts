import 'dotenv/config';
import { MongoClient } from 'mongodb';

const email = process.argv[2]?.trim().toLowerCase();
if (!process.env.MONGODB_URI || !email) throw new Error('Configure MONGODB_URI e execute: npm run admin -- seu@email.com');
const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const result = await client.db(process.env.MONGODB_DB || 'review').collection('users').updateOne({ email }, { $set: { isAdmin: true, isVerified: true } });
  if (!result.matchedCount) throw new Error('Cadastre essa conta no aplicativo antes de torná-la administradora.');
  console.log('Conta configurada como administradora. Entre novamente no aplicativo.');
} finally { await client.close(); }
