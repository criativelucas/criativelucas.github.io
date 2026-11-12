// HTML dos projetos, gerado a partir dos dados e injetado no index.html na build.
// É HTML estático: funciona sem JavaScript, para leitor de tela e para buscadores.
import { PROJETOS, CATEGORIAS, CONTATO, MESA } from './projetos.js';

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const texto = id => esc(MESA.find(m => m.id === id).texto);
const TIPO = { jogos: 'Jogo · gratuito', sites: 'Site', apps: 'App' };
const num = i => String(i + 1).padStart(2, '0');

// A lista: cada linha é o link do projeto. Passar o mouse (ou focar) mostra a ficha ao lado.
export function htmlIndice() {
  return ['jogos', 'sites', 'apps'].map(cat => {
    const itens = PROJETOS.filter(p => p.categoria === cat);
    return `
<section class="grupo">
  <h2 class="mono"><span>${CATEGORIAS[cat].titulo}</span><span>${cat === 'jogos' ? 'todos gratuitos · ' : ''}${num(itens.length - 1)}</span></h2>
  ${itens.map(p => {
    const i = PROJETOS.indexOf(p);
    return `<a class="linha${i === 0 ? ' ativa' : ''}" data-id="${p.id}" href="${p.url}" target="_blank" rel="noopener">
    <span class="num mono">${num(i)}</span>
    <span class="nome">${esc(p.nome)}</span>
    <span class="tipo mono">${TIPO[cat]}</span>
    <span class="seta" aria-hidden="true">↗</span>
    <span class="so-leitor">. ${esc(p.texto)} Abre em nova aba.</span>
  </a>`;
  }).join('\n  ')}
</section>`;
  }).join('');
}

// As fichas: imagem + texto de cada projeto. Só a ativa aparece. São decoração visual da linha ativa.
export function htmlFichas() {
  const imgs = PROJETOS.map((p, i) =>
    `<img class="ficha${i === 0 ? ' ativa' : ''}" data-id="${p.id}" src="${p.img}" alt="" width="640" height="480"${i === 0 ? '' : ' loading="lazy"'}>`).join('\n    ');
  const textos = PROJETOS.map((p, i) => `
    <div class="legenda${i === 0 ? ' ativa' : ''}" data-id="${p.id}">
      <p class="mono"><span>${num(i)} / ${PROJETOS.length}</span><span>${TIPO[p.categoria]}</span></p>
      <p class="texto">${esc(p.texto)}</p>
    </div>`).join('');
  return `<div class="moldura" id="moldura">
    ${imgs}
  </div>
  <div class="legendas">${textos}
  </div>`;
}

export function botaoPix() {
  return `<img class="qr" src="pix.svg" alt="QR Code do Pix" width="220" height="220">
<div class="pix-acoes">
  <button class="botao" data-copiar="${CONTATO.pixChave}">Copiar chave Pix</button>
  <input class="chave" readonly hidden value="${CONTATO.pixChave}" aria-label="Chave Pix">
  <p class="aviso mono" role="status"></p>
  <p class="mono miudo">Chave (telefone) ${CONTATO.pixExibicao}<br>${CONTATO.nome}</p>
</div>`;
}

export function htmlContato() {
  return `<div class="conversa">
    <p class="mono">Contato</p>
    <a class="chamada" href="${CONTATO.whatsapp}" target="_blank" rel="noopener">Vamos<br>conversar <span aria-hidden="true">↗</span></a>
    <p class="texto">${texto('contato')}</p>
  </div>
  <div class="apoio" id="apoiar">
    <p class="mono">Apoiar</p>
    <p class="texto">${texto('doacao')}</p>
    <div class="pix">${botaoPix()}</div>
  </div>`;
}
