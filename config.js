/* ============================================================
   CONFIGURAÇÃO DO CONVITE
   Este arquivo é usado por index.html (script.js) e admin.html
   (admin.js). Edite os valores abaixo para personalizar tudo.
   ============================================================ */
window.CONFIG = {
  // --- Aniversariante ---
  guestName: 'Livia',
  age: '18 anos', // deixe '' para não exibir

  // --- Data e hora da festa (formato ISO, usado no contador) ---
  partyDateISO: '2026-10-31T17:00:00',
  displayDate: '31 de outubro de 2026',
  displayTime: '17h',

  // --- Local ---
  venueName: 'Espaço Salão de festas ',
  venueAddress: 'Rua Aratimbo, 389 - Vila Livieiro, São Paulo - SP',
  // Cole um link específico do Google Maps aqui, ou deixe '' para gerar
  // automaticamente a partir do endereço acima.
  mapsUrlOverride: '',

  // --- Presentes sugeridos ---
  // "icon" aceita um dos nomes prontos abaixo (estilo linha, igual referência):
  // 'bolsa' | 'perfume' | 'hidratante' | 'calcado' | 'joia' | 'vestido' | 'calca'
  giftCategories: [
    {
      icon: 'Acessorios',
      name: 'Acessorios - Prata/Dourado',
      desc: 'Colares, anéis ou brincos',
      link: 'https://www.google.com/search?tbm=shop&q=joias+femininas'
    },
    {
      icon: 'perfume',
      name: 'Perfumes / Body Splash',
      desc: 'Fragrâncias florais ou amadeiradas',
      link:'https://www.google.com/goto?url=CAESkwEB6zswFU-qKyzpWVzV6KbpPzsDy6bGPGeH3WCLvRITjwxGLSY4pXXASc2bcPnvGYi_Aurdrs0abMrji80Wm2AtuRcvHd1CXzFHMnnFPWK1rYiUYr6WiC8J9gY2B0-v3RjP5NCladLhh02y7ahbclvIYeY36n5PNQuD1_NtvwtP0wWdH0QRsrr3NAhkNP9CSYxBMa0'
    },
    {
      icon: 'vestido',
      name: 'Roupas - Tamanho P/36',
      desc: 'Modelos e cores à sua escolha',
      link: 'https://www.google.com/aclk?sa=L&ai=DChsSEwivyOn9p-WWAxUNRkgAHSUyAigYACICCAEQABoCY2U&co=1&gclid=EAIaIQobChMIr8jp_afllgMVDUZIAB0lMgIoEAAYASAAEgKD6fD_BwE&sph&cid=CAAS0gHkaBiwcUkVUfrsNSGTct0JwP64hyuknAGYCJ-f93Spu8dR7qgkH_pNJOKbtxJUb33Hx1L_-x3D96DYup4AC6YJfDmOO0KGBKdqnTD7aIqm0i1RG_UewvMKAdCpjr-WvvVanKrm37SGWrUDrgfOKDbXwcqzgkH4W6vtvwUCBcp4J8Ql6qTwiFECcNgtHuTO-4v5F-QY6p8_rk_D7SyGcO2Nxfs_TqsOUH_6goIL4yenTW0UcvCmdZc6gHioH6RcSOkRYT5cXCjJJPCpTS-ou0--Kr4&cce=1&sig=AOD64_3sKjdYtWiDVSJP-UD6NwxznA8K1g&q&adurl&ved=2ahUKEwiyxeT9p-WWAxXNEbkGHd1yMjAQ0Qx6BAgWEAE'
    },
    {
      icon: 'calcado',
      name: 'Calçados - Tamanho 37',
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
  whatsappNumber: '5511966524934', // DDI + DDD + número, apenas dígitos
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

  // --- Endereço público do site, usado pelo gerador de links individuais
  // no admin.html. Preencha com o link da Vercel depois de publicar
  // (ex: 'https://convite-3.vercel.app'), SEM barra no final.
  // Se deixar vazio, o gerador tenta adivinhar pelo endereço atual do
  // navegador — o que só funciona se você abrir o admin.html pelo link
  // publicado, não pelo arquivo local do computador.
  siteBaseUrl: 'https://convite-3.vercel.app',

  // --- Banco de dados (Firebase Firestore) ---
  // Deixe os campos vazios para o site funcionar só com localStorage
  // (cada convidado confirma apenas no próprio celular).
  // Para confirmações centralizadas (todo mundo aparece no admin.html),
  // crie um projeto gratuito em https://console.firebase.google.com,
  // ative o Firestore e cole as credenciais do seu projeto aqui:
  firebase: {
    apiKey: 'AIzaSyBT4sfNvQ71PxfJj8ZhPQXF0CLWJSc17D0',
    authDomain: 'convite-684a2.firebaseapp.com',
    projectId: 'convite-684a2',
    storageBucket: 'convite-684a2.firebasestorage.app',
    messagingSenderId: '539161883996',
    appId: '1:539161883996:web:e271df279301b55aadbd99'
  }
};
