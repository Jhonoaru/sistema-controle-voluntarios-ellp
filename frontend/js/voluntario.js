async function cadastrar() {
  const dados = {
    nome: document.getElementById('nome').value,
    data_nascimento: document.getElementById('data_nascimento').value,
    cpf: document.getElementById('cpf').value,
    nacionalidade: document.getElementById('nacionalidade').value,
    estudante: document.querySelector('input[name="estudante"]:checked')?.value || null,
    curso: document.getElementById('curso').value,
    periodo: document.getElementById('periodo').value,
    ra: document.getElementById('ra').value,
    endereco: document.getElementById('endereco').value,
    cidade: document.getElementById('cidade').value,
    estado: document.getElementById('estado').value,
    email: document.getElementById('email').value,
    telefone: document.getElementById('telefone').value,
    cronograma_id: document.getElementById('cronograma').value || null
  };

  await fetch('http://localhost:3001/voluntarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  window.location.href = 'dashboard.html';
}

async function carregarCronogramas() {
  const res = await fetch('http://localhost:3001/cronogramas');
  const data = await res.json();

  const select = document.getElementById('cronograma');
  select.innerHTML = '<option value="">Selecione</option>';

  data.forEach(c => {
    const option = document.createElement('option');
    option.value = c.id;
    option.text = c.nome;
    select.appendChild(option);
  });
}

function voltar() {
  window.location.href = 'dashboard.html';
}

carregarCronogramas();