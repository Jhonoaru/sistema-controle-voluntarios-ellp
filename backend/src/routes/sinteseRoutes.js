const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const { descricao } = req.body;

  const result = await pool.query(
    'INSERT INTO sintese (descricao) VALUES ($1) RETURNING *',
    [descricao]
  );

  res.json(result.rows[0]);
});

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM sintese');
  res.json(result.rows);
});

module.exports = router;