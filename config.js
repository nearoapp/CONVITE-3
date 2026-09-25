/* ============================================================
   CONFIGURAÇÃO DO CONVITE
   Este arquivo é usado por index.html (script.js) e admin.html
   (admin.js). Edite os valores abaixo para personalizar tudo.
   ============================================================ */
window.CONFIG = {
  // --- Aniversariante ---
  guestName: 'Livia',
  age: '18 anos', // deixe '' para não exibir

  // --- Letras dentro do círculo do envelope (o "selo") e do monograma
  // acima do envelope. Deixe '' para calcular automaticamente a partir do
  // guestName (ex.: "Livia" -> "LI"; "Maria Fernanda" -> "MF"). Preencha
  // aqui (ex.: 'L') se quiser escolher as letras manualmente.
  monogramInitials: 'L',

  // --- Data e hora da festa (formato ISO, usado no contador) ---
  partyDateISO: '2026-10-31T17:00:00',
  displayDate: '31 de outubro de 2026',
  displayTime: '17h',

  // --- Local ---
  venueName: 'Salão de festa 1',
  venueAddress: 'Rua Aratimbo, 389 - Vila Livieiro, São Paulo - SP',
  // Cole um link específico do Google Maps aqui, ou deixe '' para gerar
  // automaticamente a partir do endereço acima.
  mapsUrlOverride: '',

  // --- Sugestão de presentes ---
  // Texto livre, no formato "um mimo, se desejar" (título + intro + lista
  // com coraçõezinhos + recadinho sobre preferir receber em dinheiro).
  // Itens marcados com [EDITE AQUI] estavam ilegíveis na foto de referência
  // (trecho borrado) — troque pelo texto certo antes de publicar.
  giftsSection: {
    title: 'um mimo, se desejar',
    intro: [
      'antes de qualquer coisa...\na sua presença já é o maior\npresente que eu poderia receber.',
      'mas, caso queira me presentear,\npreparei algumas sugestões\npara facilitar:'
    ],
    suggestions: [
      'perfumes',
      'maquiagem',
      'acessórios',
      'Vestuarios  Tam P/36 ',
      'Calçados Tam 37',
      'ou qualquer lembrança escolhida com carinho.'
    ],
    note: {
      title: 'um recadinho...',
      paragraphs: [
        'se for mais prático para você, também fico muito feliz em receber o valor que seria destinado ao presente. assim, consigo escolher algo que vou usar e guardar essa lembrança com muito carinho.',
        'mas fique totalmente à vontade: seja um presente, um mimo ou apenas a sua presença, tudo será recebido com o mesmo carinho.'
      ]
    }
  },

  // --- Pix para presentear ---
  // Deixe pixKey vazio para esconder o atalho de Pix no menu e o cartão
  // de QR code na seção de presentes.
  // ATENÇÃO: pixKeyType está como 'CPF' e o código-fonte desta página fica
  // público (qualquer visitante consegue ver isso pelo navegador). Um CPF
  // completo é dado sensível — o ideal é trocar para e-mail, celular ou
  // chave aleatória antes de publicar. Veja o README para mais detalhes.
  pixKey: '58295787861',
  pixKeyType: 'CPF', // ex: 'CPF', 'E-mail', 'Celular', 'Aleatória'
  pixHolder: 'Livia Silva Rocha',
  // Cidade do titular da chave Pix, usada só para montar o QR code
  // (formato oficial do Banco Central exige uma cidade no payload).
  pixCity: 'Sao Paulo',

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
  // Esta é a senha do painel do CLIENTE (quem encomendou o convite) —
  // ele vê só a lista de confirmações, nada de rastreamento de aberturas.
  // A senha em si NÃO fica em texto puro aqui — só o "hash" dela (uma
  // impressão digital que não dá pra reverter para a senha original).
  // A senha real está documentada no README, junto com o passo a passo
  // pra trocar quando quiser.
  adminPasscodeHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',

  // --- Sua marca, como criador(a) do convite ---
  // Aparece só de forma discreta: uma linha pequena no rodapé do convite
  // e uma linha na descrição do evento quando alguém adiciona a festa
  // à própria agenda. Não interfere em nada do convite em si.
  creator: {
    name: ' jeff convites digitais.',              // como você quer ser identificado
    whatsappNumber: '5511946084421', // DDI + DDD + número, só dígitos
    // {guestName} é substituído automaticamente pelo nome do aniversariante
    messageTemplate: 'Oi! Vi o convite digital da {guestName} e adorei — quero fazer o meu também!'
  },

  // --- Senha do SEU painel exclusivo (meu-painel.html) ---
  // Diferente da senha do admin.html. Só você deve conhecer esta senha.
  // Nele você vê quantas pessoas abriram o convite e quem clicou para
  // pedir o convite delas — o cliente (dono da festa) não tem acesso a isso.
  // Mesma lógica do adminPasscodeHash acima: aqui só fica o hash, a senha
  // real está no README.
  creatorPasscodeHash: '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225',

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
