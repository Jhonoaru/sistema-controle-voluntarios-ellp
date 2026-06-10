const express = require('express');
const router = express.Router();
const pool = require('../db');
const { registrarAuditoria } = require('../services/auditoria');

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

    const result = await pool.query(
      'UPDATE voluntario SET ativo = FALSE WHERE id = $1 RETURNING id, nome',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voluntario nao encontrado' });
    }

    await registrarAuditoria(pool, req.usuario, 'DESATIVAR', 'voluntario', id, {
      nome: result.rows[0].nome
    });

    res.json({ message: 'Voluntario desativado' });

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

    const erroValidacao = validarDadosVoluntario(req.body);
    if (erroValidacao) {
      return res.status(400).json({ error: erroValidacao });
    }

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

    await registrarAuditoria(pool, req.usuario, 'CRIAR', 'voluntario', result.rows[0].id, {
      nome: result.rows[0].nome
    });

    res.json(result.rows[0]);

  } catch (error) {
    const erroDuplicidade = mensagemErroDuplicidade(error);

    if (erroDuplicidade) {
      return res.status(409).json({ error: erroDuplicidade });
    }

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

    const erroValidacao = validarDadosVoluntario(req.body, { validarAtivo: true });
    if (erroValidacao) {
      return res.status(400).json({ error: erroValidacao });
    }

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
        ativo,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voluntario nao encontrado' });
    }

    await registrarAuditoria(pool, req.usuario, 'ATUALIZAR', 'voluntario', id, {
      nome: result.rows[0].nome,
      ativo: result.rows[0].ativo
    });

    res.json(result.rows[0]);

  } catch (error) {
    const erroDuplicidade = mensagemErroDuplicidade(error);

    if (erroDuplicidade) {
      return res.status(409).json({ error: erroDuplicidade });
    }

    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar voluntário' });
  }
});

function mensagemErroDuplicidade(error) {
  if (error.code !== '23505') {
    return null;
  }

  const mensagens = {
    voluntario_cpf_key: 'Este CPF ja esta cadastrado',
    voluntario_cpf_unique: 'Este CPF ja esta cadastrado',
    voluntario_ra_unique: 'Este RA ja esta cadastrado',
    voluntario_email_unique: 'Este e-mail ja esta cadastrado'
  };

  return mensagens[error.constraint] || 'Ja existe um voluntario com estes dados';
}

function validarDadosVoluntario(dados, { validarAtivo = false } = {}) {
  const camposObrigatorios = [
    ['nome', 'nome'],
    ['email', 'e-mail'],
    ['telefone', 'telefone'],
    ['cpf', 'CPF'],
    ['cronograma_id', 'cronograma'],
    ['data_nascimento', 'data de nascimento'],
    ['nacionalidade', 'nacionalidade'],
    ['estudante', 'estudante da UTFPR'],
    ['curso', 'curso'],
    ['periodo', 'periodo'],
    ['ra', 'RA'],
    ['endereco', 'endereco'],
    ['cidade', 'cidade'],
    ['estado', 'estado']
  ];

  const campoVazio = camposObrigatorios.find(([campo]) => {
    const valor = dados[campo];
    return valor === undefined || valor === null || String(valor).trim() === '';
  });

  if (campoVazio) {
    return `Preencha o campo ${campoVazio[1]}`;
  }

  if (validarAtivo && typeof dados.ativo !== 'boolean') {
    return 'Informe o status do voluntario';
  }

  if (!dataNascimentoValida(dados.data_nascimento)) {
    return 'Data de nascimento invalida';
  }

  if (!['sim', 'nao'].includes(String(dados.estudante).toLowerCase())) {
    return 'Informe se o voluntario e estudante da UTFPR';
  }

  if (!cpfValido(dados.cpf)) {
    return 'CPF invalido';
  }

  if (!emailValido(dados.email)) {
    return 'E-mail invalido';
  }

  if (!telefoneValido(dados.telefone)) {
    return 'Telefone invalido';
  }

  const periodo = Number(dados.periodo);
  if (!Number.isInteger(periodo) || periodo < 1 || periodo > 12) {
    return 'Periodo invalido';
  }

  if (!/^\d{4,12}$/.test(somenteDigitos(dados.ra))) {
    return 'RA invalido';
  }

  return null;
}

function cpfValido(valor) {
  const cpf = somenteDigitos(valor);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i += 1) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;
  if (digito !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i += 1) {
    soma += Number(cpf[i]) * (11 - i);
  }

  digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;

  return digito === Number(cpf[10]);
}

function telefoneValido(valor) {
  const telefone = somenteDigitos(valor);
  return /^\d{10,11}$/.test(telefone) && !/^(\d)\1+$/.test(telefone);
}

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor || ''));
}

function dataNascimentoValida(valor) {
  if (!valor) return false;

  const data = new Date(`${valor}T00:00:00`);
  const minimo = new Date('1900-01-01T00:00:00');
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  return data >= minimo && data <= hoje;
}

function somenteDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

module.exports = router;
