if (!localStorage.getItem('logado')) {
  window.location.href = 'login.html';
}

const API_URL = 'http://localhost:3001/coordenadores';

const urlParams = new URLSearchParams(window.location.search);
const coordenadorId = urlParams.get('id');

window.onload = async () => {
  if (coordenadorId) {
    document.getElementById('tituloPagina').innerText = 'Editar Coordenador';
    await carregarCoordenador();
  }

  document
    .getElementById('coordenadorForm')
    .addEventListener('submit', salvarCoordenador);
};

async function carregarCoordenador() {
  try {
    const res = await fetch(`${API_URL}/${coordenadorId}`);

    if (!res.ok) {
      throw new Error('Erro ao carregar coordenador');
    }

    const c = await res.json();

    document.getElementById('nome').value = c.nome || '';
    document.getElementById('login').value = c.login || '';
    document.getElementById('senha').value = c.senha || '';
  } catch (error) {
    console.error('Erro ao carregar coordenador:', error);
    mostrarNotificacao('Erro ao carregar coordenador.', 'erro');
  }
}

async function salvarCoordenador(e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const login = document.getElementById('login').value.trim();
  const senha = document.getElementById('senha').value.trim();

  if (!nome || !login || !senha) {
    mostrarNotificacao('Preencha todos os campos.', 'erro');
    return;
  }

  const coordenador = {
    nome,
    login,
    senha
  };

  try {
    const metodo = coordenadorId ? 'PUT' : 'POST';
    const url = coordenadorId ? `${API_URL}/${coordenadorId}` : API_URL;

    const res = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(coordenador)
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarNotificacao(data.error || 'Erro ao salvar coordenador.', 'erro');
      return;
    }

    salvarNotificacaoPendente(
      coordenadorId
        ? 'Coordenador atualizado com sucesso.'
        : 'Coordenador criado com sucesso.',
      'sucesso'
    );

    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Erro ao salvar coordenador:', error);
    mostrarNotificacao('Erro ao conectar com o servidor.', 'erro');
  }
}

function cancelar() {
  window.location.href = 'dashboard.html';
}
