// A cena 3D da página: um dado de 20 faces em linhas na capa e a prévia do projeto com distorção.
// A câmera é montada para que 1 unidade da cena = 1 pixel da tela; assim a prévia encaixa exatamente na moldura do HTML.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, LineSegments, Points,
  IcosahedronGeometry, DodecahedronGeometry, EdgesGeometry, PlaneGeometry,
  LineBasicMaterial, PointsMaterial, ShaderMaterial, TextureLoader, SRGBColorSpace, MathUtils,
} from 'three';

const DIST = 1200;
const PROPORCAO_IMG = 4 / 3;
const TROCA = 0.75;   // segundos da transição entre dois projetos

const VERTICE = /* glsl */`
  uniform float uOnda, uTempo;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(uv.x * 3.1416) * sin(uv.y * 3.1416) * uOnda * 0.10 + sin(uv.y * 7.0 + uTempo * 3.0) * uOnda * 0.012;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;

const FRAGMENTO = /* glsl */`
  uniform sampler2D uA, uB;
  uniform float uMix, uOnda;
  uniform vec2 uCobrir;
  varying vec2 vUv;
  vec3 amostra(sampler2D t, vec2 uv, float d) {
    uv = (uv - 0.5) * uCobrir + 0.5;
    return vec3(texture2D(t, uv + vec2(d, 0.0)).r, texture2D(t, uv).g, texture2D(t, uv - vec2(d, 0.0)).b);
  }
  void main() {
    // a imagem nova entra de baixo para cima, empurrando a antiga
    float m = smoothstep(0.0, 1.0, clamp(uMix * 1.6 - (1.0 - vUv.y) * 0.6, 0.0, 1.0));
    float d = uOnda * 0.012;
    vec3 a = amostra(uA, vUv + vec2(0.0, m * 0.18), d);
    vec3 b = amostra(uB, vUv - vec2(0.0, (1.0 - m) * 0.18), d);
    gl_FragColor = vec4(mix(a, b, m), 1.0);
    #include <colorspace_fragment>
  }`;

// retorno: { mostrar(id) }
export async function iniciar({ canvas, moldura, imagens, inicial }) {
  const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const cena = new Scene();
  const camera = new PerspectiveCamera(40, 1, 10, 6000);
  camera.position.z = DIST;

  const carregador = new TextureLoader();
  const texturas = Object.fromEntries(await Promise.all(Object.entries(imagens).map(async ([id, src]) => {
    const t = await carregador.loadAsync(src);
    t.colorSpace = SRGBColorSpace;
    return [id, t];
  })));

  // ----- dado de 20 faces -----
  const linha = (geo, cor, opacidade) => new LineSegments(new EdgesGeometry(geo), new LineBasicMaterial({ color: cor, transparent: true, opacity: opacidade }));
  const ico = new IcosahedronGeometry(1, 0);
  const dado = new Group();
  const fora = linha(ico, '#edece8', 0.55);
  const dentro = linha(new DodecahedronGeometry(0.52, 0), '#edece8', 0.2);
  const pontos = new Points(ico, new PointsMaterial({ color: '#c8ff3e', size: 6, sizeAttenuation: false, transparent: true }));
  dado.add(fora, dentro, pontos);
  dado.rotation.set(0.5, 0.3, 0.1);
  cena.add(dado);

  // ----- prévia do projeto -----
  const material = new ShaderMaterial({
    vertexShader: VERTICE, fragmentShader: FRAGMENTO,
    uniforms: {
      uA: { value: texturas[inicial] }, uB: { value: texturas[inicial] },
      uMix: { value: 1 }, uOnda: { value: 0 }, uTempo: { value: 0 },
      uCobrir: { value: { x: 1, y: 1 } },
    },
  });
  const plano = new Mesh(new PlaneGeometry(1, 1, 24, 24), material);
  const previa = new Group();
  previa.add(plano);
  cena.add(previa);

  let atual = inicial, mix = 1;
  function mostrar(id) {
    if (id === atual || !texturas[id]) return;
    material.uniforms.uA.value = material.uniforms.uB.value;
    material.uniforms.uB.value = texturas[id];
    atual = id;
    mix = parado ? 1 : 0;
  }

  // ----- tela e mouse -----
  let L = 1, A = 1, mx = 0, my = 0, ux = 0, uy = 0, veloc = 0;
  function ajustar() {
    L = innerWidth; A = innerHeight;
    renderer.setSize(L, A, false);
    camera.aspect = L / A;
    camera.fov = MathUtils.radToDeg(2 * Math.atan(A / 2 / DIST));
    camera.updateProjectionMatrix();
    dado.scale.setScalar(Math.min(L, A) * (L < 820 ? 0.3 : 0.36));
  }
  addEventListener('resize', ajustar);
  ajustar();
  addEventListener('pointermove', e => {
    mx = e.clientX / L * 2 - 1; my = e.clientY / A * 2 - 1;
    veloc = Math.min(veloc + Math.hypot(e.clientX - ux, e.clientY - uy) / L * 4, 1);
    ux = e.clientX; uy = e.clientY;
  }, { passive: true });

  let antes = 0, limpo = false, ix = 0, iy = 0;
  function quadro(t) {
    requestAnimationFrame(quadro);
    const agora = t / 1000, dt = Math.min(agora - antes, 0.05);
    antes = agora;

    const rolado = scrollY;
    const r = moldura.getBoundingClientRect();
    const verDado = rolado < A;
    const verPrevia = r.bottom > 0 && r.top < A;
    if (!verDado && !verPrevia) {            // nada 3D na tela: esconde a camada e não gasta bateria
      if (!limpo) { canvas.style.visibility = 'hidden'; limpo = true; }
      return;
    }
    if (limpo) { canvas.style.visibility = ''; limpo = false; }
    ix += (mx - ix) * 0.06; iy += (my - iy) * 0.06;
    veloc *= 0.92;

    dado.visible = verDado;
    if (verDado) {
      if (!parado) { dado.rotation.y += dt * 0.16; dado.rotation.x += dt * 0.07; dentro.rotation.y -= dt * 0.4; }
      dado.position.set(L * (L < 820 ? 0.2 : 0.24) + ix * 26, A * 0.1 - iy * 18 + rolado * 0.8, 0);
      const some = Math.max(1 - rolado / (A * 0.85), 0);
      fora.material.opacity = 0.55 * some; dentro.material.opacity = 0.2 * some; pontos.material.opacity = some;
    }

    previa.visible = verPrevia;
    if (verPrevia) {
      if (mix < 1) mix = Math.min(mix + dt / TROCA, 1);
      const pa = r.width / r.height;
      material.uniforms.uCobrir.value = pa > PROPORCAO_IMG ? { x: 1, y: PROPORCAO_IMG / pa } : { x: pa / PROPORCAO_IMG, y: 1 };
      material.uniforms.uMix.value = mix;
      material.uniforms.uOnda.value = parado ? 0 : Math.sin(Math.PI * mix) + veloc * 0.5;
      material.uniforms.uTempo.value = agora;
      plano.scale.set(r.width, r.height, r.width);
      previa.position.set(r.left + r.width / 2 - L / 2, -(r.top + r.height / 2 - A / 2), 0);
      if (!parado) previa.rotation.set(iy * 0.1, ix * 0.16, 0);
    }
    renderer.render(cena, camera);
  }
  requestAnimationFrame(quadro);

  window.__cena = { renderer, cena, camera, get atual() { return atual; }, get mix() { return mix; } };
  return { mostrar };
}
