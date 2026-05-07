let voluntarios = [];
let filtroAtual = 'ativo';

async function carregarVoluntarios() {
  try {
    const res = await fetch('http://localhost:3001/voluntarios');
    voluntarios = await res.json();

    renderizar();

  } catch (error) {
    console.error('Erro ao carregar voluntários:', error);
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

      div.innerHTML = `
        <div class="vol-info">
          <div class="status ${v.ativo ? 'ativo' : 'inativo'}">
            ${v.ativo ? 'Ativo' : 'Inativo'}
          </div>
          <strong>${v.nome}</strong>
          <span>${v.email}</span>
          <small>RA: ${v.ra || '—'}</small>
        </div>

        <div class="actions">
          <button disabled>TERMO</button>
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

  if (elemento) {
    elemento.classList.add('selected');
  }

  renderizar();
}

function irCadastro() {
  window.location.href = 'voluntarios.html';
}

function irCronograma() {
  window.location.href = 'cronograma.html';
}

function editar(id) {
  window.location.href = `voluntariosEditar.html?id=${id}`;
}

window.onload = () => {
  document
    .getElementById('buscaRA')
    .addEventListener('input', renderizar);

  carregarVoluntarios();
};