const express = require('express');
const PDFDocument = require('pdfkit');
const pool = require('../db');

const router = express.Router();

router.get('/termo/:id', async (req, res) => {
  try {
    const voluntario = await buscarVoluntario(req.params.id);

    if (!voluntario) {
      return res.status(404).json({ error: 'Voluntario nao encontrado' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const nomeArquivo = criarNomeArquivo(voluntario.nome, voluntario.id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);

    doc.pipe(res);
    gerarPdfTermo(doc, voluntario);
    doc.end();
  } catch (error) {
    console.error('Erro ao gerar termo:', error);
    res.status(500).json({ error: 'Erro ao gerar termo em PDF' });
  }
});

async function buscarVoluntario(id) {
  const result = await pool.query(
    `
      SELECT
        v.*,
        s.descricao AS sintese,
        c.nome AS cronograma_nome,
        c.descricao AS cronograma_descricao,
        c.data_inicio,
        c.data_fim,
        c.meses
      FROM voluntario v
      LEFT JOIN sintese s ON v.sintese_id = s.id
      LEFT JOIN cronograma c ON v.cronograma_id = c.id
      WHERE v.id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}

function gerarPdfTermo(doc, voluntario) {
  const atividades = montarAtividades(voluntario);
  const meses = montarMeses(voluntario.meses);

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Ministerio da Educacao', { align: 'center' })
    .text('Universidade Tecnologica Federal do Parana', { align: 'center' })
    .text('Diretoria de Relacoes Empresariais e Comunitarias', { align: 'center' })
    .text('Departamento de Extensao', { align: 'center' });

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('TERMO DE ADESAO PARA VOLUNTARIO(A)', { align: 'center' });

  doc.moveDown(0.8);

  secao(doc, 'Dados da Instituicao');
  caixaTexto(doc, 'Instituicao: Universidade Tecnologica Federal do Parana - UTFPR');
  caixaTexto(doc, 'Campus: Cornelio Procopio.');
  doc.moveDown(0.5);

  secao(doc, 'Dados da acao');
  caixaTexto(
    doc,
    'Titulo da acao: Curso Comunitario Prisma - Preparatorio para o ENEM e Pre-vestibular'
  );
  caixaTexto(doc, 'Modalidade: ( ) programa   (X) projeto   ( ) evento   ( ) curso');
  linha2colunas(
    doc,
    `Vigencia inicio: ${formatarData(voluntario.data_inicio)}`,
    `Termino: ${formatarData(voluntario.data_fim)}`
  );
  if (voluntario.cronograma_nome || voluntario.cronograma_descricao) {
    caixaTexto(
      doc,
      `Cronograma: ${valor(voluntario.cronograma_nome || voluntario.cronograma_descricao)}`
    );
  }
  doc.moveDown(0.5);

  secao(doc, 'Dados da coordenacao da acao');
  caixaTexto(doc, 'Nome: Alessandro Otavio Marcello.');
  linha2colunas(doc, 'CPF: 029.273.799-80', 'Departamento: DIRGRAD-CP');
  linha2colunas(doc, 'Fone: (43) 3520-4030', 'E-mail: marcello@utfpr.edu.br');
  doc.moveDown(0.5);

  secao(doc, 'Dados do(a) Voluntario(a)');
  linha2colunas(
    doc,
    `Nome: ${valor(voluntario.nome)}`,
    `Data nascimento: ${formatarData(voluntario.data_nascimento)}`
  );
  linha2colunas(
    doc,
    `CPF: ${valor(voluntario.cpf)}`,
    `Nacionalidade: ${valor(voluntario.nacionalidade)}`
  );
  caixaTexto(doc, `Estudante da UTFPR: ${marcarSimNao(voluntario.estudante)}`);
  linha3colunas(
    doc,
    `Curso: ${valor(voluntario.curso)}`,
    `Periodo: ${valor(voluntario.periodo)}`,
    `RA: ${valor(voluntario.ra)}`
  );
  caixaTexto(doc, `Endereco: ${valor(voluntario.endereco)}`);
  linha2colunas(
    doc,
    `Cidade: ${valor(voluntario.cidade)}`,
    `Estado: ${valor(voluntario.estado)}`
  );
  linha2colunas(
    doc,
    `Fones: ${valor(voluntario.telefone)}`,
    `E-mail: ${valor(voluntario.email)}`
  );
  doc.moveDown(0.5);

  secao(doc, 'Sintese das atividades a serem desenvolvidas pelo(a) voluntario(a)');
  const totalLinhas = Math.max(atividades.length, 5);
  for (let i = 0; i < totalLinhas; i += 1) {
    caixaTexto(doc, atividades[i] ? `${i + 1}. ${atividades[i]}` : `${i + 1}.`, 18);
  }

  doc.moveDown(0.5);
  secaoComEspaco(
    doc,
    'Cronograma das atividades a serem desenvolvidas pelo(a) voluntario(a)',
    alturaCronograma(atividades)
  );
  cronograma(doc, atividades, meses);

  doc.addPage();
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('COMISSAO PRESIDIDA PELA PROFESSORA LAIZE PORTO ALEGRE - DIREXT', {
      align: 'center'
    });

  doc.moveDown(0.5);
  secao(doc, 'Condicoes Gerais');
  doc.fontSize(9).font('Helvetica');

  const condicoes = [
    {
      num: '1.',
      texto: 'O(a) voluntario(a) compromete-se a:',
      itens: [
        'a) Dedicar-se as atividades academicas e acoes de extensao em ritmo compativel com as atividades exigidas pelo curso durante o ano letivo.',
        'b) Realizar suas atividades nos dias e horarios previstos, podendo modifica-los em comum acordo com a Coordenacao da acao de Extensao.',
        'c) Ser assiduo, pontual e agir de forma etica nas acoes extensionistas.',
        'd) Observar as determinacoes da coordenacao alusivas ao bom desenvolvimento das acoes de extensao.',
        'e) Solicitar por escrito, com anuencia da Coordenacao da acao de Extensao, permissao para afastamentos superiores a 15 dias consecutivos.',
        'f) Apresentar relatorio parcial e final do trabalho desenvolvido a Coordenacao da acao de Extensao.'
      ]
    },
    {
      num: '2.',
      texto: 'Os trabalhos publicados em decorrencia das acoes de extensao apoiadas pela UTFPR deverao fazer referencia ao apoio recebido.'
    },
    {
      num: '3.',
      texto: 'O(a) Voluntario(a) declara ser conhecedor da Lei Federal N. 9.608, de 18 de fevereiro de 1998, especialmente de que o servico voluntario nao gera vinculo empregaticio.'
    },
    {
      num: '4.',
      texto: 'O(a) voluntario(a) e a coordenacao da acao de Extensao comprometem-se a cumprir as condicoes expressas neste instrumento e as normas aplicaveis.'
    }
  ];

  condicoes.forEach(condicao => {
    doc.font('Helvetica-Bold').text(`${condicao.num} `, { continued: true });
    doc.font('Helvetica').text(condicao.texto);

    if (condicao.itens) {
      condicao.itens.forEach(item => doc.text(item, { indent: 20 }));
    }

    doc.moveDown(0.4);
  });

  doc.moveDown(1);
  doc
    .fontSize(9)
    .font('Helvetica')
    .text('Local: _________________________     Data: ____/____/________');

  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(10).text('ACEITE E CONCORDANCIA', {
    align: 'center'
  });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(
      'Este documento devera ser assinado pelo voluntario(a), pela coordenacao da acao e pela Diretoria de Relacoes Empresariais e Comunitarias.',
      { align: 'center' }
    );

  doc.moveDown(2);
  assinatura(doc, 'Voluntario(a)');
  doc.moveDown(2);
  assinatura(doc, 'Coordenacao da acao');
  doc.moveDown(2);
  assinatura(doc, 'Professor Orientador');
  doc.moveDown(2);
  assinatura(doc, 'DIREC');
}

function secao(doc, titulo) {
  garantirEspaco(doc, 32);
  doc.moveDown(0.3).fontSize(10).font('Helvetica-Bold').text(titulo).moveDown(0.2);
}

function secaoComEspaco(doc, titulo, alturaConteudo) {
  garantirEspaco(doc, 32 + alturaConteudo);
  doc.moveDown(0.3).fontSize(10).font('Helvetica-Bold').text(titulo).moveDown(0.2);
}

function caixaTexto(doc, texto, alturaMin = 18) {
  const x = 50;
  const w = doc.page.width - 100;
  const altura = Math.max(alturaMin, doc.heightOfString(texto, { width: w - 8 }) + 8);
  garantirEspaco(doc, altura);

  const y = doc.y;
  doc.rect(x, y, w, altura).stroke();
  doc.font('Helvetica').fontSize(9).text(texto, x + 4, y + 4, { width: w - 8 });
  doc.y = y + altura;
}

function linha2colunas(doc, esq, dir) {
  const x = 50;
  const w = doc.page.width - 100;
  const metade = w / 2;
  const h = 20;
  garantirEspaco(doc, h);

  const y = doc.y;
  doc.rect(x, y, metade, h).stroke();
  doc.rect(x + metade, y, metade, h).stroke();
  doc.font('Helvetica').fontSize(9);
  doc.text(esq, x + 4, y + 5, { width: metade - 8 });
  doc.text(dir, x + metade + 4, y + 5, { width: metade - 8 });
  doc.y = y + h;
}

function linha3colunas(doc, a, b, c) {
  const x = 50;
  const w = doc.page.width - 100;
  const primeira = w / 2;
  const outra = w / 4;
  const h = 20;
  garantirEspaco(doc, h);

  const y = doc.y;
  doc.rect(x, y, primeira, h).stroke();
  doc.rect(x + primeira, y, outra, h).stroke();
  doc.rect(x + primeira + outra, y, outra, h).stroke();
  doc.font('Helvetica').fontSize(9);
  doc.text(a, x + 4, y + 5, { width: primeira - 8 });
  doc.text(b, x + primeira + 4, y + 5, { width: outra - 8 });
  doc.text(c, x + primeira + outra + 4, y + 5, { width: outra - 8 });
  doc.y = y + h;
}

function cronograma(doc, atividades, meses) {
  const x = 50;
  const w = doc.page.width - 100;
  const colunaAtiv = w * 0.36;
  const colunaMes = (w - colunaAtiv) / 12;
  const hCab = 22;
  const hLinha = 18;
  const totalAtiv = Math.max(atividades.length, 5);
  const xIni = x + colunaAtiv;
  garantirEspaco(doc, alturaCronograma(atividades));

  const y = doc.y;
  doc.rect(x, y, colunaAtiv, hCab).stroke();
  doc.font('Helvetica-Bold').fontSize(8).text('ATIVIDADES', x + 4, y + 7, {
    width: colunaAtiv - 8,
    align: 'center'
  });

  for (let m = 1; m <= 12; m += 1) {
    const xm = xIni + (m - 1) * colunaMes;
    doc.rect(xm, y, colunaMes, hCab).stroke();
    doc.text(String(m), xm, y + 7, { width: colunaMes, align: 'center' });
  }

  for (let i = 0; i < totalAtiv; i += 1) {
    const yl = y + hCab + i * hLinha;
    doc.rect(x, yl, colunaAtiv, hLinha).stroke();
    doc.font('Helvetica').fontSize(8).text(String(i + 1), x + 4, yl + 5, {
      width: colunaAtiv - 8
    });

    for (let m = 1; m <= 12; m += 1) {
      const xm = xIni + (m - 1) * colunaMes;
      doc.rect(xm, yl, colunaMes, hLinha).stroke();

      if (meses.includes(String(m))) {
        doc.text('X', xm, yl + 5, { width: colunaMes, align: 'center' });
      }
    }
  }

  doc.y = y + hCab + totalAtiv * hLinha + 10;
}

function alturaCronograma(atividades) {
  const hCab = 22;
  const hLinha = 18;
  const totalAtiv = Math.max(atividades.length, 5);

  return hCab + totalAtiv * hLinha + 10;
}

function garantirEspaco(doc, alturaNecessaria) {
  const limiteInferior = doc.page.height - doc.page.margins.bottom;

  if (doc.y + alturaNecessaria > limiteInferior) {
    doc.addPage();
  }
}

function assinatura(doc, cargo) {
  const x = 150;
  const largura = 295;

  doc.moveTo(x, doc.y).lineTo(x + largura, doc.y).stroke();
  doc.font('Helvetica').fontSize(9).text(cargo, { align: 'center' });
}

function montarAtividades(voluntario) {
  const textos = [voluntario.sintese, voluntario.cronograma_descricao].filter(Boolean);

  const atividades = textos
    .flatMap(texto => String(texto).split(/\r?\n|;/))
    .map(texto => texto.trim())
    .filter(Boolean);

  return atividades.length ? atividades : ['Atividades de extensao vinculadas ao projeto ELLP.'];
}

function montarMeses(meses) {
  if (!meses) return [];

  if (Array.isArray(meses)) {
    return meses.map(String);
  }

  try {
    const parsed = JSON.parse(meses);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (error) {
    return [];
  }
}

function formatarData(data) {
  if (!data) return '____/____/________';

  const date = new Date(data);
  if (Number.isNaN(date.getTime())) return String(data);

  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function marcarSimNao(valorEstudante) {
  const estudante = String(valorEstudante || '').toLowerCase();
  return estudante === 'sim' || estudante === 'true'
    ? '(X) sim   ( ) nao'
    : '( ) sim   (X) nao';
}

function valor(valorCampo) {
  return valorCampo || 'Nao informado';
}

function criarNomeArquivo(nome, id) {
  const nomeLimpo = String(nome || `voluntario_${id}`)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

  return `termo_${nomeLimpo || id}.pdf`;
}

module.exports = router;
module.exports.gerarPdfTermo = gerarPdfTermo;
