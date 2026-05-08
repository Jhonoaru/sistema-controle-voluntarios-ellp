const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API ELLP rodando 🚀');
});

app.get('/test-db', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json(result.rows[0]);
});

const voluntarioRoutes = require('./routes/voluntarioRoutes');
app.use('/voluntarios', voluntarioRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const sinteseRoutes = require('./routes/sinteseRoutes');
app.use('/sinteses', sinteseRoutes);

const cronogramaRoutes = require('./routes/cronogramaRoutes');
app.use('/cronogramas', cronogramaRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});