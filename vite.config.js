import { defineConfig } from 'vite';
import { htmlIndice, htmlFichas, htmlContato } from './src/lista.js';

export default defineConfig({
  base: './',
  // cssTarget: sem isso o minificador escreve "@media (width<=820px)", que iPhones com iOS antigo ignoram
  // e a página aparece no celular com o layout de computador.
  build: { chunkSizeWarningLimit: 700, cssTarget: ['safari13'] },   // a cena 3D (three.js) é um bloco só, carregado depois da página
  plugins: [{
    name: 'projetos-no-html',
    transformIndexHtml: html => html
      .replace('<!--INDICE-->', htmlIndice())
      .replace('<!--FICHAS-->', htmlFichas())
      .replace('<!--CONTATO-->', htmlContato()),
  }],
});
