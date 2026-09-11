/* ============================================================
   LÓGICA DO CONVITE
   As informações personalizáveis ficam em config.js (window.CONFIG).
   ============================================================ */
const CONFIG = window.CONFIG;

/* ============================================================
   BANCO DE DADOS (Firebase Firestore, com fallback em localStorage)
   ============================================================ */
let db = null;

function bancoConfigurado() {
  return !!(CONFIG.firebase && CONFIG.firebase.apiKey);
}

function iniciarBanco() {
  if (!bancoConfigurado()) return;
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(CONFIG.firebase);
    }
    db = firebase.firestore();
  } catch (erro) {
    console.error('Não foi possível conectar ao banco, usando localStorage.', erro);
    db = null;
  }
}

// O localStorage pode ficar indisponível quando o arquivo é aberto direto
// (duplo-clique, sem servidor). Essas funções evitam que isso quebre o site.
function lerConvidadosLocal() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
  } catch (erro) {
    return [];
  }
}

function gravarConvidadosLocal(lista) {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(lista));
  } catch (erro) {
    console.warn('localStorage indisponível; a confirmação não pôde ser salva localmente.');
  }
}

async function salvarConvidado(dados) {
  if (db) {
    try {
      await db.collection('convidados').add({
        nome: dados.nome,
        status: dados.status,
        acompanhantes: dados.acompanhantes,
        mensagem: dados.mensagem,
        linkDe: dados.linkDe || null,
        confirmadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      return;
    } catch (erro) {
      console.error('Falha ao salvar no banco, salvando localmente.', erro);
    }
  }
  const lista = lerConvidadosLocal();
  lista.push({ ...dados, confirmadoEm: new Date().toISOString() });
  gravarConvidadosLocal(lista);
}

/* ============================================================
   ÍCONES DE LINHA (estilo da referência) PARA OS PRESENTES
   ============================================================ */
const ICONES_PRESENTE = {
  bolsa: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 18h24l2 24H10l2-24z"/><path d="M17 18v-4a7 7 0 0 1 14 0v4"/></svg>',
  perfume: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="17" y="16" width="14" height="24" rx="3"/><rect x="21" y="9" width="6" height="7" rx="1"/><path d="M24 4v3"/><circle cx="24" cy="27" r="4"/></svg>',
  hidratante: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="15" y="14" width="18" height="26" rx="4"/><rect x="19" y="8" width="10" height="6" rx="1.5"/><path d="M20 22h8M20 28h8"/></svg>',
  calcado: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8 38l0-8a4 4 0 0 1 4-4h5a11 11 0 0 0 11-11v-3a6 6 0 0 1 6-6h1a7 7 0 0 1 7 7c0 6 2 12 8 16l7 5a4 4 0 0 1 2 4v0a4 4 0 0 1-4 4h-32a4 4 0 0 1-4-4z"/></svg>',
  joia: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 16c3-4 8-6 10-6s7 2 10 6"/><path d="M11 18h26l-13 20-13-20z"/><circle cx="24" cy="13" r="3"/></svg>',
  vestido: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M19 8l-4 6 5 3-8 22h24l-8-22 5-3-4-6"/><path d="M19 8c1.5 2 3 3 5 3s3.5-1 5-3"/></svg>',
  calca: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 8h18l1 8-2 4 2 20h-7l-3-19-3 19h-7l2-20-2-4 1-8z"/></svg>'
};

/* ============================================================
   TRAVAR SCROLL ATÉ ABRIR O ENVELOPE
   ============================================================ */
document.body.classList.add('no-scroll');

/* ============================================================
   PREENCHER CONTEÚDO A PARTIR DO CONFIG
   ============================================================ */
/* ============================================================
   LINK INDIVIDUAL DO CONVIDADO (?convidado=Nome)
   Gerado pelo painel admin, ajuda a rastrear de onde veio cada resposta.
   ============================================================ */
function lerConvidadoDaUrl() {
  const parametros = new URLSearchParams(window.location.search);
  const nome = parametros.get('convidado');
  return nome ? nome.trim() : '';
}

function iniciarLinkIndividual() {
  const nomeConvidado = lerConvidadoDaUrl();
  if (!nomeConvidado) return;
  const campoNome = document.getElementById('rsvp-name');
  if (campoNome && !campoNome.value) campoNome.value = nomeConvidado;
}

function preencherConteudo() {
  document.getElementById('guest-name').textContent = CONFIG.guestName;
  document.getElementById('guest-age').textContent = CONFIG.age || '';

  // Iniciais para o monograma e o selo do envelope (ex.: "Maria Fernanda" -> "MF")
  const iniciais = (() => {
    const partes = (CONFIG.guestName || '').trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '';
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  })();
  document.getElementById('monogram-initials').textContent = iniciais;
  document.getElementById('envelope-seal-initials').textContent = iniciais;
  document.getElementById('envelope-guest-name').textContent = CONFIG.guestName;
  document.getElementById('envelope-guest-age').textContent = CONFIG.age || '';

  document.getElementById('info-date').textContent = CONFIG.displayDate;
  document.getElementById('info-time').textContent = CONFIG.displayTime;
  document.getElementById('info-venue').textContent = CONFIG.venueName;
  document.getElementById('info-address').textContent = CONFIG.venueAddress;

  const mapsUrl = CONFIG.mapsUrlOverride
    ? CONFIG.mapsUrlOverride
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.venueAddress)}`;
  document.getElementById('btn-maps').setAttribute('href', mapsUrl);

  document.getElementById('rsvp-deadline') && (document.getElementById('rsvp-deadline').textContent = CONFIG.rsvpDeadline);

  const grid = document.getElementById('gifts-grid');
  grid.innerHTML = '';
  CONFIG.giftCategories.forEach((gift) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'gift-card';
    const svgIcone = ICONES_PRESENTE[gift.icon] || ICONES_PRESENTE.bolsa;
    card.innerHTML = `
      <span class="gift-icon" aria-hidden="true">${svgIcone}</span>
      <span class="gift-name">${gift.name}</span>
      <span class="gift-desc">${gift.desc}</span>
    `;
    card.addEventListener('click', () => {
      window.open(gift.link, '_blank', 'noopener');
    });
    grid.appendChild(card);
  });

  if (CONFIG.musicUrl) {
    const audio = document.getElementById('bg-music');
    const botaoMusica = document.getElementById('btn-music');
    audio.src = CONFIG.musicUrl;
    botaoMusica.hidden = false;
  }
}

/* ============================================================
   ANIMAÇÃO DO ENVELOPE
   ============================================================ */
function iniciarEnvelope() {
  const screen = document.getElementById('envelope-screen');
  const envelope = document.getElementById('envelope');
  const invite = document.getElementById('invite');
  const audio = document.getElementById('bg-music');

  function abrir() {
    // 1) selo "quebra" e some, a aba abre e a carta desliza para fora
    envelope.classList.add('is-open');
    // 2) ao mesmo tempo, o envelope inteiro cresce até preencher a tela
    //    (mesmo efeito de zoom do vídeo de referência)
    screen.classList.add('is-zooming');
    // 3) o convite já começa a aparecer por trás, com um leve zoom-in
    invite.classList.add('is-visible');

    // O clique no envelope conta como gesto do usuário, então já
    // aproveitamos para tentar iniciar a música de fundo.
    if (CONFIG.musicUrl) {
      audio.play().catch(() => {
        /* o navegador pode bloquear; o botão flutuante continua disponível */
      });
    }

    // 4) por fim, a tela do envelope se dissolve revelando o convite
    setTimeout(() => {
      screen.classList.add('is-hidden');
    }, 1050);

    setTimeout(() => {
      screen.style.display = 'none';
      invite.setAttribute('aria-hidden', 'false');
      document.body.classList.remove('no-scroll');
    }, 1700);
  }

  screen.addEventListener('click', abrir, { once: true });
  screen.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        abrir();
      }
    },
    { once: true }
  );
}

/* ============================================================
   CONTADOR REGRESSIVO
   ============================================================ */
function iniciarContagem() {
  const alvo = new Date(CONFIG.partyDateISO).getTime();
  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');
  const elCountdown = document.getElementById('countdown');
  const elStarted = document.getElementById('countdown-started');

  function atualizar() {
    const agora = Date.now();
    const diff = alvo - agora;

    if (diff <= 0) {
      elCountdown.hidden = true;
      elStarted.hidden = false;
      clearInterval(intervalo);
      return;
    }

    const segundosTotais = Math.floor(diff / 1000);
    const dias = Math.floor(segundosTotais / 86400);
    const horas = Math.floor((segundosTotais % 86400) / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    const segundos = segundosTotais % 60;

    elDays.textContent = String(dias).padStart(2, '0');
    elHours.textContent = String(horas).padStart(2, '0');
    elMinutes.textContent = String(minutos).padStart(2, '0');
    elSeconds.textContent = String(segundos).padStart(2, '0');
  }

  atualizar();
  const intervalo = setInterval(atualizar, 1000);
}

/* ============================================================
   TOAST DE FEEDBACK
   ============================================================ */
let toastTimeout;
function mostrarToast(mensagem) {
  const toast = document.getElementById('toast');
  toast.textContent = mensagem;
  toast.classList.add('is-visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2600);
}

/* ============================================================
   MÚSICA DE FUNDO
   ============================================================ */
function iniciarMusica() {
  const audio = document.getElementById('bg-music');
  const botao = document.getElementById('btn-music');
  if (!audio || !botao || !CONFIG.musicUrl) return;

  audio.volume = CONFIG.musicVolume ?? 0.45;

  function atualizarEstado(tocando) {
    botao.classList.toggle('is-playing', tocando);
    botao.setAttribute('aria-label', tocando ? 'Pausar música' : 'Tocar música');
  }

  botao.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => mostrarToast('Não foi possível tocar a música.'));
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => atualizarEstado(true));
  audio.addEventListener('pause', () => atualizarEstado(false));
}

/* ============================================================
   MENU DE ATALHOS ("Clique para Interagir")
   ============================================================ */
function iniciarMenuAtalhos() {
  // Mostra o atalho de Pix só quando houver chave configurada.
  const botaoPix = document.getElementById('menu-pix');
  if (botaoPix && CONFIG.pixKey) {
    botaoPix.hidden = false;
    botaoPix.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(CONFIG.pixKey);
        mostrarToast(`Chave Pix copiada! (${CONFIG.pixKeyType || 'Pix'})`);
      } catch (erro) {
        mostrarToast(`Chave Pix: ${CONFIG.pixKey}`);
      }
    });
  }

  document.querySelectorAll('.menu-item[data-target]').forEach((botao) => {
    const alvoId = botao.dataset.target;
    if (!alvoId) return;
    botao.addEventListener('click', () => {
      const alvo = document.getElementById(alvoId);
      if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ============================================================
   ADICIONAR À AGENDA (arquivo .ics)
   ============================================================ */
function iniciarCalendario() {
  const botao = document.getElementById('btn-calendar');
  if (!botao) return;

  botao.addEventListener('click', () => {
    const inicio = new Date(CONFIG.partyDateISO);
    const fim = new Date(inicio.getTime() + 4 * 60 * 60 * 1000); // duração de 4h
    const formatar = (data) => data.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const conteudo = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@convite-aniversario`,
      `DTSTAMP:${formatar(new Date())}`,
      `DTSTART:${formatar(inicio)}`,
      `DTEND:${formatar(fim)}`,
      `SUMMARY:Aniversário de ${CONFIG.guestName}`,
      `LOCATION:${CONFIG.venueAddress}`,
      'DESCRIPTION:Venha comemorar com a gente!',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([conteudo], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'festa-de-aniversario.ics';
    link.click();
    URL.revokeObjectURL(url);
  });
}

