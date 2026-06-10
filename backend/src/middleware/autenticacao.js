const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Autenticacao necessaria' });
  }

  try {
    req.usuario = jwt.verify(token, obterJwtSecret());
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Sessao invalida ou expirada' });
  }
}

function obterJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET nao configurado no arquivo .env');
  }

  return secret;
}

module.exports = { autenticar, obterJwtSecret };
