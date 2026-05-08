const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const result = await pool.query(
    'SELECT * FROM administrador WHERE email = $1 AND senha = $2',
    [email, senha]
  );

  if (result.rows.length > 0) {
    res.json({ success: true, user: result.rows[0] });
  } else {
    res.status(401).json({ success: false, message: 'Login inválido' });
  }
});

module.exports = router;