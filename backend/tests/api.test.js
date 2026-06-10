const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TEST_SCHEMA = 'ellp_test_automatizado';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo_exclusivo_dos_testes_automatizados';
process.env.DB_OPTIONS = `-c search_path=${TEST_SCHEMA}`;

const app = require('../src/app');
const pool = require('../src/db');

const adminPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

let token;
let cronogramaId;
let voluntarioId;

test.before(async () => {
  await adminPool.query(`DROP SCHEMA IF EXISTS ${TEST_SCHEMA} CASCADE`);
  await adminPool.query(`CREATE SCHEMA ${TEST_SCHEMA}`);

  const sql = fs.readFileSync(path.join(__dirname, '..', '..', 'script.sql'), 'utf8');
  await pool.query(sql);
});

test.after(async () => {
  await pool.end();
  await adminPool.query(`DROP SCHEMA IF EXISTS ${TEST_SCHEMA} CASCADE`);
  await adminPool.end();
});

test('fluxo automatizado principal da API', async t => {
  await t.test('rota privada bloqueia acesso sem token', async () => {
    const resposta = await request(app).get('/voluntarios');

    assert.equal(resposta.status, 401);
    assert.equal(resposta.body.error, 'Autenticacao necessaria');
  });

  await t.test('login incorreto e rejeitado', async () => {
    const resposta = await request(app)
      .post('/auth/login')
      .send({ login: 'admin', senha: 'senha-incorreta' });

    assert.equal(resposta.status, 401);
    assert.equal(resposta.body.success, false);
  });

  await t.test('login correto retorna token JWT', async () => {
    const resposta = await request(app)
      .post('/auth/login')
      .send({ login: 'admin', senha: 'admin123' });

    assert.equal(resposta.status, 200);
    assert.equal(resposta.body.success, true);
    assert.ok(resposta.body.token);
    assert.equal(resposta.body.user.login, 'admin');

    token = resposta.body.token;
  });

  await t.test('token invalido nao permite acesso', async () => {
    const resposta = await request(app)
      .get('/voluntarios')
      .set('Authorization', 'Bearer token-invalido');

    assert.equal(resposta.status, 401);
    assert.equal(resposta.body.error, 'Sessao invalida ou expirada');
  });

  await t.test('senha armazenada no banco esta protegida com bcrypt', async () => {
    const result = await pool.query(
      "SELECT senha FROM coordenadores WHERE LOWER(login) = 'admin'"
    );

    assert.match(result.rows[0].senha, /^\$2[aby]\$/);
    assert.notEqual(result.rows[0].senha, 'admin123');
  });

  await t.test('cadastro de coordenador protege a senha e nao a retorna', async () => {
    const resposta = await request(app)
      .post('/coordenadores')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Coordenador dos Testes',
        login: 'coordenador.teste',
        senha: 'senhaSegura123'
      });

    assert.equal(resposta.status, 201);
    assert.equal(Object.hasOwn(resposta.body.coordenador, 'senha'), false);

    const result = await pool.query(
      'SELECT senha FROM coordenadores WHERE id = $1',
      [resposta.body.coordenador.id]
    );

    assert.match(result.rows[0].senha, /^\$2[aby]\$/);
    assert.notEqual(result.rows[0].senha, 'senhaSegura123');
  });

  await t.test('novo coordenador consegue realizar login', async () => {
    const resposta = await request(app)
      .post('/auth/login')
      .send({ login: 'coordenador.teste', senha: 'senhaSegura123' });

    assert.equal(resposta.status, 200);
    assert.ok(resposta.body.token);
  });

  await t.test('cria cronograma com datas validas', async () => {
    const resposta = await request(app)
      .post('/cronogramas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Cronograma dos testes',
        descricao: 'Cronograma criado automaticamente',
        data_inicio: dataFutura(1),
        data_fim: dataFutura(30)
      });

    assert.equal(resposta.status, 201);
    assert.ok(resposta.body.id);
    cronogramaId = resposta.body.id;
  });

  await t.test('rejeita cronograma com data final anterior ao inicio', async () => {
    const resposta = await request(app)
      .post('/cronogramas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Cronograma invalido',
        descricao: 'Datas incorretas',
        data_inicio: dataFutura(10),
        data_fim: dataFutura(5)
      });

    assert.equal(resposta.status, 400);
  });

  await t.test('rejeita voluntario com CPF invalido', async () => {
    const resposta = await request(app)
      .post('/voluntarios')
      .set('Authorization', `Bearer ${token}`)
      .send(dadosVoluntario({ cpf: '111.111.111-11' }));

    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.error, 'CPF invalido');
  });

  await t.test('cadastra voluntario valido', async () => {
    const resposta = await request(app)
      .post('/voluntarios')
      .set('Authorization', `Bearer ${token}`)
      .send(dadosVoluntario());

    assert.equal(resposta.status, 200);
    assert.ok(resposta.body.id);
    assert.equal(resposta.body.ativo, true);
    voluntarioId = resposta.body.id;
  });

  await t.test('impede cadastro com CPF duplicado', async () => {
    const resposta = await request(app)
      .post('/voluntarios')
      .set('Authorization', `Bearer ${token}`)
      .send(dadosVoluntario({
        nome: 'Outro voluntario',
        email: 'outro@teste.com',
        ra: '7654321'
      }));

    assert.equal(resposta.status, 409);
    assert.equal(resposta.body.error, 'Este CPF ja esta cadastrado');
  });

  await t.test('gera termo do voluntario em PDF', async () => {
    const resposta = await request(app)
      .get(`/api/termo/${voluntarioId}`)
      .set('Authorization', `Bearer ${token}`)
      .buffer(true);

    assert.equal(resposta.status, 200);
    assert.match(resposta.headers['content-type'], /application\/pdf/);
    assert.match(resposta.headers['content-disposition'], /attachment/);
    assert.ok(resposta.body.length > 1000);
  });

  await t.test('desativacao preserva o voluntario no banco', async () => {
    const resposta = await request(app)
      .delete(`/voluntarios/${voluntarioId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(resposta.status, 200);

    const result = await pool.query(
      'SELECT ativo FROM voluntario WHERE id = $1',
      [voluntarioId]
    );

    assert.equal(result.rows[0].ativo, false);
  });

  await t.test('auditoria registra as alteracoes realizadas', async () => {
    const resposta = await request(app)
      .get('/auditoria')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(resposta.status, 200);
    assert.ok(resposta.body.some(item => item.acao === 'CRIAR' && item.entidade === 'cronograma'));
    assert.ok(resposta.body.some(item => item.acao === 'CRIAR' && item.entidade === 'voluntario'));
    assert.ok(resposta.body.some(item => item.acao === 'DESATIVAR' && item.entidade === 'voluntario'));
  });
});

function dadosVoluntario(alteracoes = {}) {
  return {
    nome: 'Voluntario dos Testes',
    email: 'voluntario.teste@ellp.com',
    telefone: '(43) 99999-9999',
    cpf: '529.982.247-25',
    cronograma_id: cronogramaId,
    data_nascimento: '2000-01-01',
    nacionalidade: 'Brasileiro',
    estudante: 'sim',
    curso: 'Engenharia de Software',
    periodo: 4,
    ra: '1234567',
    endereco: 'Rua dos Testes, 100',
    cidade: 'Cornelio Procopio',
    estado: 'Parana',
    ...alteracoes
  };
}

function dataFutura(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  data.setMinutes(data.getMinutes() - data.getTimezoneOffset());
  return data.toISOString().split('T')[0];
}
