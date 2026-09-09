/* ============================================================
   CONFIGURAÇÃO DO CONVITE
   Este arquivo é usado por index.html (script.js) e admin.html
   (admin.js). Edite os valores abaixo para personalizar tudo.
   ============================================================ */
window.CONFIG = {
  // --- Aniversariante ---
  guestName: 'Lívia',
  age: '18 anos', // deixe '' para não exibir

  // --- Data e hora da festa (formato ISO, usado no contador) ---
  partyDateISO: '2026-10-31T17:00:00',
  displayDate: '31 de outubro de 2026',
  displayTime: '17h',

  // --- Local ---
  venueName: 'Espaço Salão de festa',
  venueAddress: 'Rua Aratimbo, 389 - Vila Livieiro, São Paulo - SP',
  // Cole um link específico do Google Maps aqui, ou deixe '' para gerar
  // automaticamente a partir do endereço acima.
  mapsUrlOverride: '',

  // --- Presentes sugeridos ---
  // "icon" aceita um dos nomes prontos abaixo (estilo linha, igual referência):
  // 'bolsa' | 'perfume' | 'hidratante' | 'calcado' | 'joia' | 'vestido' | 'calca'
  giftCategories: [
    {
      icon: 'joia',
      name: 'Joias - Prata/Dourado',
      desc: 'Colares, anéis ou brincos',
      link: 'https://www.google.com/search?tbm=shop&q=joias+femininas'
    },
    {
      icon: 'perfume',
      name: 'Perfumes / Body Splash',
      desc: 'Fragrâncias florais ou amadeiradas',
      link: 'https://www.google.com/search?tbm=shop&q=perfume+feminino'
    },
    {
      icon: 'vestido',
      name: 'Vestidos - Tamanho P',
      desc: 'Modelos e cores à sua escolha',
      link: 'https://www.google.com/search?tbm=shop&q=vestido+feminino+tamanho+p'
    },
    {
      icon: 'calcado',
      name: 'Calçados - Tamanho 36',
      desc: 'Sandálias, tênis ou sapatos',
      link: 'https://www.google.com/search?tbm=shop&q=calcado+feminino+tamanho+36'
    },
    {
      icon: 'calca',
      name: 'Calças - Tamanho 36',
      desc: 'Jeans, alfaiataria ou moletom',
      link: 'https://www.google.com/search?tbm=shop&q=calca+feminina+tamanho+36'
    }
  ],

  // --- Pix para presentear ---
  // Deixe pixKey vazio para esconder o atalho de Pix no menu.
  pixKey: '58295787861',
  pixKeyType: 'CPF', // ex: 'CPF', 'E-mail', 'Celular', 'Aleatória'
  pixHolder: 'Livia Silva Rocha',

  // --- RSVP / WhatsApp ---
  rsvpDeadline: '05 de novembro',
  whatsappNumber: '5511999999999', // DDI + DDD + número, apenas dígitos
  whatsappMessageTemplate:
    'Oi! Aqui é {nome}. Confirmando presença na festa de aniversário! 🎉',

  // --- Música de fundo ---
  // Coloque um arquivo de áudio (mp3) na mesma pasta e informe o nome aqui,
  // ou use uma URL. Deixe '' para esconder o botão de música.
  musicUrl: 'musica.mp3',
  musicVolume: 0.45,

  // --- Chave usada como fallback no localStorage quando não há banco
  // configurado abaixo (ex: testes locais, sem internet) ---
  storageKey: 'convite_aniversario_convidados',

  // --- Senha simples para abrir o admin.html ---
  // Proteção básica só para afastar curiosos; troque por uma senha sua.
  // Não é uma segurança real, pois roda no navegador do visitante.
  adminPasscode: '1234',

  // --- Banco de dados (Firebase Firestore) ---
  // Deixe os campos vazios para o site funcionar só com localStorage
  // (cada convidado confirma apenas no próprio celular).
  // Para confirmações centralizadas (todo mundo aparece no admin.html),
  // crie um projeto gratuito em https://console.firebase.google.com,
  // ative o Firestore e cole as credenciais do seu projeto aqui:
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  }
};
