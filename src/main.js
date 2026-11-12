// A página funciona inteira sem este arquivo. Aqui só entra o que é vivo:
// trocar a ficha quando o mouse passa num projeto, o cursor "Abrir", copiar o Pix e ligar a cena 3D.
import { iniciarAbertura } from './abertura.js';

// Abertura (nome em malha que se desfaz ao rolar). Se der errado, some e a página abre na capa.
iniciarAbertura().catch(erro => {
  console.warn('Abertura indisponível:', erro);
  document.documentElement.classList.remove('com-abertura', 'abertura-viva');
});

const linhas = [...document.querySelectorAll('.linha')];
const fichas = [...document.querySelectorAll('.ficha, .legenda')];
const previa = document.querySelector('.previa');
let ativa = linhas[0]?.dataset.id;
let cena = null;

function ativar(id) {
  if (id === ativa) return;
  ativa = id;
  for (const el of [...linhas, ...fichas]) el.classList.toggle('ativa', el.dataset.id === id);
  cena?.mostrar(id);
}

for (const l of linhas) {
  l.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') ativar(l.dataset.id); });
  l.addEventListener('focus', () => ativar(l.dataset.id));
}

// Sem mouse (celular): o projeto ativo é a primeira linha inteira logo abaixo da prévia enquanto a lista rola.
const semMouse = matchMedia('(hover: none)');
function porRolagem() {
  if (!semMouse.matches) return;
  const base = previa.getBoundingClientRect().bottom - 2;
  const linha = linhas.find(l => l.getBoundingClientRect().top >= base) ?? linhas.at(-1);
  ativar(linha.dataset.id);
}
addEventListener('scroll', porRolagem, { passive: true });

// Cursor "Abrir ↗" acompanhando o mouse sobre a lista.
const cursor = document.querySelector('.cursor');
const lista = document.querySelector('.lista');
lista.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  cursor.style.translate = `${e.clientX}px ${e.clientY}px`;
  cursor.classList.toggle('visivel', !!e.target.closest('.linha'));
});
lista.addEventListener('pointerleave', () => cursor.classList.remove('visivel'));

// "Copiar chave Pix"
document.addEventListener('click', async e => {
  const botao = e.target.closest('[data-copiar]');
  if (!botao) return;
  const campo = botao.parentElement.querySelector('.chave');
  const aviso = botao.parentElement.querySelector('.aviso');
  try {
    await navigator.clipboard.writeText(botao.dataset.copiar);
    aviso.textContent = 'Chave copiada. Cole no app do banco.';
  } catch {
    campo.hidden = false;
    campo.focus();
    campo.select();
    aviso.textContent = 'Copie a chave abaixo.';
  }
});

// A cena 3D é um extra: carrega depois da página e, se falhar, as imagens comuns continuam valendo.
if (window.WebGL2RenderingContext) {
  addEventListener('load', () => setTimeout(async () => {
    try {
      const { iniciar } = await import('./gl.js');
      cena = await iniciar({
        canvas: document.getElementById('gl'),
        moldura: document.getElementById('moldura'),
        capa: document.getElementById('inicio'),
        imagens: Object.fromEntries([...document.querySelectorAll('.ficha')].map(f => [f.dataset.id, f.getAttribute('src')])),
        inicial: ativa,
      });
      cena.mostrar(ativa);
      document.documentElement.classList.add('com-gl');
    } catch (erro) {
      console.warn('Cena 3D indisponível:', erro);
    }
  }, 150));
}
