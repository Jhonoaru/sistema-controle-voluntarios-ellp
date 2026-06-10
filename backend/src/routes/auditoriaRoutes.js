const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         coordenador_id,
         coordenador_nome,
         acao,
         entidade,
         entidade_id,
         detalhes,
         criado_em
       FROM auditoria
       ORDER BY criado_em DESC
       LIMIT 500`
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar auditoria' });
  }
});

module.exports = router;
