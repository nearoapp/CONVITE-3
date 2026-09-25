/* ============================================================
   PAINEL ADMINISTRATIVO
   Usa o mesmo config.js do convite (window.CONFIG).
   ============================================================ */
const CONFIG = window.CONFIG;
let db = null;

/* ---------- Portão de senha (proteção básica, não é segurança real) ---------- */
// A senha real não fica no código — comparamos o hash (SHA-256) do que a
// pessoa digitou com o hash salvo em CONFIG.adminPasscodeHash.
async function calcularHash(texto) {
  const bytes = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function iniciarPortaoDeSenha() {
  const telaSenha = document.getElementById('admin-lock');
  const painel = document.getElementById('admin-page');
  const form = document.getElementById('admin-lock-form');
  const input = document.getElementById('admin-lock-input');
  const erro = document.getElementById('admin-lock-error');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const hashDigitado = await calcularHash(input.value);
    if (hashDigitado === CONFIG.adminPasscodeHash) {
      telaSenha.hidden = true;
      painel.hidden = false;
      iniciarPainel();
    } else {
      erro.textContent = 'Senha incorreta.';
      input.value = '';
      input.focus();
    }
  });
}

/* ---------- Conexão com o banco ---------- */
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

/* ---------- localStorage seguro (pode ficar indisponível em file://) ---------- */
function lerConvidadosLocal() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
  } catch (erro) {
    return [];
  }
}

function limparConvidadosLocal() {
  try {
    localStorage.removeItem(CONFIG.storageKey);
  } catch (erro) {
    console.warn('localStorage indisponível.');
  }
}

/* ---------- Formatação ---------- */
function formatarData(valor) {
  if (!valor) return '—';
  const data = valor.toDate ? valor.toDate() : new Date(valor);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/* ---------- Gerador de links individuais ---------- */
function linkBaseDoConvite() {
  if (CONFIG.siteBaseUrl) {
    return `${CONFIG.siteBaseUrl.replace(/\/$/, '')}/index.html`;
  }
  // Sem siteBaseUrl definido: tenta usar o endereço atual do navegador.
  // Só funciona corretamente se esta página foi aberta pelo link publicado.
  return window.location.href.replace(/admin\.html.*$/, 'index.html');
}

function iniciarGeradorLinks() {
  const botao = document.getElementById('btn-gerar-links');
  const campoNomes = document.getElementById('gen-nomes');
  const resultado = document.getElementById('gen-resultado');
  const aviso = document.getElementById('gen-aviso-local');
  if (!botao) return;

  const rodandoLocalmente = !CONFIG.siteBaseUrl && window.location.protocol === 'file:';
  if (aviso) aviso.hidden = !rodandoLocalmente;

  botao.addEventListener('click', () => {
    const nomes = campoNomes.value
      .split('\n')
      .map((linha) => linha.trim())
      .filter(Boolean);

    resultado.innerHTML = '';
    if (nomes.length === 0) return;

    nomes.forEach((nome) => {
      const link = `${linkBaseDoConvite()}?convidado=${encodeURIComponent(nome)}`;
      const linha = document.createElement('div');
      linha.className = 'admin-generator-item';
      linha.innerHTML = `
        <span>${nome}</span>
        <input type="text" value="${link}" readonly>
        <a href="${link}" target="_blank" rel="noopener noreferrer" class="btn-abrir-link">Abrir</a>
        <button type="button">Copiar</button>
      `;
      linha.querySelector('button').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(link);
          linha.querySelector('button').textContent = 'Copiado!';
          setTimeout(() => { linha.querySelector('button').textContent = 'Copiar'; }, 1500);
        } catch (erro) {
          linha.querySelector('input').select();
        }
      });
      resultado.appendChild(linha);
    });
  });
}

/* ---------- Renderização da lista ---------- */
let listaAtual = [];
let filtroAtual = 'todos';

