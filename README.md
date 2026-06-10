# Sistema de Controle de Voluntários ELLP

Sistema web para gerenciamento de voluntários da ELLP, com cadastro, edição, controle de status, cronogramas e geração do termo de adesão em PDF.

## Funcionalidades

- Login protegido por token JWT.
- Senhas protegidas com hash bcrypt.
- Cadastro e edição de coordenadores.
- Cadastro, edição e desativação de voluntários.
- Validação de CPF, telefone, e-mail, datas e campos obrigatórios.
- Controle de voluntários ativos e inativos.
- Cadastro, edição e exclusão de cronogramas.
- Busca de voluntários por RA.
- Geração e download do termo de adesão em PDF.
- Notificações de sucesso, erro e validação.
- Histórico de auditoria das alterações realizadas.

## Tecnologias

- Frontend: HTML, CSS e JavaScript.
- Backend: Node.js e Express.
- Banco de dados: PostgreSQL.
- Bibliotecas: `pg`, `dotenv`, `cors`, `pdfkit`, `bcrypt`, `jsonwebtoken` e `nodemon`.

## Estrutura

```text
.
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── app.js
│   │   └── db.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── css/
│   ├── images/
│   ├── js/
│   └── pages/
└── script.sql
```

## Instalação

### 1. Pré-requisitos

- Node.js 18 ou superior.
- PostgreSQL.
- pgAdmin ou outro cliente PostgreSQL.
- Git.

### 2. Clone o projeto

```bash
git clone https://github.com/Jhonoaru/sistema-controle-voluntarios-ellp.git
cd sistema-controle-voluntarios-ellp
```

### 3. Crie e configure o banco

No pgAdmin, conectado ao banco padrão `postgres`, crie um banco vazio:

```sql
CREATE DATABASE ellp_db;
```

Abra o Query Tool do banco `ellp_db`, cole todo o conteúdo de `script.sql` e execute.

O script cria as tabelas, relacionamentos, validações, índices e o usuário inicial:

```text
Login: admin
Senha: admin123
```

Troque essa senha após o primeiro acesso.

### 4. Configure o backend

Dentro de `backend/`, crie um arquivo chamado `.env` usando `.env.example` como modelo:

```env
PORT=3001
JWT_SECRET=troque_por_uma_chave_longa_e_aleatoria

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgresql
DB_DATABASE=ellp_db
```

Instale as dependências:

```bash
cd backend
npm install
```

Inicie o servidor:

```bash
npm run dev
```

A API estará disponível em `http://localhost:3001`.

O valor de `JWT_SECRET` deve ser longo, aleatório e não deve ser enviado ao GitHub.

### 5. Abra o frontend

Abra `frontend/pages/login.html` no navegador. Para uma experiência melhor, use a extensão Live Server do VS Code.

Entre usando o usuário inicial criado pelo `script.sql`.

O endereço utilizado pelo frontend para acessar a API fica centralizado em `frontend/js/config.js`.

## Scripts do backend

```bash
npm run dev
npm start
npm test
```

- `npm run dev`: inicia com reinicialização automática.
- `npm start`: inicia normalmente.
- `npm test`: executa os testes automatizados em um ambiente isolado.

## Testes automatizados

Os testes estão em `backend/tests/api.test.js` e verificam autenticação JWT,
bcrypt, coordenadores, cronogramas, voluntários, duplicidades, geração do PDF,
desativação lógica e auditoria.

Para executar:

```bash
cd backend
npm test
```

Os testes criam o schema temporário `ellp_test_automatizado` no PostgreSQL e o
apagam ao terminar. Os dados reais do sistema não são alterados.

O arquivo `TESTES_AUTOMATIZADOS.txt` contém uma explicação completa e um roteiro
curto para apresentação.

## Configuração do banco

O arquivo `script.sql` foi validado em PostgreSQL e pode ser executado diretamente dentro de um banco vazio. Ele cria:

- `coordenadores`
- `sintese`
- `cronograma`
- `voluntario`
- `auditoria`
- chaves primárias e estrangeiras
- índices únicos para login, CPF, RA e e-mail
- validações dos principais dados
- usuário inicial para o primeiro acesso
- senha inicial protegida com bcrypt
- histórico de alterações realizadas pelos coordenadores

### Atualizando um banco existente

Execute novamente o conteúdo atualizado de `script.sql` dentro do banco existente. O script cria a tabela de auditoria e converte a senha padrão antiga do administrador para bcrypt sem apagar os dados existentes.

Além disso, o primeiro login de qualquer coordenador que ainda possua uma senha antiga converte essa senha automaticamente para bcrypt.

## Segurança

- Rotas da API protegidas por JWT.
- Tokens expiram após 8 horas.
- Senhas armazenadas com bcrypt.
- Respostas da API não retornam senhas.
- Exclusão de voluntários realizada como desativação.
- Alterações registradas na tabela `auditoria`.

Para consultar as últimas alterações autenticadas:

```text
GET http://localhost:3001/auditoria
```

## Status

Versão acadêmica final funcional.
