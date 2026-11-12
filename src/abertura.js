// Abertura: o nome vira uma malha de linhas (wireframe) e se desfaz em partículas conforme a página rola,
// até revelar a capa. É um extra: sem ele (ou com "reduzir movimento"), a página abre direto na capa.

const FONTE = '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif';
const MONO = '"DM Mono", ui-monospace, Menlo, monospace';
const TINTA = [237, 236, 232], ACENTO = [200, 255, 62], APAGADO = [128, 127, 122];
const F = 1000;   // distância focal da "câmera" (perspectiva das partículas)
const CHEGADA = 3.2; // segundos que a câmera leva para chegar de frente ao nome

const espera = ms => new Promise(r => setTimeout(r, ms));
const lim = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const suave = (a, b, v) => { const t = lim((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const cor = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
const sinal = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(3);

// sorteio com semente: a malha sai igual toda vez que é refeita
function sorteio(a) {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// a fonte do título chega depois da página; espera um pouco por ela para a malha ter o desenho certo
async function esperarFonte(limite = 2500) {
  const fim = performance.now() + limite;
  while (performance.now() < fim) {
    if ([...document.fonts].some(f => f.family.replace(/["']/g, '') === 'Bricolage Grotesque')) {
      try { await Promise.race([document.fonts.load(`800 100px ${FONTE}`, 'LUCAS ANTONIO'), espera(fim - performance.now())]); } catch { /* segue com a reserva */ }
      return;
    }
    await espera(50);
  }
}

function fonte(c, tam) {
  c.font = `800 ${tam}px ${FONTE}`;
  if ('letterSpacing' in c) c.letterSpacing = `${(-0.045 * tam).toFixed(2)}px`;
}

export async function iniciarAbertura() {
  const html = document.documentElement;
  const raiz = document.querySelector('.abertura');
  if (!raiz || !html.classList.contains('com-abertura')) return;
  const palco = raiz.querySelector('.palco');
  const canvas = raiz.querySelector('.malha');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('sem canvas 2D');
  const hud = raiz.querySelector('.hud');
  const elVert = raiz.querySelector('[data-vertices]');
  const elInt = raiz.querySelector('[data-integridade]');
  const elCoord = raiz.querySelector('[data-coord]');
  const elFim = raiz.querySelector('.hud-fim');
  const barra = raiz.querySelector('.barra');
  const capa = document.querySelector('.capa');

  html.classList.add('abertura-viva');

  // o nome grande da capa só sobe quando chega na tela (antes ele estava escondido atrás da abertura)
  new IntersectionObserver((itens, obs) => {
    if (itens.some(i => i.isIntersecting)) { capa.classList.add('entrou'); obs.disconnect(); }
  }, { threshold: 0.3 }).observe(capa.querySelector('h1'));

  let L = 0, A = 0, malha = null, nasceu = 0;

  function medir() {
    L = palco.clientWidth; A = palco.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(L * dpr); canvas.height = Math.round(A * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Desenha o nome escondido, amostra os pixels numa grade com leve desvio e liga os vizinhos em triângulos.
  function montar() {
    const deitado = L / A > 1.15;
    const textos = deitado ? ['LUCAS ANTONIO'] : ['LUCAS', 'ANTONIO'];
    const off = document.createElement('canvas');
    const o = off.getContext('2d', { willReadFrequently: true });
    fonte(o, 100);
    const larg100 = Math.max(...textos.map(t => o.measureText(t).width));
    const tam = Math.min(100 * L * (deitado ? 0.84 : 0.86) / larg100, A * (deitado ? 0.36 : 0.22));
    fonte(o, tam);
    const capH = o.measureText('H').actualBoundingBoxAscent || tam * 0.72;
    const entre = tam * 0.84;
    const larg = Math.max(...textos.map(t => o.measureText(t).width));
    const pad = Math.ceil(tam * 0.08);
    const W = Math.ceil(larg + pad * 2), H = Math.ceil(capH + entre * (textos.length - 1) + pad * 2);
    off.width = W; off.height = H;
    fonte(o, tam);                                   // mudar o tamanho do canvas zera o estilo
    o.textAlign = 'center'; o.textBaseline = 'alphabetic'; o.fillStyle = '#fff';
    const bases = textos.map((_, i) => pad + capH + i * entre);
    textos.forEach((t, i) => o.fillText(t, W / 2, bases[i]));
    const px = o.getImageData(0, 0, W, H).data;
    const cheio = (x, y) => px[((y | 0) * W + (x | 0)) * 4 + 3] > 140;

    let area = 0;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (cheio(x, y)) area += 4;
    const alvo = L < 700 ? 1100 : L < 1200 ? 1700 : 2300;
    const passo = Math.max(4, Math.sqrt(area / alvo));
    const cols = Math.ceil(W / passo), rows = Math.ceil(H / passo);
    const mapa = new Int32Array(cols * rows).fill(-1);
    const rnd = sorteio(7);
    const hx = [], hy = [];
    for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
      const x = (gx + 0.5) * passo, y = (gy + 0.5) * passo;
      if (x >= W || y >= H || !cheio(x, y)) continue;
      mapa[gy * cols + gx] = hx.length;
      hx.push(x - W / 2 + (rnd() - 0.5) * passo * 0.62);
      hy.push(y - H / 2 + (rnd() - 0.5) * passo * 0.62);
    }
    const ar = [];
    const em = (gx, gy) => (gx < cols && gy < rows ? mapa[gy * cols + gx] : -1);
    for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
      const a = em(gx, gy), d = em(gx + 1, gy), b = em(gx, gy + 1), c = em(gx + 1, gy + 1);
      if (a >= 0 && d >= 0) ar.push(a, d);
      if (a >= 0 && b >= 0) ar.push(a, b);
      if (rnd() < 0.5) { if (a >= 0 && c >= 0) ar.push(a, c); }
      else if (d >= 0 && b >= 0) ar.push(d, b);
    }

    const n = hx.length, f32 = () => new Float32Array(n);
    const M = {
      n, W, H, tam, textos, bases,
      hx: Float32Array.from(hx), hy: Float32Array.from(hy),
      sx: f32(), sy: f32(), sz: f32(), vx: f32(), vy: f32(), vz: f32(),
      lim: f32(), fase: f32(), atraso: f32(),
      px: f32(), py: f32(), q: f32(), m: f32(), tam2: f32(), grupo: new Uint8Array(n),
      ar: Uint32Array.from(ar), nivel: new Uint8Array(ar.length / 2),
    };
    for (let i = 0; i < n; i++) {
      const nx = (M.hx[i] + W / 2) / W;
      const ang = rnd() * Math.PI * 2, raio = Math.max(L, A) * (0.4 + rnd() * 0.5);
      M.sx[i] = Math.cos(ang) * raio; M.sy[i] = Math.sin(ang) * raio; M.sz[i] = (rnd() - 0.3) * 900;
      M.vx[i] = (0.25 + rnd() * 0.75) * L * 0.55;     // o pó sai para a direita, para cima e em direção à tela
      M.vy[i] = -(0.15 + rnd() * 0.85) * A * 0.5;
      M.vz[i] = (rnd() * 1.3 - 0.35) * 800;
      M.lim[i] = 0.03 + nx * 0.46 + rnd() * 0.12;      // a quebra varre o nome da esquerda para a direita
      M.fase[i] = rnd() * 6.283;
      M.atraso[i] = nx * 0.45 + rnd() * 0.3;
    }
    return M;
  }

  // chão em grade, em perspectiva, que corre mais rápido quando a página rola
  function chao(t, p, entra) {
    const a = entra * (1 - 0.75 * suave(0.7, 1, p));
    if (a < 0.01) return;
    const hor = A * 0.64 + iy * 6, base = A - hor, cx = L / 2 - ix * 24, S = L * 0.08;
    const g = ctx.createLinearGradient(0, hor, 0, A);
    g.addColorStop(0, cor(TINTA, 0)); g.addColorStop(1, cor(TINTA, 0.14 * a));
    ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath();
    for (let xw = -16; xw <= 16; xw++) { ctx.moveTo(cx + xw * S, A); ctx.lineTo(cx + xw * S / 40, hor + base / 40); }
    const corre = (t * 0.25 + p * 4) % 1;
    for (let k = 0; k < 34; k++) {
      const z = 0.6 + (k + 1 - corre) * 0.55, y = hor + base / z;
      if (y > A) continue;
      ctx.moveTo(0, y); ctx.lineTo(L, y);
    }
    ctx.stroke();
  }

  let mx = 0, my = 0, ix = 0, iy = 0;
  addEventListener('pointermove', e => {
    mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1;
  }, { passive: true });

  let falha = { ate: 0, prox: 3, y0: 0, y1: 0, dx: 0 };

  function desenhar(t, p, boot) {
    const M = malha, n = M.n;
    ctx.clearRect(0, 0, L, A);
    const cx = L / 2 + ix * 14, cy = A * 0.47 + iy * 10;
    const zoom = 1 + p * 0.14;
    const entra = suave(0, 0.8, boot);

    // Câmera: começa longe, de lado, por baixo e inclinada, e vem até ficar de frente para o nome.
    // Depois, conforme a página rola, ela gira de novo e avança para dentro da malha.
    const voo = 1 - suave(0, CHEGADA, boot);                 // 1 no começo, 0 quando pousa
    const giro = suave(0.12, 0.9, p);
    const guinada = -0.95 * voo + 0.42 * giro, arfagem = 0.5 * voo - 0.1 * giro, rolo = 0.16 * voo;
    const recuo = 1150 * voo - 260 * giro;
    const cg = Math.cos(guinada), sg = Math.sin(guinada), ca = Math.cos(arfagem), sa = Math.sin(arfagem), cr = Math.cos(rolo), sr = Math.sin(rolo);
    const pouso = suave(CHEGADA - 0.7, CHEGADA + 0.2, boot);  // os enfeites planos só entram com a câmera de frente

    chao(t, p, entra);

    // falha (glitch) de vez em quando: uma faixa do nome escorrega para o lado por um instante
    if (t > falha.prox && p < 0.3 && boot > CHEGADA + 0.5) {
      const c = (Math.random() - 0.5) * M.H, h = M.H * (0.06 + Math.random() * 0.14);
      falha = { ate: t + 0.09 + Math.random() * 0.08, prox: t + 2.2 + Math.random() * 3, y0: c - h / 2, y1: c + h / 2, dx: (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 22) };
    }
    const glitch = t < falha.ate;

    // posição de cada vértice: montagem (entrada) + desintegração (rolagem) + perspectiva
    let soltos = 0;
    for (let i = 0; i < n; i++) {
      const m = lim((boot - M.atraso[i]) / 1.1);
      const q = lim((p - M.lim[i]) / 0.3);
      M.m[i] = m; M.q[i] = q;
      if (q > 0.5) soltos++;
      let x = M.hx[i] * zoom, y = M.hy[i] * zoom, z = 0;
      if (m < 1) {
        const e = 1 - (1 - m) ** 3;
        x = M.sx[i] + (x - M.sx[i]) * e; y = M.sy[i] + (y - M.sy[i]) * e; z = M.sz[i] * (1 - e);
      }
      if (q > 0) {
        const e = q * q;
        x += e * M.vx[i] + Math.sin(t * 1.3 + M.fase[i]) * 18 * q;
        y += e * M.vy[i] + Math.cos(t * 1.1 + M.fase[i]) * 12 * q;
        z += e * M.vz[i];
      } else {
        y += Math.sin(t * 1.6 + M.hx[i] * 0.012) * 0.8;
        if (glitch && M.hy[i] > falha.y0 && M.hy[i] < falha.y1) x += falha.dx;
      }
      const xr = x * cr - y * sr, yr = x * sr + y * cr;       // rolo
      const xg = xr * cg + z * sg, zg = z * cg - xr * sg;     // guinada
      const ya = yr * ca - zg * sa;                            // arfagem
      z = yr * sa + zg * ca - recuo;
      const k = F / Math.max(F - z, 60);
      M.px[i] = cx + xg * k; M.py[i] = cy + ya * k;
      // grupo: 0..5 tinta (presos, por transparência), 6..11 acento (soltando), 255 invisível
      let a, g;
      if (q > 0) { a = 1 - suave(0.4, 1, q); g = 6; } else { a = 0.25 + 0.6 * m; g = 0; }
      if (F - z < 120) a = 0;
      const nv = Math.round(a * 5);
      M.grupo[i] = nv === 0 ? 255 : g + nv;
      M.tam2[i] = (q > 0 ? 1.4 + q * 2.4 : 1.3) * k;
    }

    // arestas: só entre vértices ainda presos; as da borda que está quebrando brilham em acento
    const ar = M.ar;
    for (let j = 0, e = 0; j < ar.length; j += 2, e++) {
      const a = ar[j], b = ar[j + 1];
      const qq = Math.max(M.q[a], M.q[b]);
      let v = 255;
      if (qq > 0.08) v = 255;
      else if (qq > 0) v = 3;
      else { const mm = Math.min(M.m[a], M.m[b]); v = mm < 0.6 ? 255 : mm < 0.85 ? 0 : mm < 1 ? 1 : 2; }
      M.nivel[e] = v;
    }
    const niveis = [[TINTA, 0.07], [TINTA, 0.14], [TINTA, 0.24], [ACENTO, 0.55]];
    ctx.lineWidth = 0.6; ctx.setLineDash([]);
    for (let nv = 0; nv < 4; nv++) {
      ctx.beginPath();
      for (let j = 0, e = 0; j < ar.length; j += 2, e++) {
        if (M.nivel[e] !== nv) continue;
        const a = ar[j], b = ar[j + 1];
        ctx.moveTo(M.px[a], M.py[a]); ctx.lineTo(M.px[b], M.py[b]);
      }
      ctx.strokeStyle = cor(niveis[nv][0], niveis[nv][1] * entra);
      ctx.stroke();
    }

    // vértices
    for (let g = 1; g < 12; g++) {
      if (g === 6) continue;
      ctx.beginPath();
      let algum = false;
      for (let i = 0; i < n; i++) {
        if (M.grupo[i] !== g) continue;
        const s = M.tam2[i];
        ctx.rect(M.px[i] - s / 2, M.py[i] - s / 2, s, s);
        algum = true;
      }
      if (!algum) continue;
      ctx.fillStyle = g < 6 ? cor(TINTA, (g / 5) * 0.85) : cor(ACENTO, (g - 6) / 5);
      ctx.fill();
    }

    const w = M.W * zoom / 2 + 18, h = M.H * zoom / 2 + 14;

    // contorno tracejado do nome, andando como "formigas"
    const aContorno = 0.5 * pouso * (1 - suave(0.015, 0.12, p));
    if (aContorno > 0.01) {
      ctx.save();
      ctx.translate(cx, cy); ctx.scale(zoom, zoom);
      fonte(ctx, M.tam); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.setLineDash([5, 4]); ctx.lineDashOffset = -t * 16; ctx.lineWidth = 1 / zoom;
      ctx.strokeStyle = cor(TINTA, aContorno);
      M.textos.forEach((s, i) => ctx.strokeText(s, 0, M.bases[i] - M.H / 2));
      ctx.restore();
      ctx.setLineDash([]);
    }

    // cantoneiras e medida em volta do nome
    const aCaixa = pouso * (1 - suave(0, 0.12, p));
    if (aCaixa > 0.01) {
      const c = 14;
      ctx.lineWidth = 1; ctx.strokeStyle = cor(ACENTO, 0.9 * aCaixa);
      ctx.beginPath();
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const x = cx + sx * w, y = cy + sy * h;
        ctx.moveTo(x, y - sy * c); ctx.lineTo(x, y); ctx.lineTo(x - sx * c, y);
      }
      ctx.stroke();
      ctx.font = `500 10px ${MONO}`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = '1px';
      ctx.fillStyle = cor(APAGADO, aCaixa);
      ctx.textAlign = 'left'; ctx.fillText(`${Math.round(M.W)} × ${Math.round(M.H)} PX`, cx - w, cy - h - 10);
      ctx.textAlign = 'right'; ctx.fillText(`MALHA.01 · ${n} PTS`, cx + w, cy + h + 18);
    }

    // linha de varredura parada (antes de rolar)
    const aScan = pouso * (1 - suave(0, 0.05, p));
    const ciclo = (t * 0.32) % 1.5;
    if (aScan > 0.01 && ciclo < 1) {
      const y = cy - h + ciclo * h * 2;
      const gl = ctx.createLinearGradient(0, y - 40, 0, y);
      gl.addColorStop(0, cor(ACENTO, 0)); gl.addColorStop(1, cor(ACENTO, 0.1 * aScan));
      ctx.fillStyle = gl; ctx.fillRect(cx - w, y - 40, w * 2, 40);
      ctx.fillStyle = cor(ACENTO, 0.6 * aScan); ctx.fillRect(cx - w, y, w * 2, 1);
    }

    // frente de desintegração: uma lâmina vertical em acento que acompanha a quebra
    const frente = (p - 0.09) / 0.46;
    if (frente > -0.05 && frente < 1.1) {
      const a = suave(-0.05, 0.05, frente) * (1 - suave(0.95, 1.1, frente));
      const x = cx + (-M.W / 2 + frente * M.W) * zoom, hh = h * 1.25;
      const gv = ctx.createLinearGradient(0, cy - hh, 0, cy + hh);
      gv.addColorStop(0, cor(ACENTO, 0)); gv.addColorStop(0.5, cor(ACENTO, 0.85 * a)); gv.addColorStop(1, cor(ACENTO, 0));
      ctx.fillStyle = gv; ctx.fillRect(x - 0.75, cy - hh, 1.5, hh * 2);
      const gh = ctx.createLinearGradient(x - 60, 0, x + 6, 0);
      gh.addColorStop(0, cor(ACENTO, 0)); gh.addColorStop(1, cor(ACENTO, 0.09 * a));
      ctx.fillStyle = gh; ctx.fillRect(x - 60, cy - hh * 0.7, 66, hh * 1.4);
    }

    return soltos;
  }

  let ultimo = '';
  function painel(p, boot, soltos) {
    const vert = Math.round(malha.n * suave(0, 1.6, boot));
    const integ = Math.round(100 * (1 - soltos / malha.n));
    const coord = `X ${sinal(ix)} · Y ${sinal(-iy)}`;
    const chave = `${vert}|${integ}|${coord}`;
    if (chave !== ultimo) {
      ultimo = chave;
      elVert.textContent = vert.toLocaleString('pt-BR');
      elInt.textContent = `${integ}%`;
      elCoord.textContent = coord;
    }
    barra.style.setProperty('--p', p.toFixed(3));
    hud.style.opacity = (1 - suave(0.78, 0.95, p)).toFixed(3);
    elFim.style.opacity = suave(0.74, 0.86, p).toFixed(3);
  }

  function quadro(ms) {
    requestAnimationFrame(quadro);
    if (!malha) return;
    const r = raiz.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= innerHeight) return;     // fora da tela: não gasta bateria
    const t = ms / 1000;
    const p = lim(-r.top / Math.max(r.height - A, 1));
    const boot = t - nasceu;
    ix += (mx - ix) * 0.05; iy += (my - iy) * 0.05;
    const soltos = desenhar(t, p, boot);
    painel(p, boot, soltos);
  }

  medir();
  let refazer = 0;
  new ResizeObserver(() => {
    const l = palco.clientWidth, a = palco.clientHeight;
    if (l === L && Math.abs(a - A) < 120) return;     // barra do navegador no celular: ignora
    clearTimeout(refazer);
    refazer = setTimeout(() => { medir(); malha = montar(); nasceu = -100; }, 150);
  }).observe(palco);

  await esperarFonte();
  malha = montar();
  nasceu = performance.now() / 1000;
  requestAnimationFrame(quadro);
}

