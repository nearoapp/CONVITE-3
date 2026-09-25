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
   RASTREAMENTO EXCLUSIVO DO CRIADOR (aberturas e interesse)
   Fica em coleções separadas do Firestore ("aberturas" e "leads"),
   nunca aparece no admin.html do cliente — só no meu-painel.html,
   protegido pela senha creatorPasscode. É silencioso: não mostra
   nada na tela do convidado e nunca bloqueia a experiência dele.
   ============================================================ */
async function registrarAbertura() {
  if (!db) return;
  try {
    await db.collection('aberturas').add({
      guestName: CONFIG.guestName,
      linkDe: lerConvidadoDaUrl() || null,
      abertoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (erro) {
    // Silencioso: rastreamento nunca deve atrapalhar a experiência do convidado.
  }
}

async function registrarLead(nomeConvidado) {
  if (!db) return;
  try {
    await db.collection('leads').add({
      guestName: CONFIG.guestName,
      linkDe: nomeConvidado || lerConvidadoDaUrl() || null,
      origem: 'rodape',
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (erro) {
    // Silencioso, mesmo motivo acima.
  }
}

/* ============================================================
   PIX — MONTAGEM DO PAYLOAD "COPIA E COLA" (BR Code / EMV) E QR CODE
   Gera o mesmo tipo de código que qualquer app de banco lê para abrir a
   tela de pagamento (não é só uma imagem com o texto da chave dentro).
   ============================================================ */
function removerAcentos(texto) {
  return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function camposTLV(id, valor) {
  const tamanho = String(valor.length).padStart(2, '0');
  return `${id}${tamanho}${valor}`;
}

function crc16Pix(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function montarPayloadPix({ chave, nome, cidade }) {
  const nomeLimpo = removerAcentos(nome).toUpperCase().slice(0, 25) || 'RECEBEDOR';
  const cidadeLimpa = removerAcentos(cidade).toUpperCase().slice(0, 15) || 'SAO PAULO';
  const contaPix = camposTLV('00', 'br.gov.bcb.pix') + camposTLV('01', chave);
  let payload =
    camposTLV('00', '01') +
    camposTLV('26', contaPix) +
    camposTLV('52', '0000') +
    camposTLV('53', '986') +
    camposTLV('58', 'BR') +
    camposTLV('59', nomeLimpo) +
    camposTLV('60', cidadeLimpa) +
    camposTLV('62', camposTLV('05', '***')) +
    '6304';
  return payload + crc16Pix(payload);
}

function desenharQrCodePix() {
  const cartao = document.getElementById('pix-qr-card');
  const canvas = document.getElementById('pix-qr-canvas');
  if (!cartao || !canvas || !CONFIG.pixKey || typeof qrcode !== 'function') return;

  const payload = montarPayloadPix({
    chave: CONFIG.pixKey,
    nome: CONFIG.pixHolder,
    cidade: CONFIG.pixCity
  });

  const qr = qrcode(0, 'M');
  qr.addData(payload);
  qr.make();

  const modulos = qr.getModuleCount();
  const tamanho = canvas.width; // canvas é quadrado (ver HTML)
  const escala = tamanho / modulos;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, tamanho, tamanho);
  ctx.fillStyle = '#fffbfb';
  ctx.fillRect(0, 0, tamanho, tamanho);
  ctx.fillStyle = '#6b1332';
  for (let linha = 0; linha < modulos; linha++) {
    for (let coluna = 0; coluna < modulos; coluna++) {
      if (qr.isDark(linha, coluna)) {
        ctx.fillRect(coluna * escala, linha * escala, Math.ceil(escala), Math.ceil(escala));
      }
    }
  }
  cartao.hidden = false;

  const botaoCopiar = document.getElementById('pix-copy-btn');
  if (botaoCopiar) {
    botaoCopiar.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(CONFIG.pixKey);
        mostrarToast('muito obrigada pelo carinho e generosidade', 'pix');
      } catch (erro) {
        mostrarToast(`Chave Pix: ${CONFIG.pixKey}`, 'pix');
      }
    });
  }
}

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

  // Primeiro nome apenas, para a saudação ficar mais elegante
  const primeiroNome = nomeConvidado.split(/\s+/)[0];
  const saudacao = document.getElementById('personal-greeting');
  const saudacaoNome = document.getElementById('personal-greeting-name');
  if (saudacao && saudacaoNome) {
    saudacaoNome.textContent = primeiroNome;
    saudacao.hidden = false;
  }
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

  const secaoPresentes = CONFIG.giftsSection;
  if (secaoPresentes) {
    const titulo = document.getElementById('gifts-title');
    if (titulo) titulo.innerHTML = `${secaoPresentes.title} <span class="gifts-heart" aria-hidden="true">♡</span>`;

    const intro = document.getElementById('gifts-intro');
    if (intro) {
      intro.innerHTML = '';
      (secaoPresentes.intro || []).forEach((paragrafo) => {
        const p = document.createElement('p');
        p.className = 'gifts-intro-paragraph';
        p.innerHTML = paragrafo.replace(/\n/g, '<br>');
        intro.appendChild(p);
      });
    }

    const lista = document.getElementById('gifts-list');
    if (lista) {
      lista.innerHTML = '';
      (secaoPresentes.suggestions || []).forEach((item) => {
        const li = document.createElement('li');
        li.className = 'gifts-list-item';
        li.innerHTML = `<span class="gifts-list-heart" aria-hidden="true">♥</span><span>${item}</span>`;
        lista.appendChild(li);
      });
    }

    const nota = secaoPresentes.note;
    const notaCartao = document.getElementById('gifts-note-card');
    if (nota && notaCartao) {
      document.getElementById('gifts-note-title').textContent = nota.title || '';
      const notaTexto = document.getElementById('gifts-note-text');
      notaTexto.innerHTML = '';
      (nota.paragraphs || []).forEach((paragrafo) => {
        const p = document.createElement('p');
        p.className = 'gifts-note-paragraph';
        p.textContent = paragrafo;
        notaTexto.appendChild(p);
      });
    } else if (notaCartao) {
      notaCartao.hidden = true;
    }
  }

  desenharQrCodePix();

  if (CONFIG.musicUrl) {
    const audio = document.getElementById('bg-music');
    const botaoMusica = document.getElementById('btn-music');
    audio.src = CONFIG.musicUrl;
    botaoMusica.hidden = false;
  }

  const linkCriador = document.getElementById('footer-creator-link');
  if (linkCriador && CONFIG.creator && CONFIG.creator.whatsappNumber) {
    linkCriador.textContent = CONFIG.creator.name || 'convites digitais';
    linkCriador.addEventListener('click', (event) => {
      event.preventDefault();
      const nomeConvidado = lerConvidadoDaUrl();
      registrarLead(nomeConvidado);
      const mensagem = (CONFIG.creator.messageTemplate || 'Oi! Vi o convite da {guestName} e quero um assim.')
        .replace('{guestName}', CONFIG.guestName);
      window.open(`https://wa.me/${CONFIG.creator.whatsappNumber}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
    });
  } else if (linkCriador) {
    linkCriador.closest('.invite-footer-credit').hidden = true;
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
    // 1) o selo treme e "quebra" saindo voando, a aba abre com um leve
    //    efeito de mola e a carta desliza para fora com uma leve rotação
    envelope.classList.add('is-open');
    // 2) ao mesmo tempo, o envelope inteiro cresce até preencher a tela
    //    (o zoom só começa de fato depois que a carta termina de sair,
    //    veja o delay definido no CSS de .envelope-stage)
    screen.classList.add('is-zooming');
    // 3) o convite aparece por trás, revelado junto com o zoom final
    invite.classList.add('is-visible');

    // O clique no envelope conta como gesto do usuário, então já
    // aproveitamos para tentar iniciar a música de fundo.
    if (CONFIG.musicUrl) {
      audio.play().catch(() => {
        /* o navegador pode bloquear; o botão flutuante continua disponível */
      });
    }

    // Registra a abertura real do convite (visível só no seu painel).
    registrarAbertura();

    // 4) um brilho suave marca a passagem entre envelope e convite
    const flash = document.getElementById('envelope-flash');
    if (flash) {
      setTimeout(() => {
        flash.classList.add('is-active');
        setTimeout(() => flash.classList.remove('is-active'), 450);
      }, 4000);
    }

    // 5) por fim, a tela do envelope se dissolve revelando o convite
    setTimeout(() => {
      screen.classList.add('is-hidden');
    }, 5200);

    setTimeout(() => {
      screen.style.display = 'none';
      invite.setAttribute('aria-hidden', 'false');
      document.body.classList.remove('no-scroll');
    }, 5850);
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
function mostrarToast(mensagem, variante) {
  const toast = document.getElementById('toast');
  toast.classList.remove('toast--pix');
  if (variante === 'pix') {
    toast.innerHTML = `<span class="toast-pix-label">Pix confirmado</span><span class="toast-pix-msg">${mensagem}</span>`;
    toast.classList.add('toast--pix');
  } else {
    toast.textContent = mensagem;
  }
  toast.classList.add('is-visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3400);
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
        mostrarToast('muito obrigada pelo carinho e generosidade', 'pix');
      } catch (erro) {
        mostrarToast(`Chave Pix: ${CONFIG.pixKey}`, 'pix');
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

    // Descrição do evento: mensagem principal + uma linha discreta de
    // crédito, só visível para quem abrir os detalhes do compromisso
    // na própria agenda (fica lá, sem aparecer no convite).
    let descricao = 'Venha comemorar com a gente!';
    if (CONFIG.creator && CONFIG.creator.whatsappNumber) {
      descricao += `\\n\\nConvite digital criado por ${CONFIG.creator.name || ''}. `
        + `Quer o seu? https://wa.me/${CONFIG.creator.whatsappNumber}`;
    }

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
      `DESCRIPTION:${descricao}`,
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
