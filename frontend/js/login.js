async function login() {
  const login = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  if (!login || !senha) {
    mostrarErroLogin('Informe login e senha.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ login, senha })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('logado', 'true');
      localStorage.setItem('usuarioNome', data.user.nome);
      salvarNotificacaoPendente('Login realizado com sucesso.', 'sucesso');

      window.location.href = 'dashboard.html';
    } else {
      mostrarErroLogin('Login invalido.');
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    mostrarErroLogin('Erro ao conectar com o servidor.');
  }
}

function mostrarErroLogin(mensagem) {
  document.getElementById('erro').innerText = mensagem;
  mostrarNotificacao(mensagem, 'erro');
}
