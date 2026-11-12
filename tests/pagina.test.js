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
  // o endereço do próprio site (criativelucas.github.io) em atributos não conta: não é texto visível
  const semEndereco = html.replace(/(href|content)="https:\/\/criativelucas\.github\.io[^"]*"/g, '');
  assert.doesNotMatch(semEndereco, /github|código/i);
});
test('compartilhar o link mostra título, descrição e imagem', () => {
  assert.match(html, /<meta property="og:image" content="https:\/\/criativelucas\.github\.io\/og\.jpg">/);
  assert.match(html, /<meta property="og:title" content="Lucas Antonio/);
  assert.match(html, /<link rel="canonical" href="https:\/\/criativelucas\.github\.io\/">/);
});
test('o CSS publicado funciona em iPhones antigos (sem sintaxe nova de @media)', async () => {
  const { default: config } = await import('../vite.config.js');
  assert.ok([].concat(config.build.cssTarget).some(t => /^safari1[0-4]$/.test(t)), 'build.cssTarget precisa mirar um Safari antigo');
});