function renderizarLista(lista) {
  listaAtual = lista;
  const tabela = document.getElementById('admin-table');
  const corpo = document.getElementById('admin-tbody');
  const vazio = document.getElementById('admin-empty');
  const totalConfirmados = document.getElementById('admin-total-confirmados');
  const totalRecusados = document.getElementById('admin-total-recusados');

  // Trata registros antigos que não tinham o campo "status" (eram todos confirmações).
  const normalizada = lista.map((item) => ({ ...item, status: item.status || 'confirmado' }));

  const confirmados = normalizada.filter((item) => item.status === 'confirmado');
  const recusados = normalizada.filter((item) => item.status === 'recusado');
  const pessoasConfirmadas = confirmados.reduce((soma, item) => soma + 1 + (Number(item.acompanhantes) || 0), 0);

  totalConfirmados.textContent = pessoasConfirmadas;
  totalRecusados.textContent = recusados.length;

  const filtrada = normalizada.filter((item) => filtroAtual === 'todos' || item.status === filtroAtual);
  corpo.innerHTML = '';

  if (filtrada.length === 0) {
    tabela.hidden = true;
    vazio.hidden = false;
    return;
  }

  tabela.hidden = false;
  vazio.hidden = true;

  filtrada.forEach((convidado, indice) => {
    const linha = document.createElement('tr');
    const statusRotulo = convidado.status === 'recusado'
      ? '<span class="status-pill status-pill--recusado">Não vai</span>'
      : '<span class="status-pill status-pill--confirmado">Confirmado</span>';

    let origemRotulo = '<span class="origem-generica">Link geral</span>';
    if (convidado.linkDe) {
      const bate = convidado.linkDe.trim().toLowerCase() === (convidado.nome || '').trim().toLowerCase();
      origemRotulo = bate
        ? `<span class="origem-ok">${convidado.linkDe}</span>`
        : `<span class="origem-alerta" title="O nome digitado é diferente do link usado — confira se não foi repassado">⚠ ${convidado.linkDe}</span>`;
    }

    linha.innerHTML = `
      <td>${indice + 1}</td>
      <td>${convidado.nome || '—'}</td>
      <td>${statusRotulo}</td>
      <td>${convidado.status === 'recusado' ? '—' : (convidado.acompanhantes ? '+' + convidado.acompanhantes : '—')}</td>
      <td>${convidado.mensagem || '—'}</td>
      <td>${origemRotulo}</td>
      <td>${formatarData(convidado.confirmadoEm)}</td>
    `;
    corpo.appendChild(linha);
  });
}

function iniciarFiltros() {
  document.querySelectorAll('.admin-filter-btn').forEach((botao) => {
    botao.addEventListener('click', () => {
      filtroAtual = botao.dataset.filtro;
      document.querySelectorAll('.admin-filter-btn').forEach((b) => b.classList.remove('is-active'));
      botao.classList.add('is-active');
      renderizarLista(listaAtual);
    });
  });
}

/* ---------- Carregar / observar convidados ---------- */
let cancelarObservacao = null;

function carregarConvidados() {
  if (db) {
    if (cancelarObservacao) cancelarObservacao();
    cancelarObservacao = db.collection('convidados').orderBy('confirmadoEm', 'desc').onSnapshot(
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => doc.data());
        renderizarLista(lista);
      },
      (erro) => {
        console.error('Erro ao ler o banco.', erro);
        document.getElementById('admin-source').textContent =
          'Não foi possível conectar ao banco. Verifique as credenciais em config.js.';
      }
    );
  } else {
    renderizarLista(lerConvidadosLocal());
  }
}

/* ---------- Limpar lista ---------- */
async function limparLista() {
  const confirmar = window.confirm('Tem certeza que deseja apagar toda a lista de convidados?');
  if (!confirmar) return;

  if (db) {
    try {
      const snapshot = await db.collection('convidados').get();
      const lote = db.batch();
      snapshot.docs.forEach((doc) => lote.delete(doc.ref));
      await lote.commit();
    } catch (erro) {
      console.error('Erro ao limpar o banco.', erro);
      alert('Não foi possível limpar a lista no banco.');
      return;
    }
  } else {
    limparConvidadosLocal();
    carregarConvidados();
  }
}

/* ---------- Inicialização do painel (após senha correta) ---------- */
function iniciarPainel() {
  const origem = document.getElementById('admin-source');
  origem.textContent = bancoConfigurado()
    ? 'Mostrando confirmações de todos os dispositivos (banco de dados central).'
    : 'Sem banco configurado — mostrando apenas confirmações feitas neste navegador.';

  carregarConvidados();
  iniciarFiltros();
  iniciarGeradorLinks();

  document.getElementById('btn-refresh').addEventListener('click', carregarConvidados);
  document.getElementById('btn-clear').addEventListener('click', limparLista);
}

document.addEventListener('DOMContentLoaded', () => {
  iniciarBanco();
  iniciarPortaoDeSenha();
});
