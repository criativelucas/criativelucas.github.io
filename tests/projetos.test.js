import test from 'node:test'; import assert from 'node:assert/strict';
import { PROJETOS, CONTATO } from '../src/projetos.js';

test('12 projetos, 5 jogos, 4 sites, 3 apps', () => {
  const n = c => PROJETOS.filter(p => p.categoria === c).length;
  assert.equal(PROJETOS.length, 12);
  assert.deepEqual([n('jogos'), n('sites'), n('apps')], [5, 4, 3]);
});
test('ids únicos, links https, sem link para github.com', () => {
  assert.equal(new Set(PROJETOS.map(p => p.id)).size, 12);
  for (const p of PROJETOS) {
    assert.match(p.url, /^https:\/\//);
    assert.doesNotMatch(p.url, /github\.com/);
    assert.equal(p.img, `cartas/${p.id}.webp`);
  }
});
test('texto visível não fala de código', () => {
  for (const p of PROJETOS) assert.doesNotMatch(p.nome + p.texto, /github|código|react|next\.js|three\.js/i);
});
test('contato', () => {
  assert.equal(CONTATO.whatsapp, 'https://wa.me/5592993625934?text=' + encodeURIComponent('Oi Lucas, vi seu site e quero conversar sobre um projeto.'));
});
