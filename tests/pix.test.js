import test from 'node:test'; import assert from 'node:assert/strict';
import { pixCopiaECola, crc16 } from '../src/pix.js';

test('crc16 vetor conhecido', () => assert.equal(crc16('123456789'), '29B1'));
test('payload do Lucas', () => {
  const p = pixCopiaECola({ chave: '+5592993625934', nome: 'Lucas Antonio', cidade: 'Manaus' });
  assert.ok(p.startsWith('000201'));
  assert.ok(p.includes('0014br.gov.bcb.pix0114+5592993625934'));
  assert.ok(p.includes('5913Lucas Antonio'));
  assert.ok(p.includes('6006Manaus'));
  assert.equal(p.slice(-4), crc16(p.slice(0, -4)));
  assert.equal(p.slice(-8, -4), '6304');
});
