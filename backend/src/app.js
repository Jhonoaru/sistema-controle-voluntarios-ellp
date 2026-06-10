const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { autenticar } = require('./middleware/autenticacao');

const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
  res.json({ message: 'API ELLP rodando' });
});

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

app.use(autenticar);

const voluntarioRoutes = require('./routes/voluntarioRoutes');
app.use('/voluntarios', voluntarioRoutes);

const sinteseRoutes = require('./routes/sinteseRoutes');
app.use('/sinteses', sinteseRoutes);

const cronogramaRoutes = require('./routes/cronogramaRoutes');
app.use('/cronogramas', cronogramaRoutes);

const coordenadorRoutes = require('./routes/coordenadorRoutes');
app.use('/coordenadores', coordenadorRoutes);

const gerarTermoRoutes = require('./routes/gerarTermo');
app.use('/api', gerarTermoRoutes);

const auditoriaRoutes = require('./routes/auditoriaRoutes');
app.use('/auditoria', auditoriaRoutes);

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
