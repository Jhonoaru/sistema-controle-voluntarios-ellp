const API_URL = 'http://localhost:3001';

function exigirAutenticacao() {
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
  }
}

async function apiFetch(caminho, opcoes = {}) {
  const headers = new Headers(opcoes.headers || {});
  const token = localStorage.getItem('token');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers
  });

  if (resposta.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioNome');
    localStorage.removeItem('logado');
    window.location.href = 'login.html';
  }

  return resposta;
}