/* ============================================================
   RSVP — SALVAR CONVIDADO E ABRIR WHATSAPP
   ============================================================ */
function abrirWhatsapp(nome) {
  const mensagem = CONFIG.whatsappMessageTemplate.replace('{nome}', nome);
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank', 'noopener');
}

function iniciarRsvp() {
  const form = document.getElementById('rsvp-form');
  const feedback = document.getElementById('rsvp-feedback');
  const wrapAcompanhantes = document.getElementById('rsvp-companions-wrap');
  const botaoEnviar = document.getElementById('btn-rsvp-submit');
  const radiosStatus = form.querySelectorAll('input[name="rsvp-status"]');

  // Ajusta o texto do botão e some com o campo de acompanhante
  // quando a pessoa marca que não vai poder ir.
  function atualizarVisualStatus() {
    const status = form.querySelector('input[name="rsvp-status"]:checked').value;
    const vaiComparecer = status === 'confirmado';
    wrapAcompanhantes.style.display = vaiComparecer ? '' : 'none';
    botaoEnviar.textContent = vaiComparecer ? 'Confirmar presença' : 'Enviar resposta';
    botaoEnviar.classList.toggle('is-recusado', !vaiComparecer);
  }
  radiosStatus.forEach((radio) => radio.addEventListener('change', atualizarVisualStatus));
  atualizarVisualStatus();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const campoNome = document.getElementById('rsvp-name');
    const campoAcompanhantes = document.getElementById('rsvp-companions');
    const campoMensagem = document.getElementById('rsvp-message');
    const status = form.querySelector('input[name="rsvp-status"]:checked').value;
    const vaiComparecer = status === 'confirmado';

    const nome = campoNome.value.trim();
    if (!nome) {
      feedback.textContent = 'Digite seu nome para continuar.';
      campoNome.focus();
      return;
    }

    botaoEnviar.disabled = true;
    feedback.textContent = vaiComparecer ? 'Confirmando presença...' : 'Enviando resposta...';

    await salvarConvidado({
      nome,
      status,
      acompanhantes: vaiComparecer ? Number(campoAcompanhantes.value) || 0 : 0,
      mensagem: campoMensagem.value.trim(),
      linkDe: lerConvidadoDaUrl() || null
    });

    if (vaiComparecer) {
      dispararConfete();
      feedback.textContent = `Presença confirmada, ${nome}! Nos vemos na festa 🎉`;
    } else {
      feedback.textContent = `Obrigado por avisar, ${nome}. Sentiremos sua falta! 💛`;
    }
    form.reset();
    atualizarVisualStatus();
    botaoEnviar.disabled = false;

    if (vaiComparecer) {
      setTimeout(() => abrirWhatsapp(nome), 600);
    }
  });
}

/* ============================================================
   CONFETE
   ============================================================ */
function dispararConfete() {
  if (typeof confetti !== 'function') return;

  const duracao = 2200;
  const fim = Date.now() + duracao;
  const cores = ['#ff2ec4', '#a537ff', '#4dd8ff', '#ffcf4d'];

  (function disparo() {
    confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors: cores });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors: cores });
    if (Date.now() < fim) requestAnimationFrame(disparo);
  })();

  confetti({ particleCount: 90, spread: 100, origin: { y: 0.6 }, colors: cores });
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  iniciarBanco();
  preencherConteudo();
  iniciarLinkIndividual();
  iniciarEnvelope();
  iniciarContagem();
  iniciarMusica();
  iniciarMenuAtalhos();
  iniciarCalendario();
  iniciarRsvp();
});
