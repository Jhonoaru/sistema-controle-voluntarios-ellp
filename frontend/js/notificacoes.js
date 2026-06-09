const NOTIFICACAO_PENDENTE_KEY = 'ellp_notificacao_pendente';

function criarAreaNotificacoes() {
  let area = document.getElementById('notificacoes');

  if (!area) {
    area = document.createElement('div');
    area.id = 'notificacoes';
    area.className = 'notificacoes';
    area.setAttribute('aria-live', 'polite');
    area.setAttribute('aria-atomic', 'true');
    document.body.appendChild(area);
  }

  return area;
}

function mostrarNotificacao(mensagem, tipo = 'sucesso', duracao = 4000) {
  const area = criarAreaNotificacoes();
  const notificacao = document.createElement('div');
  const tipoSeguro = ['sucesso', 'erro', 'info'].includes(tipo) ? tipo : 'info';

  notificacao.className = `notificacao ${tipoSeguro}`;
  notificacao.setAttribute('role', tipoSeguro === 'erro' ? 'alert' : 'status');

  const texto = document.createElement('div');
  texto.className = 'notificacao-mensagem';
  texto.textContent = mensagem;

  const botaoFechar = document.createElement('button');
  botaoFechar.className = 'notificacao-fechar';
  botaoFechar.type = 'button';
  botaoFechar.setAttribute('aria-label', 'Fechar notificacao');
  botaoFechar.textContent = 'x';

  const fechar = () => notificacao.remove();
  botaoFechar.addEventListener('click', fechar);
  notificacao.appendChild(texto);
  notificacao.appendChild(botaoFechar);
  area.appendChild(notificacao);

  if (duracao > 0) {
    setTimeout(fechar, duracao);
  }
}

function salvarNotificacaoPendente(mensagem, tipo = 'sucesso') {
  localStorage.setItem(
    NOTIFICACAO_PENDENTE_KEY,
    JSON.stringify({ mensagem, tipo })
  );
}

function mostrarNotificacaoPendente() {
  const dados = localStorage.getItem(NOTIFICACAO_PENDENTE_KEY);
  if (!dados) return;

  localStorage.removeItem(NOTIFICACAO_PENDENTE_KEY);

  try {
    const notificacao = JSON.parse(dados);
    mostrarNotificacao(notificacao.mensagem, notificacao.tipo);
  } catch (error) {
    mostrarNotificacao(dados, 'info');
  }
}

document.addEventListener('DOMContentLoaded', mostrarNotificacaoPendente);
