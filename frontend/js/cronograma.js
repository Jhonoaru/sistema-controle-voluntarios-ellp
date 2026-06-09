let cronogramas = [];
let cronogramaEditandoId = null;

async function salvar() {
  const nome = document.getElementById('nome').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const data_inicio = document.getElementById('data_inicio').value;
  const data_fim = document.getElementById('data_fim').value;

  if (!nome || !descricao || !data_inicio || !data_fim) {
    mostrarNotificacao('Preencha todos os campos do cronograma.', 'erro');
    return;
  }

  if (!datasValidas(data_inicio, data_fim)) {
    return;
  }

  const payload = {
    nome,
    descricao,
    data_inicio,
    data_fim,
    meses: []
  };

  try {
    const editando = cronogramaEditandoId !== null;
    const url = editando
      ? `http://localhost:3001/cronogramas/${cronogramaEditandoId}`
      : 'http://localhost:3001/cronogramas';

    const res = await fetch(url, {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Erro ao salvar cronograma');
    }

    mostrarNotificacao(
      editando ? 'Cronograma atualizado com sucesso.' : 'Cronograma criado com sucesso.',
      'sucesso'
    );
    limparFormulario();
    carregarCronogramas();
  } catch (error) {
    console.error('Erro ao salvar cronograma:', error);
    mostrarNotificacao(error.message || 'Nao foi possivel salvar o cronograma.', 'erro');
  }
}

function limparFormulario() {
  document.getElementById('nome').value = '';
  document.getElementById('descricao').value = '';
  document.getElementById('data_inicio').value = '';
  document.getElementById('data_fim').value = '';
  cronogramaEditandoId = null;
  configurarDatas();
}

async function carregarCronogramas() {
  try {
    const res = await fetch('http://localhost:3001/cronogramas');
    if (!res.ok) {
      throw new Error('Erro ao carregar cronogramas');
    }

    cronogramas = await res.json();
    renderizar();
  } catch (error) {
    console.error('Erro ao carregar cronogramas:', error);
    mostrarNotificacao('Erro ao carregar cronogramas.', 'erro');
  }
}

function renderizar() {
  const lista = document.getElementById('lista-cronogramas');
  lista.innerHTML = '';

  cronogramas.forEach(c => {
    const div = document.createElement('div');
    div.className = 'lista-cronograma';

    div.innerHTML = `
      <div class="cronograma-info">
        <strong>${escaparHtml(c.nome || '')}</strong>
        <small>${escaparHtml(c.descricao || '')}</small>
        <div class="cronograma-periodo">
          ${formatarDataBR(c.data_inicio)} -> ${formatarDataBR(c.data_fim)}
        </div>
        <div class="cronograma-duracao">${calcularDuracao(c.data_inicio, c.data_fim)}</div>
      </div>

      <div class="lista-cronograma-acoes">
        <button onclick="editar(${c.id})">Editar</button>
        <button class="btn-delete" onclick="deletar(${c.id})">Excluir</button>
      </div>
    `;

    lista.appendChild(div);
  });
}

function editar(id) {
  const c = cronogramas.find(cronograma => cronograma.id === id);
  if (!c) return;

  document.getElementById('nome').value = c.nome;
  document.getElementById('descricao').value = c.descricao;
  document.getElementById('data_inicio').value = c.data_inicio.split('T')[0];
  document.getElementById('data_fim').value = c.data_fim.split('T')[0];

  cronogramaEditandoId = id;
  configurarDatas();
  mostrarNotificacao('Cronograma carregado para edicao.', 'info');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deletar(id) {
  if (!confirm('Deseja excluir este cronograma?')) return;

  try {
    const res = await fetch(`http://localhost:3001/cronogramas/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error('Erro ao excluir cronograma');
    }

    mostrarNotificacao('Cronograma excluido com sucesso.', 'sucesso');
    carregarCronogramas();
  } catch (error) {
    console.error('Erro ao excluir cronograma:', error);
    mostrarNotificacao('Nao foi possivel excluir o cronograma.', 'erro');
  }
}

function configurarDatas() {
  const inicio = document.getElementById('data_inicio');
  const fim = document.getElementById('data_fim');
  const hoje = obterDataHoje();
  const maximo = obterDataMaxima();

  inicio.min = hoje;
  inicio.max = maximo;
  fim.min = inicio.value || hoje;
  fim.max = maximo;

  atualizarAjudaDatas(hoje, maximo);

  if (inicio.value && !dataDentroDoIntervalo(inicio.value, hoje, maximo)) {
    inicio.value = '';
    mostrarNotificacao('A data de inicio precisa estar entre hoje e os proximos 5 anos.', 'erro');
  }

  if (fim.value && !dataDentroDoIntervalo(fim.value, fim.min, maximo)) {
    fim.value = '';
    mostrarNotificacao('A data de fim precisa estar dentro do periodo permitido.', 'erro');
  }

  if (inicio.value && fim.value && fim.value < inicio.value) {
    fim.value = '';
    mostrarNotificacao('A data de fim foi limpa porque estava antes da data de inicio.', 'info');
  }
}

function normalizarDataDigitada(event) {
  const campo = event.target;
  const valor = campo.value;

  if (!valor) return;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    campo.value = '';
    mostrarNotificacao('Use uma data com ano de 4 digitos.', 'erro');
    configurarDatas();
    return;
  }

  configurarDatas();
}

function datasValidas(dataInicio, dataFim) {
  const hoje = obterDataHoje();
  const maximo = obterDataMaxima();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataInicio) || !/^\d{4}-\d{2}-\d{2}$/.test(dataFim)) {
    mostrarNotificacao('Use datas validas com ano de 4 digitos.', 'erro');
    return false;
  }

  if (!dataDentroDoIntervalo(dataInicio, hoje, maximo)) {
    mostrarNotificacao('A data de inicio precisa estar entre hoje e os proximos 5 anos.', 'erro');
    return false;
  }

  if (!dataDentroDoIntervalo(dataFim, dataInicio, maximo)) {
    mostrarNotificacao('A data de fim precisa ser igual ou posterior ao inicio e estar no limite permitido.', 'erro');
    return false;
  }

  return true;
}

function dataDentroDoIntervalo(data, minimo, maximo) {
  return data >= minimo && data <= maximo;
}

function obterDataHoje() {
  const hoje = new Date();
  hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
  return hoje.toISOString().split('T')[0];
}

function obterDataMaxima() {
  const data = new Date();
  data.setFullYear(data.getFullYear() + 5);
  data.setMinutes(data.getMinutes() - data.getTimezoneOffset());
  return data.toISOString().split('T')[0];
}

function atualizarAjudaDatas(hoje, maximo) {
  const ajudaInicio = document.getElementById('ajuda_data_inicio');
  const ajudaFim = document.getElementById('ajuda_data_fim');
  const inicio = document.getElementById('data_inicio');

  ajudaInicio.textContent = `Permitido de ${formatarDataBR(hoje)} ate ${formatarDataBR(maximo)}.`;
  ajudaFim.textContent = inicio.value
    ? `Precisa ser igual ou posterior a ${formatarDataBR(inicio.value)}.`
    : 'Escolha primeiro a data de inicio.';
}

function calcularDuracao(dataInicio, dataFim) {
  const inicio = new Date(`${dataInicio.split('T')[0]}T00:00:00`);
  const fim = new Date(`${dataFim.split('T')[0]}T00:00:00`);
  const dias = Math.round((fim - inicio) / 86400000) + 1;

  if (!Number.isFinite(dias) || dias <= 0) {
    return 'Periodo invalido';
  }

  return dias === 1 ? 'Duracao: 1 dia' : `Duracao: ${dias} dias`;
}

function formatarDataBR(dataISO) {
  return new Date(`${dataISO.split('T')[0]}T00:00:00`).toLocaleDateString('pt-BR');
}

function escaparHtml(valor) {
  return String(valor)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function voltar() {
  window.location.href = 'dashboard.html';
}

document.getElementById('data_inicio').addEventListener('change', configurarDatas);
document.getElementById('data_inicio').addEventListener('blur', normalizarDataDigitada);
document.getElementById('data_fim').addEventListener('change', configurarDatas);
document.getElementById('data_fim').addEventListener('blur', normalizarDataDigitada);
configurarDatas();
carregarCronogramas();
