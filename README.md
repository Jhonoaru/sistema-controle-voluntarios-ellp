# Sistema de Controle de Voluntários ELLP

Sistema web desenvolvido para gerenciamento de voluntários da ELLP.

------------------------------------------------------------

TECNOLOGIAS UTILIZADAS

Front-end
- HTML5
- CSS3
- JavaScript

Back-end
- Node.js
- Express.js

Banco de Dados
- PostgreSQL

Ferramentas
- Git
- GitHub
- Nodemon
- dotenv
- CORS

------------------------------------------------------------

COMO RODAR O PROJETO

1. Clonar repositório

git clone https://github.com/Jhonoaru/sistema-controle-voluntarios-ellp.git

2. Entrar na pasta backend

cd sistema-controle-voluntarios-ellp/backend

3. Instalar dependências

npm install

4. Criar arquivo .env dentro da pasta backend

PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=ellp

5. Executar o banco de dados

Rodar o arquivo:
script.sql

6. Rodar o servidor

Modo desenvolvimento:
npm run dev

Modo produção:
npm start

Servidor:
http://localhost:3001

------------------------------------------------------------

DEPENDÊNCIAS

npm install express pg cors dotenv
npm install nodemon --save-dev

------------------------------------------------------------

SCRIPTS

"scripts": {
  "start": "node src/app.js",
  "dev": "nodemon src/app.js"
}

------------------------------------------------------------

FUNCIONALIDADES

- Login administrativo
- Cadastro de voluntários
- Edição de voluntários
- Exclusão de voluntários
- Controle Ativo/Inativo
- Cadastro de cronogramas

------------------------------------------------------------

GIT FLOW

Atualizar projeto:
git checkout develop
git pull origin develop

Criar branch:
git checkout -b feature/nome-feature

Subir alterações:
git add .
git commit -m "feat: descrição"
git push

------------------------------------------------------------

STATUS

Projeto em desenvolvimento 🚀
