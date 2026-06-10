const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../db');
const { obterJwtSecret } = require('../middleware/autenticacao');

router.post('/login', async (req, res) => {
  const login = String(req.body.login || '').trim();
  const senha = String(req.body.senha || '');

  if (!login || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Informe login e senha'
    });
  }

  try {
    const result = await pool.query(
      'SELECT id, nome, login, senha FROM coordenadores WHERE LOWER(login) = LOWER($1)',
      [login]
    );

    const usuario = result.rows[0];
    const senhaValida = usuario && await verificarSenha(senha, usuario);

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Login invalido'
      });
    }

    const dadosUsuario = {
      id: usuario.id,
      nome: usuario.nome,
      login: usuario.login
    };

    const token = jwt.sign(dadosUsuario, obterJwtSecret(), { expiresIn: '8h' });

    return res.json({
      success: true,
      token,
      user: dadosUsuario
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Erro no servidor'
    });
  }
});

async function verificarSenha(senhaInformada, usuario) {
  if (usuario.senha.startsWith('$2')) {
    return bcrypt.compare(senhaInformada, usuario.senha);
  }

  if (senhaInformada !== usuario.senha) {
    return false;
  }

  const senhaHash = await bcrypt.hash(senhaInformada, 12);
  await pool.query('UPDATE coordenadores SET senha = $1 WHERE id = $2', [senhaHash, usuario.id]);
  return true;
}

module.exports = router;
