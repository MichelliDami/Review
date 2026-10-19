import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { createApi } from './api';
import { passwordHash, verifyPassword } from './auth';

test('senhas usam salt individual e rejeitam senha incorreta e hashes inválidos', () => {
  const first = passwordHash('uma-senha-forte');
  const second = passwordHash('uma-senha-forte');
  assert.notEqual(first, second);
  assert.ok(!first.includes('uma-senha-forte'));
  assert.equal(verifyPassword('uma-senha-forte', first), true);
  assert.equal(verifyPassword('outra-senha', first), false);
  assert.equal(verifyPassword('uma-senha-forte', 'registro-inválido'), false);
});

test('API sem configuração informa indisponibilidade sem revelar credenciais', async () => {
  const previous = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  const app = express();
  app.use(express.json());
  app.use('/api', await createApi());
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise<void>(resolve => server.on('listening', resolve));
    const address = server.address() as { port: number };
    const base = `http://127.0.0.1:${address.port}`;
    const response = await fetch(`${base}/api/state`);
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /MONGODB_URI/);
    const crossOrigin = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { Origin: 'https://outro-site.example' } });
    assert.equal(crossOrigin.status, 403);
    const body = await crossOrigin.json();
    assert.equal(body.error, 'Origem não autorizada.');
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    if (previous !== undefined) process.env.MONGODB_URI = previous;
  }
});
