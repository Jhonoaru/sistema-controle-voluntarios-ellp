const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM cronograma ORDER BY id DESC');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { nome, descricao, data_inicio, data_fim, meses } = req.body;

  const result = await pool.query(
    `INSERT INTO cronograma (nome, descricao, data_inicio, data_fim, meses)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [nome, descricao, data_inicio, data_fim, JSON.stringify(meses)]
  );

  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, data_inicio, data_fim, meses } = req.body;

  const result = await pool.query(
    `UPDATE cronograma
     SET nome = $1,
         descricao = $2,
         data_inicio = $3,
         data_fim = $4,
         meses = $5
     WHERE id = $6
     RETURNING *`,
    [nome, descricao, data_inicio, data_fim, JSON.stringify(meses), id]
  );

  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  try {

    const { id } = req.params;

    // remove referência dos voluntários
    await pool.query(
      'UPDATE voluntario SET cronograma_id = NULL WHERE cronograma_id = $1',
      [id]
    );

    // agora remove o cronograma
    await pool.query(
      'DELETE FROM cronograma WHERE id = $1',
      [id]
    );

    res.json({ message: 'Cronograma removido' });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Erro ao remover cronograma'
    });
  }
});

module.exports = router;