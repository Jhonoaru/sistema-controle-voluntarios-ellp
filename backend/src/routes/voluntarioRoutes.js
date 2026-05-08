const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.*,
        s.descricao AS sintese,
        c.descricao AS cronograma
      FROM voluntario v
      LEFT JOIN sintese s ON v.sintese_id = s.id
      LEFT JOIN cronograma c ON v.cronograma_id = c.id
      ORDER BY v.id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar voluntários' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM voluntario WHERE id = $1', [id]);

    res.json({ message: 'Voluntário removido' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover voluntário' });
  }
});


router.post('/', async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      cpf,
      sintese_id,
      cronograma_id,
      data_nascimento,
      nacionalidade,
      estudante,
      curso,
      periodo,
      ra,
      endereco,
      cidade,
      estado
    } = req.body;

    const result = await pool.query(
      `INSERT INTO voluntario 
      (nome, email, telefone, cpf, sintese_id, cronograma_id,
       data_nascimento, nacionalidade, estudante, curso, periodo, ra, endereco, cidade, estado)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        nome,
        email,
        telefone,
        cpf,
        sintese_id || null,
        cronograma_id || null,
        data_nascimento || null,
        nacionalidade || null,
        estudante || null,
        curso || null,
        periodo || null,
        ra || null,
        endereco || null,
        cidade || null,
        estado || null
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar voluntário' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nome,
      email,
      telefone,
      cpf,
      sintese_id,
      cronograma_id,
      data_nascimento,
      nacionalidade,
      estudante,
      curso,
      periodo,
      ra,
      endereco,
      cidade,
      estado,
      ativo
    } = req.body;

    const result = await pool.query(
      `UPDATE voluntario SET
        nome=$1,
        email=$2,
        telefone=$3,
        cpf=$4,
        sintese_id=$5,
        cronograma_id=$6,
        data_nascimento=$7,
        nacionalidade=$8,
        estudante=$9,
        curso=$10,
        periodo=$11,
        ra=$12,
        endereco=$13,
        cidade=$14,
        estado=$15,
        ativo=$16
      WHERE id=$17
      RETURNING *`,
      [
        nome,
        email,
        telefone,
        cpf,
        sintese_id || null,
        cronograma_id || null,
        data_nascimento || null,
        nacionalidade || null,
        estudante || null,
        curso || null,
        periodo || null,
        ra || null,
        endereco || null,
        cidade || null,
        estado || null,
        ativo, // 🔥 AQUI
        id
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar voluntário' });
  }
});


module.exports = router;