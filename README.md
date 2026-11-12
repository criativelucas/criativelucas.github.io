# Lucas Antonio · Jogos, sites e design

Portfólio pessoal de Lucas Antonio (Manaus, Brasil) com 12 projetos para abrir e experimentar: jogos gratuitos, sites e apps.

🔗 **Site:** https://criativelucas.github.io/

## Sobre

Página única com fundo 3D (WebGL), lista de projetos com prévia em cada item, seção de contato (WhatsApp) e apoio via Pix.

## Tecnologias

- [Vite](https://vite.dev/) + JavaScript puro
- [Three.js](https://threejs.org/) para o fundo animado
- Deploy automático no GitHub Pages (`.github/workflows/pages.yml`)

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `index.html` | Página principal |
| `src/` | Estilos e scripts (`projetos.js`, `lista.js`, `gl.js`, `pix.js`) |
| `public/cartas/` | Imagens dos projetos (WebP 640×480) |
| `scripts/` | Gerador do QR Code do Pix |
| `tests/` | Testes automatizados |

## Rodando localmente

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # gera a pasta dist
npm test         # executa os testes
```

## Atualizar a imagem de um projeto

Substitua o arquivo em `public/cartas/<id-do-projeto>.webp` (640×480) e faça o push na `main`. O deploy é automático.
