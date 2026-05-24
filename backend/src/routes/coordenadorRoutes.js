const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM coordenadores WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: 'Coordenador não encontrado'
      });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Erro ao buscar coordenador'
    });
  }
});

router.post('/', async (req, res) => {

  try {

    const { nome, login, senha } = req.body;

    if (!nome || !login || !senha) {

      return res.status(400).json({
        error: 'Preencha todos os campos'
      });
    }

    const existe = await pool.query(
      'SELECT * FROM coordenadores WHERE login = $1',
      [login]
    );

    if (existe.rows.length > 0) {

      return res.status(400).json({
        error: 'Login já cadastrado'
      });
    }

    const result = await pool.query(
      `
      INSERT INTO coordenadores
      (nome, login, senha)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [nome, login, senha]
    );

    res.status(201).json({
      success: true,
      coordenador: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Erro ao cadastrar coordenador'
    });
  }
});

router.put('/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const { nome, login, senha } = req.body;

    const result = await pool.query(
      `
      UPDATE coordenadores
      SET nome = $1,
          login = $2,
          senha = $3
      WHERE id = $4
      RETURNING *
      `,
      [nome, login, senha, id]
    );

    res.json({
      success: true,
      coordenador: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Erro ao atualizar coordenador'
    });
  }
});

module.exports = router;