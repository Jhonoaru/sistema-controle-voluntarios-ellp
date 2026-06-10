const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db');
const { registrarAuditoria } = require('../services/auditoria');

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, login FROM coordenadores WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coordenador nao encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar coordenador' });
  }
});

router.post('/', async (req, res) => {
  const nome = String(req.body.nome || '').trim();
  const login = String(req.body.login || '').trim();
  const senha = String(req.body.senha || '');

  if (!nome || !login || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  if (senha.length < 8) {
    return res.status(400).json({ error: 'A senha precisa ter pelo menos 8 caracteres' });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const senhaHash = await bcrypt.hash(senha, 12);
    const result = await client.query(
      `INSERT INTO coordenadores (nome, login, senha)
       VALUES ($1, $2, $3)
       RETURNING id, nome, login`,
      [nome, login, senhaHash]
    );

    await registrarAuditoria(
      client,
      req.usuario,
      'CRIAR',
      'coordenador',
      result.rows[0].id,
      { nome, login }
    );
    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      coordenador: result.rows[0]
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error(error);
    return responderErro(error, res, 'Erro ao cadastrar coordenador');
  } finally {
    if (client) {
      client.release();
    }
  }
});

router.put('/:id', async (req, res) => {
  const nome = String(req.body.nome || '').trim();
  const login = String(req.body.login || '').trim();
  const senha = String(req.body.senha || '');

  if (!nome || !login) {
    return res.status(400).json({ error: 'Preencha nome e login' });
  }

  if (senha && senha.length < 8) {
    return res.status(400).json({ error: 'A senha precisa ter pelo menos 8 caracteres' });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const senhaHash = senha ? await bcrypt.hash(senha, 12) : null;
    const result = await client.query(
      `UPDATE coordenadores
       SET nome = $1,
           login = $2,
           senha = COALESCE($3, senha)
       WHERE id = $4
       RETURNING id, nome, login`,
      [nome, login, senhaHash, req.params.id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Coordenador nao encontrado' });
    }

    await registrarAuditoria(
      client,
      req.usuario,
      'ATUALIZAR',
      'coordenador',
      req.params.id,
      { nome, login, senhaAlterada: Boolean(senha) }
    );
    await client.query('COMMIT');

    return res.json({
      success: true,
      coordenador: result.rows[0]
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error(error);
    return responderErro(error, res, 'Erro ao atualizar coordenador');
  } finally {
    if (client) {
      client.release();
    }
  }
});

function responderErro(error, res, mensagemPadrao) {
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Este login ja esta cadastrado' });
  }

  return res.status(500).json({ error: mensagemPadrao });
}

module.exports = router;
