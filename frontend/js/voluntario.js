async function cadastrar() {
  const dados = obterDadosVoluntario();

  if (!validarVoluntario(dados)) return;

  try {
    const res = await fetch('http://localhost:3001/voluntarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Erro ao cadastrar voluntario');
    }

    salvarNotificacaoPendente('Voluntario cadastrado com sucesso.', 'sucesso');
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Erro ao cadastrar voluntario:', error);
    mostrarNotificacao(error.message || 'Nao foi possivel cadastrar o voluntario.', 'erro');
  }
}

async function carregarCronogramas() {
  try {
    const res = await fetch('http://localhost:3001/cronogramas');
    if (!res.ok) {
      throw new Error('Erro ao carregar cronogramas');
    }

    const data = await res.json();

    const select = document.getElementById('cronograma');
    select.innerHTML = '<option value="">Selecione</option>';

    data.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      option.text = c.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar cronogramas:', error);
    mostrarNotificacao('Erro ao carregar cronogramas.', 'erro');
  }
}

function voltar() {
  window.location.href = 'dashboard.html';
}

carregarCronogramas();
