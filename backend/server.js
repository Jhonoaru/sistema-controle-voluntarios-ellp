const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const voluntarioRoutes = require('./routes/voluntario');
const cronogramaRoutes = require('./routes/cronograma');

app.use('/voluntarios', voluntarioRoutes);
app.use('/cronogramas', cronogramaRoutes);

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001 🚀');
});