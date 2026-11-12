import test from 'node:test'; import assert from 'node:assert/strict';
import { htmlIndice, htmlFichas, htmlContato } from '../src/lista.js';
import { PROJETOS, CONTATO } from '../src/projetos.js';

test('índice: cada projeto é um link único, em nova aba', () => {
  const h = htmlIndice();
  assert.equal(h.match(/class="linha/g).length, 12);
  for (const p of PROJETOS) assert.equal(h.split(`href="${p.url}" target="_blank" rel="noopener"`).length - 1, 1, p.id);
});
test('índice: o primeiro projeto já vem ativo (a página funciona sem JavaScript)', () => {
  assert.equal(htmlIndice().match(/class="linha ativa"/g).length, 1);
  assert.equal(htmlFichas().match(/class="ficha ativa"/g).length, 1);
});
test('fichas: uma por projeto, com imagem e texto', () => {
  const h = htmlFichas();
  for (const p of PROJETOS) { assert.ok(h.includes(`data-id="${p.id}"`), p.id); assert.ok(h.includes(`src="${p.img}"`), p.id); }
});
test('contato traz WhatsApp e Pix', () => {
  const h = htmlContato();
  assert.ok(h.includes(`href="${CONTATO.whatsapp}"`));
  assert.ok(h.includes('src="pix.svg"'));
  assert.ok(h.includes(`data-copiar="${CONTATO.pixChave}"`));
});
test('nada fala de código', () => {
  assert.doesNotMatch((htmlIndice() + htmlFichas() + htmlContato()).replace(/(href|src)="[^"]*"/g, ''), /github|código/i);
});
