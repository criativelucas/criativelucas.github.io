// Pix "copia e cola" estático (padrão BR Code), sem valor fixo.

const campo = (id, valor) => id + String(valor.length).padStart(2, '0') + valor;

// CRC16-CCITT-FALSE, exigido pelo padrão.
export function crc16(str) {
  let crc = 0xffff;
  for (const ch of str) {
    crc ^= ch.charCodeAt(0) << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function pixCopiaECola({ chave, nome, cidade }) {
  const corpo =
    campo('00', '01') +
    campo('26', campo('00', 'br.gov.bcb.pix') + campo('01', chave)) +
    campo('52', '0000') +
    campo('53', '986') +
    campo('58', 'BR') +
    campo('59', nome) +
    campo('60', cidade) +
    campo('62', campo('05', '***')) +
    '6304';
  return corpo + crc16(corpo);
}
