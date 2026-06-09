if (!localStorage.getItem('logado')) {
  window.location.href = 'login.html';
}

let voluntarios = [];
let filtroAtual = 'ativo';

const nome = localStorage.getItem('usuarioNome');

if (nome) {
  document.querySelector('.user').innerText = nome;
}

async function carregarVoluntarios() {
  try {
    const res = await fetch('http://localhost:3001/voluntarios');
    if (!res.ok) {
      throw new Error('Erro ao carregar voluntarios');
    }

    voluntarios = await res.json();
    renderizar();
  } catch (error) {
    console.error('Erro ao carregar voluntarios:', error);
    mostrarNotificacao('Erro ao carregar voluntarios.', 'erro');
  }
}

function renderizar() {
  const lista = document.getElementById('lista');
  const buscaRA = document.getElementById('buscaRA').value.toLowerCase();

  lista.innerHTML = '';

  voluntarios
    .filter(v => {
      const matchRA = v.ra
        ? v.ra.toLowerCase().includes(buscaRA)
        : true;

      let matchStatus = true;

      if (filtroAtual === 'ativo') {
        matchStatus = v.ativo === true;
      } else if (filtroAtual === 'inativo') {
        matchStatus = v.ativo === false;
      }

      return matchRA && matchStatus;
    })
    .forEach(v => {
      const div = document.createElement('div');
      div.className = 'vol-card';
      const nomeVoluntario = escaparHtml(v.nome || '');
      const emailVoluntario = escaparHtml(v.email || '');
      const raVoluntario = escaparHtml(v.ra || '-');

      div.innerHTML = `
        <div class="vol-info">
          <div class="status ${v.ativo ? 'ativo' : 'inativo'}">
            ${v.ativo ? 'Ativo' : 'Inativo'}
          </div>
          <strong>${nomeVoluntario}</strong>
          <span>${emailVoluntario}</span>
          <small>RA: ${raVoluntario}</small>
        </div>

        <div class="actions">
          <button class="btn-termo" onclick="baixarTermo(${v.id})">TERMO</button>
          <button onclick="editar(${v.id})">EDITAR</button>
        </div>
      `;

      lista.appendChild(div);
    });
}

function filtrarStatus(tipo, elemento) {
  filtroAtual = tipo;

  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.classList.remove('selected');
  });

  elemento.classList.add('selected');

  renderizar();
}

function irCadastro() {
  window.location.href = 'voluntarios.html';
}

function irCronograma() {
  window.location.href = 'cronograma.html';
}

function irCoordenador() {
  window.location.href = 'coordenador.html';
}

function editar(id) {
  window.location.href = `voluntariosEditar.html?id=${id}`;
}

async function baixarTermo(id) {
  try {
    mostrarNotificacao('Gerando termo em PDF...', 'info', 2500);

    const res = await fetch(`http://localhost:3001/api/termo/${id}`);
    if (!res.ok) {
      throw new Error('Erro ao gerar termo');
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = obterNomeArquivoTermo(res.headers.get('Content-Disposition'), id);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    mostrarNotificacao('Termo baixado com sucesso.', 'sucesso');
  } catch (error) {
    console.error('Erro ao baixar termo:', error);
    mostrarNotificacao('Nao foi possivel baixar o termo.', 'erro');
  }
}

function obterNomeArquivoTermo(contentDisposition, id) {
  const match = contentDisposition && contentDisposition.match(/filename="?([^"]+)"?/);
  return match ? match[1] : `termo_voluntario_${id}.pdf`;
}

function escaparHtml(valor) {
  return String(valor)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

window.onload = () => {
  document
    .getElementById('buscaRA')
    .addEventListener('input', renderizar);

  carregarVoluntarios();
};
