import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('as fontes não seguram a primeira pintura', () => {
  const link = html.match(/<link[^>]*fonts\.googleapis\.com\/css2[^>]*>/)[0];
  assert.match(link, /media="print"/);
  assert.match(link, /onload="this\.media='all'"/);
});
test('a página tem os três blocos gerados a partir dos dados', () => {
  for (const m of ['<!--INDICE-->', '<!--FICHAS-->', '<!--CONTATO-->']) assert.ok(html.includes(m), m);
});
test('a página não fala de código', () => {
  assert.doesNotMatch(html, /github|código/i);
});
test('compartilhar o link mostra título, descrição e imagem', () => {
  assert.match(html, /<meta property="og:image" content="https:\/\/criativelucas\.github\.io\/og\.jpg">/);
  assert.match(html, /<meta property="og:title" content="Lucas Antonio/);
  assert.match(html, /<link rel="canonical" href="https:\/\/criativelucas\.github\.io\/">/);
});
