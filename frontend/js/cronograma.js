let cronogramas = [];
let cronogramaEditandoId = null;

async function salvar() {
  const nome = document.getElementById('nome').value;
  const descricao = document.getElementById('descricao').value;
  const data_inicio = document.getElementById('data_inicio').value;
  const data_fim = document.getElementById('data_fim').value;

  const meses = Array.from(
    document.querySelectorAll('.meses-grid input:checked')
  ).map(el => el.value);

  if (!nome || !descricao || !data_inicio || !data_fim) {
    alert('Preencha todos os campos');
    return;
  }

  const payload = {
    nome,
    descricao,
    data_inicio,
    data_fim,
    meses
  };

  if (cronogramaEditandoId !== null) {
    await fetch(`http://localhost:3001/cronogramas/${cronogramaEditandoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } else {
    await fetch('http://localhost:3001/cronogramas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  limparFormulario();
  carregarCronogramas();
}

function limparFormulario() {
  document.getElementById('nome').value = '';
  document.getElementById('descricao').value = '';
  document.getElementById('data_inicio').value = '';
  document.getElementById('data_fim').value = '';

  document.querySelectorAll('.meses-grid input')
    .forEach(el => el.checked = false);

  cronogramaEditandoId = null;
}

async function carregarCronogramas() {
  const res = await fetch('http://localhost:3001/cronogramas');
  cronogramas = await res.json();

  renderizar();
}

function renderizar() {
  const lista = document.getElementById('lista-cronogramas');
  lista.innerHTML = '';

  cronogramas.forEach(c => {
    const meses = typeof c.meses === 'string'
      ? JSON.parse(c.meses)
      : c.meses || [];

    const div = document.createElement('div');
    div.className = 'lista-cronograma';

    div.innerHTML = `
      <div class="cronograma-info">
        <strong>${c.nome}</strong>
        <small>${c.descricao}</small>
        <div>${formatarDataBR(c.data_inicio)} → ${formatarDataBR(c.data_fim)}</div>
        <div style="font-size:12px; color:#555;">
          Meses: ${meses.join(', ') || '—'}
        </div>
      </div>

      <div>
        <button onclick="editar(${c.id})">Editar</button>
        <button class="btn-delete" onclick="deletar(${c.id})">Excluir</button>
      </div>
    `;

    lista.appendChild(div);
  });
}

function editar(id) {
  const c = cronogramas.find(c => c.id === id);
  if (!c) return;

  document.getElementById('nome').value = c.nome;
  document.getElementById('descricao').value = c.descricao;
  document.getElementById('data_inicio').value = c.data_inicio.split('T')[0];
  document.getElementById('data_fim').value = c.data_fim.split('T')[0];

  const meses = typeof c.meses === 'string'
    ? JSON.parse(c.meses)
    : c.meses || [];

  document.querySelectorAll('.meses-grid input')
    .forEach(el => {
      el.checked = meses.includes(el.value);
    });

  cronogramaEditandoId = id;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deletar(id) {
  if (!confirm('Deseja excluir este cronograma?')) return;

  await fetch(`http://localhost:3001/cronogramas/${id}`, {
    method: 'DELETE'
  });

  carregarCronogramas();
}

function formatarDataBR(dataISO) {
  return new Date(dataISO).toLocaleDateString('pt-BR');
}

function voltar() {
  window.location.href = 'dashboard.html';
}

carregarCronogramas();