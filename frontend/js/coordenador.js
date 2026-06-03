if (!localStorage.getItem('logado')) {
  window.location.href = 'login.html';
}

const API_URL = 'http://localhost:3001/coordenadores';

const urlParams = new URLSearchParams(window.location.search);
const coordenadorId = urlParams.get('id');

window.onload = async () => {

  if (coordenadorId) {

    document.getElementById('tituloPagina').innerText =
      'Editar Coordenador';

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
      throw new Error();
    }

    const c = await res.json();

    document.getElementById('nome').value = c.nome || '';
    document.getElementById('login').value = c.login || '';
    document.getElementById('senha').value = c.senha || '';

  } catch (error) {

    console.error(error);

    alert('Erro ao carregar coordenador.');
  }
}

async function salvarCoordenador(e) {

  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const login = document.getElementById('login').value.trim();
  const senha = document.getElementById('senha').value.trim();

  if (!nome || !login || !senha) {

    alert('Preencha todos os campos.');

    return;
  }

  const coordenador = {
    nome,
    login,
    senha
  };

  try {

    const metodo = coordenadorId
      ? 'PUT'
      : 'POST';

    const url = coordenadorId
      ? `${API_URL}/${coordenadorId}`
      : API_URL;

    const res = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(coordenador)
    });

    const data = await res.json();

    if (!res.ok) {

      alert(data.error || 'Erro ao salvar.');

      return;
    }

    alert(
      coordenadorId
        ? 'Coordenador atualizado com sucesso!'
        : 'Coordenador criado com sucesso!'
    );

    window.location.href = 'dashboard.html';

  } catch (error) {

    console.error(error);

    alert('Erro ao conectar com o servidor.');
  }
}

function cancelar() {
  window.location.href = 'dashboard.html';
}