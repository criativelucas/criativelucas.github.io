// Única fonte de dados do site: alimenta as cartas 3D e a lista simples.

const p = (id, categoria, nome, url, texto) => ({ id, categoria, nome, url, texto, img: `cartas/${id}.webp` });

export const PROJETOS = [
  p('primagnis', 'jogos', 'Primagnis', 'https://codex-primagnis.vercel.app/jogo',
    'Um jogo de tabuleiro em 3D num mundo movido pelo poder do plasma. Escolha uma facção, dispute territórios e chame os amigos para uma sala online.'),
  p('luzes-de-antioquia', 'jogos', 'A Luz de Antioquia', 'https://criativelucas.github.io/luzes-de-antioquia/',
    'Um jogo aconchegante em 3D: cuide da primeira igreja chamada cristã, às margens do rio Orontes. Dia e noite, estações, mini-games e um códice de histórias e versículos.'),
  p('bible-rush', 'jogos', 'Bible Rush', 'https://criativelucas.github.io/bible-rush/',
    'Ação em pixel art com os heróis do Antigo Testamento. Sobreviva às ondas, suba a Torre de Babel e volte todo dia para um desafio novo.'),
  p('jonah', 'jogos', 'Jonas: Três Dias Abaixo', 'https://criativelucas.github.io/jonah-three-days-below/',
    'Engolido pelo grande peixe, Jonas precisa sobreviver três dias dentro de um mundo vivo. Explore, colete, construa e enfrente o que se move no escuro.'),
  p('farm-defense-saga', 'jogos', 'Farm Defense Saga', 'https://criativelucas.github.io/farm-defense-saga/',
    'Você é o lavrador e a árvore está sob ataque. Ódio, Inveja e Discórdia vêm em ondas: proteja o jardim e não deixe nenhum passar.'),

  p('medrado', 'sites', 'Medrado de Mello', 'https://medrado-de-mello.vercel.app',
    'Site de um escritório de advocacia em Manaus. Apresenta os sócios, as áreas de atuação e deixa a conversa com um advogado a um toque de distância.'),
  p('cpda', 'sites', 'Laboratório CPDA', 'https://lab-cpda.vercel.app',
    'Site do Centro de Procedimentos Diagnósticos da Amazônia, laboratório de patologia em Manaus. Exames, convênios e resultados fáceis de achar, para paciente e para médico.'),
  p('duo-clinic', 'sites', 'Duo Clinic', 'https://duo-clinic-eosin.vercel.app',
    'Site de uma clínica de reposição hormonal, ginecologia e urologia em Manaus. Apresenta os médicos, explica cada especialidade e leva ao agendamento pelo WhatsApp.'),
  p('efraim', 'sites', 'Efraim Gomes Fotografia', 'https://site-efraim.vercel.app',
    'Site de um fotógrafo de ensaios gestante, newborn e família. As fotos ocupam a tela inteira e contam a história antes de qualquer texto.'),

  p('faith-steps', 'apps', 'Faith Steps', 'https://criativelucas.github.io/faith-steps/',
    'Hábitos cristãos com cara de jogo. Seu personagem cresce a cada passo de fé que você dá no dia.'),
  p('jornada-biblia', 'apps', 'Jornada Bíblica', 'https://jornadabiblia.lovable.app/',
    'Um companheiro para a leitura da Bíblia: mostra a leitura de hoje, acompanha seu progresso e deixa o caminho inteiro à vista.'),
  p('eternos-planner', 'apps', 'Eternos Planner', 'https://eternos-planner.lovable.app',
    'Um planejador de casamento para casais. Tudo o que precisa ser decidido até o grande dia, organizado num só lugar.'),
];

export const CATEGORIAS = {
  jogos: { titulo: 'Jogos', cor: '#d0603f' },
  sites: { titulo: 'Sites', cor: '#d9a441' },
  apps: { titulo: 'Apps', cor: '#4f8fb3' },
  mesa: { titulo: 'Estúdio', cor: '#3b2a1d' },
};

export const CONTATO = {
  nome: 'Lucas Antonio',
  whatsapp: 'https://wa.me/5592993625934?text=' + encodeURIComponent('Oi Lucas, vi seu site e quero conversar sobre um projeto.'),
  pixChave: '+5592993625934',
  pixExibicao: '(92) 99362-5934',
  cidade: 'Manaus',
};

// Cartas da borda da mesa.
export const MESA = [
  { id: 'sobre', categoria: 'mesa', nome: 'Sobre mim',
    texto: 'Sou Lucas Antonio. Crio jogos, sites e design. Gosto de transformar ideias em coisas que dá para abrir, tocar e jogar. Os jogos daqui são todos gratuitos.' },
  { id: 'contato', categoria: 'mesa', nome: 'Contato',
    texto: 'Tem um projeto em mente? Um site, um jogo, uma ideia ainda sem forma? Me chama no WhatsApp e a gente conversa.' },
  { id: 'doacao', categoria: 'mesa', nome: 'Apoiar',
    texto: 'Os jogos são gratuitos e vão continuar assim. Se algum te fez bem e você quiser ajudar os próximos a nascer, qualquer valor no Pix já ajuda.' },
];
