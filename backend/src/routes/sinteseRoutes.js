const express = require('express');
const router = express.Router();
const pool = require('../db');
const { registrarAuditoria } = require('../services/auditoria');

router.post('/', async (req, res) => {
  const descricao = String(req.body.descricao || '').trim();

  if (!descricao) {
    return res.status(400).json({ error: 'Informe a descricao da sintese' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO sintese (descricao) VALUES ($1) RETURNING *',
      [descricao]
    );

    await registrarAuditoria(pool, req.usuario, 'CRIAR', 'sintese', result.rows[0].id, {
      descricao
    });

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao cadastrar sintese' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sintese ORDER BY id DESC');
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar sinteses' });
  }
});

module.exports = router;
