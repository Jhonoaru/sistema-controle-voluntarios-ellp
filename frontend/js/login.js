async function login() {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const res = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('logado', 'true');
      window.location.href = 'dashboard.html';
    } else {
      document.getElementById('erro').innerText = 'Login inválido';
    }

  } catch (error) {
    document.getElementById('erro').innerText = 'Erro ao conectar com o servidor';
  }
}