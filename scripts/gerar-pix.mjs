// Gera public/pix.svg. Rodar de novo só se a chave, o nome ou a cidade mudarem: npm run pix
import { writeFileSync } from 'node:fs';
import QRCode from 'qrcode';
import { pixCopiaECola } from '../src/pix.js';
import { CONTATO } from '../src/projetos.js';

const payload = pixCopiaECola({ chave: CONTATO.pixChave, nome: CONTATO.nome, cidade: CONTATO.cidade });
const svg = await QRCode.toString(payload, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
writeFileSync(new URL('../public/pix.svg', import.meta.url), svg);
console.log(payload);
