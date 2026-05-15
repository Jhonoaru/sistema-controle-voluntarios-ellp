# 📖 Sistema de Controle de Voluntários ELLP

> Sistema web desenvolvido para gerenciamento de voluntários da ELLP, permitindo o controle de cadastros, status de participação e cronogramas de atividades.

## 🚀 Funcionalidades

- **Login Administrativo**: Controle de acesso ao sistema.
- **Cadastro de Voluntários**: Registro de novos voluntários.
- **Edição de Dados**: Atualização das informações cadastradas.
- **Exclusão de Voluntários**: Remoção de registros do sistema.
- **Controle de Status**: Gerenciamento de voluntários ativos e inativos.
- **Cadastro de Cronogramas**: Organização das atividades e eventos.

## 📂 Estrutura do Projeto

O projeto está organizado em duas partes principais: `frontend` e `backend`.

### **Back-end (`backend/`)**

```bash
src/
├── config/           # Configurações da aplicação e banco de dados
├── controllers/      # Lógica das funcionalidades
├── routes/           # Rotas da aplicação
├── services/         # Serviços e regras de negócio
└── app.js            # Arquivo principal da aplicação
```

## 🔧 Instruções de Uso

> Para executar o projeto localmente, siga os passos abaixo:

### 1. Pré-requisitos

- É necessário ter o [Node.js](https://nodejs.org/) instalado.
- É necessário ter o [PostgreSQL](https://www.postgresql.org/) instalado e em execução.
- É recomendado utilizar o [Git](https://git-scm.com/) para clonar o repositório.

### 2. Clone o repositório

```bash
git clone https://github.com/Jhonoaru/sistema-controle-voluntarios-ellp.git
```

```bash
cd sistema-controle-voluntarios-ellp/backend
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Crie um arquivo chamado `.env` na raiz da pasta `backend` e preencha com as seguintes informações:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=ellp
```

### 5. Configure o banco de dados

Execute o script SQL responsável pela criação do banco e tabelas:

```bash
script.sql
```

### 6. Execute o servidor

#### Ambiente de desenvolvimento

```bash
npm run dev
```

#### Ambiente de produção

```bash
npm start
```

### 7. Acesse a aplicação

O servidor estará disponível em:

```bash
http://localhost:3001
```

## 🛠️ Tecnologias Utilizadas

### **Front-end**

- HTML5
- CSS3
- JavaScript

### **Back-end**

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/pt-br/)

### **Banco de Dados**

- [PostgreSQL](https://www.postgresql.org/)

### **Ferramentas e Bibliotecas**

- [Git](https://git-scm.com/)
- [GitHub](https://github.com/)
- [Nodemon](https://nodemon.io/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [CORS](https://www.npmjs.com/package/cors)

## 📦 Dependências

### Dependências principais

```bash
npm install express pg cors dotenv
```

### Dependências de desenvolvimento

```bash
npm install nodemon --save-dev
```

## 📜 Scripts Disponíveis

```json
"scripts": {
  "start": "node src/app.js",
  "dev": "nodemon src/app.js"
}
```

## 🌱 Git Flow

### Atualizar o projeto

```bash
git checkout develop
git pull origin develop
```

### Criar uma nova branch

```bash
git checkout -b feature/nome-feature
```

### Subir alterações

```bash
git add .
git commit -m "feat: descrição"
git push
```

## 📌 Status do Projeto

> 🚀 Projeto em desenvolvimento.
