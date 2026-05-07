let voluntarioId = null;

function getId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function carregarVoluntario() {
  voluntarioId = getId();

  const res = await fetch(`http://localhost:3001/voluntarios`);
  const data = await res.json();

  const v = data.find(v => v.id == voluntarioId);
  if (!v) return;

  document.getElementById('nome').value = v.nome || '';
  document.getElementById('cpf').value = v.cpf || '';
  document.getElementById('email').value = v.email || '';
  document.getElementById('telefone').value = v.telefone || '';
  document.getElementById('curso').value = v.curso || '';
  document.getElementById('periodo').value = v.periodo || '';
  document.getElementById('ra').value = v.ra || '';
  document.getElementById('endereco').value = v.endereco || '';
  document.getElementById('cidade').value = v.cidade || '';
  document.getElementById('estado').value = v.estado || '';
  document.getElementById('nacionalidade').value = v.nacionalidade || '';

  if (v.data_nascimento) {
    document.getElementById('data_nascimento').value = v.data_nascimento.split('T')[0];
  }

  if (v.ativo !== undefined) {
    document.querySelector(`input[name="ativo"][value="${v.ativo}"]`).checked = true;
  }

  await carregarCronogramas(v.cronograma_id);
}

async function salvar() {
  const ativo = document.querySelector('input[name="ativo"]:checked')?.value;

  const dados = {
    nome: document.getElementById('nome').value,
    cpf: document.getElementById('cpf').value,
    email: document.getElementById('email').value,
    telefone: document.getElementById('telefone').value,
    curso: document.getElementById('curso').value,
    periodo: document.getElementById('periodo').value,
    ra: document.getElementById('ra').value,
    endereco: document.getElementById('endereco').value,
    cidade: document.getElementById('cidade').value,
    estado: document.getElementById('estado').value,
    nacionalidade: document.getElementById('nacionalidade').value,
    data_nascimento: document.getElementById('data_nascimento').value,
    ativo: ativo === 'true',
    cronograma_id: document.getElementById('cronograma').value || null
  };

  await fetch(`http://localhost:3001/voluntarios/${voluntarioId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  window.location.href = 'dashboard.html';
}

async function carregarCronogramas(selectedId = null) {
  const res = await fetch('http://localhost:3001/cronogramas');
  const data = await res.json();

  const select = document.getElementById('cronograma');
  select.innerHTML = '<option value="">Selecione</option>';

  data.forEach(c => {
    const option = document.createElement('option');
    option.value = c.id;
    option.text = c.nome;

    if (selectedId && c.id == selectedId) {
      option.selected = true;
    }

    select.appendChild(option);
  });
}

function voltar() {
  window.location.href = 'dashboard.html';
}

async function excluir() {
  if (!confirm('Tem certeza que deseja excluir este voluntário?')) return;

  await fetch(`http://localhost:3001/voluntarios/${voluntarioId}`, {
    method: 'DELETE'
  });

  alert('Voluntário excluído com sucesso');

  window.location.href = 'dashboard.html';
}

carregarVoluntario();