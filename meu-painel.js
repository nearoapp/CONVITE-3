/* ============================================================
   PAINEL EXCLUSIVO DO CRIADOR DO CONVITE
   Mostra aberturas do convite e pessoas que demonstraram interesse
   em pedir o próprio convite. Usa coleções do Firestore separadas
   das usadas no admin.html do cliente ("aberturas" e "leads"),
   protegido pela senha CONFIG.creatorPasscode — diferente da senha
   do admin.html, que é a que o cliente usa.
   ============================================================ */
const CONFIG = window.CONFIG;
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
    console.error('Não foi possível conectar ao banco.', erro);
    db = null;
  }
}

// A senha real não fica no código — comparamos o hash (SHA-256) do que a
// pessoa digitou com o hash salvo em CONFIG.creatorPasscodeHash.
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
    if (hashDigitado === CONFIG.creatorPasscodeHash) {
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

function formatarData(valor) {
  if (!valor) return '—';
  const data = valor.toDate ? valor.toDate() : new Date(valor);
  return data.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function renderizarTabela({ lista, tabelaId, corpoId, vazioId, statId, colunaLinkDe = true }) {
  const tabela = document.getElementById(tabelaId);
  const corpo = document.getElementById(corpoId);
  const vazio = document.getElementById(vazioId);
  const stat = document.getElementById(statId);

  stat.textContent = lista.length;
  corpo.innerHTML = '';

  if (lista.length === 0) {
    tabela.hidden = true;
    vazio.hidden = false;
    return;
  }

  tabela.hidden = false;
  vazio.hidden = true;

  lista.forEach((item, indice) => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${indice + 1}</td>
      <td>${item.guestName || '—'}</td>
      <td>${item.linkDe || '<span class="origem-generica">Link geral</span>'}</td>
      <td>${formatarData(item.abertoEm || item.criadoEm)}</td>
    `;
    corpo.appendChild(linha);
  });
}

function carregarDados() {
  if (!db) {
    document.getElementById('admin-source').textContent =
      'Banco não configurado em config.js — sem rastreamento centralizado disponível.';
    return;
  }

  db.collection('aberturas').orderBy('abertoEm', 'desc').limit(200).get()
    .then((snapshot) => {
      renderizarTabela({
        lista: snapshot.docs.map((doc) => doc.data()),
        tabelaId: 'table-aberturas', corpoId: 'tbody-aberturas',
        vazioId: 'empty-aberturas', statId: 'stat-aberturas'
      });
    })
    .catch((erro) => console.error('Erro ao ler aberturas.', erro));

  db.collection('leads').orderBy('criadoEm', 'desc').limit(200).get()
    .then((snapshot) => {
      renderizarTabela({
        lista: snapshot.docs.map((doc) => doc.data()),
        tabelaId: 'table-leads', corpoId: 'tbody-leads',
        vazioId: 'empty-leads', statId: 'stat-leads'
      });
    })
    .catch((erro) => console.error('Erro ao ler leads.', erro));
}

function iniciarPainel() {
  carregarDados();
  document.getElementById('btn-refresh').addEventListener('click', carregarDados);
}

document.addEventListener('DOMContentLoaded', () => {
  iniciarBanco();
  iniciarPortaoDeSenha();
});
