const express = require('express');
const router = express.Router();
const pool = require('../db');
const { registrarAuditoria } = require('../services/auditoria');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cronograma ORDER BY id DESC');
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar cronogramas' });
  }
});

router.post('/', async (req, res) => {
  const dados = prepararDados(req.body);
  const erroValidacao = validarDados(dados);

  if (erroValidacao) {
    return res.status(400).json({ error: erroValidacao });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cronograma (nome, descricao, data_inicio, data_fim, meses)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        dados.nome,
        dados.descricao,
        dados.data_inicio,
        dados.data_fim,
        JSON.stringify(dados.meses)
      ]
    );

    await registrarAuditoria(pool, req.usuario, 'CRIAR', 'cronograma', result.rows[0].id, {
      nome: result.rows[0].nome
    });

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao cadastrar cronograma' });
  }
});

router.put('/:id', async (req, res) => {
  const dados = prepararDados(req.body);
  const erroValidacao = validarDados(dados);

  if (erroValidacao) {
    return res.status(400).json({ error: erroValidacao });
  }

  try {
    const result = await pool.query(
      `UPDATE cronograma
       SET nome = $1,
           descricao = $2,
           data_inicio = $3,
           data_fim = $4,
           meses = $5
       WHERE id = $6
       RETURNING *`,
      [
        dados.nome,
        dados.descricao,
        dados.data_inicio,
        dados.data_fim,
        JSON.stringify(dados.meses),
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cronograma nao encontrado' });
    }

    await registrarAuditoria(pool, req.usuario, 'ATUALIZAR', 'cronograma', req.params.id, {
      nome: result.rows[0].nome
    });

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar cronograma' });
  }
});

router.delete('/:id', async (req, res) => {
  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');
    await client.query(
      'UPDATE voluntario SET cronograma_id = NULL WHERE cronograma_id = $1',
      [req.params.id]
    );
    const result = await client.query(
      'DELETE FROM cronograma WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cronograma nao encontrado' });
    }

    await registrarAuditoria(client, req.usuario, 'EXCLUIR', 'cronograma', req.params.id);
    await client.query('COMMIT');
    return res.json({ message: 'Cronograma removido' });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error(error);
    return res.status(500).json({ error: 'Erro ao remover cronograma' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

function prepararDados(dados) {
  return {
    nome: String(dados.nome || '').trim(),
    descricao: String(dados.descricao || '').trim(),
    data_inicio: dados.data_inicio,
    data_fim: dados.data_fim,
    meses: Array.isArray(dados.meses) ? dados.meses : []
  };
}

function validarDados(dados) {
  if (!dados.nome || !dados.descricao) {
    return 'Preencha o nome e a descricao do cronograma';
  }

  if (!datasValidas(dados.data_inicio, dados.data_fim)) {
    return 'Datas invalidas para o cronograma';
  }

  return null;
}

function datasValidas(dataInicio, dataFim) {
  if (!dataInicio || !dataFim) {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataInicio) || !/^\d{4}-\d{2}-\d{2}$/.test(dataFim)) {
    return false;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const maximo = new Date();
  maximo.setFullYear(maximo.getFullYear() + 5);
  maximo.setHours(23, 59, 59, 999);

  const inicio = new Date(`${dataInicio}T00:00:00`);
  const fim = new Date(`${dataFim}T00:00:00`);

  return inicio >= hoje && fim >= inicio && inicio <= maximo && fim <= maximo;
}

module.exports = router;
