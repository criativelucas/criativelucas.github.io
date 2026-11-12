import { defineConfig } from 'vite';
import { htmlIndice, htmlFichas, htmlContato } from './src/lista.js';

export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 700 },   // a cena 3D (three.js) é um bloco só, carregado depois da página
  plugins: [{
    name: 'projetos-no-html',
    transformIndexHtml: html => html
      .replace('<!--INDICE-->', htmlIndice())
      .replace('<!--FICHAS-->', htmlFichas())
      .replace('<!--CONTATO-->', htmlContato()),
  }],
});
