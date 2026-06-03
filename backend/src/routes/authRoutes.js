const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/login', async (req, res) => {
  const { login, senha } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM coordenadores WHERE login = $1 AND senha = $2',
      [login, senha]
    );

    if (result.rows.length > 0) {
      res.json({
        success: true,
        user: result.rows[0]
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Login inválido'
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor'
    });
  }
});

module.exports = router;