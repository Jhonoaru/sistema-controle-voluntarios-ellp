// Script de teste standalone
// Gera o PDF com dados fictícios e salva como "termo_teste.pdf"
//
// Como usar:
//   1. Coloque este arquivo na raiz do projeto
//   2. npm install pdfkit
//   3. node testarTermo.js
//   4. Abra o arquivo "termo_teste.pdf" que será gerado na mesma pasta

const fs = require('fs');
const PDFDocument = require('pdfkit');

// Dados fictícios para teste 
const v = {
  nome: 'Maria da Silva',
  data_nascimento: '15/03/2000',
  cpf: '123.456.789-00',
  nacionalidade: 'Brasileira',
  estudante_utfpr: true,
  curso: 'Engenharia de Computação',
  periodo: '4º',
  ra: '2021001234',
  endereco: 'Rua das Flores, 123',
  cidade: 'Cornélio Procópio',
  estado: 'PR',
  telefone: '(43) 99999-0000',
  email: 'maria@alunos.utfpr.edu.br',
  atividades: [
    'Ministrar aulas de Matemática para turmas do ENEM',
    'Elaborar listas de exercícios e materiais de apoio',
    'Participar das reuniões mensais de coordenação',
    'Realizar atendimento individualizado a alunos com dificuldades',
  ],
  periodo_inicio: 'Janeiro/2025',
  periodo_fim: 'Dezembro/2025',
};


const doc = new PDFDocument({ size: 'A4', margin: 50 });

doc.pipe(fs.createWriteStream('termo_teste.pdf'));

const largura = doc.page.width - 100;

// Cabeçalho 
doc
  .fontSize(10).font('Helvetica-Bold')
  .text('Ministério da Educação', { align: 'center' })
  .text('Universidade Tecnológica Federal do Paraná', { align: 'center' })
  .text('Diretoria de Relações Empresariais e Comunitárias', { align: 'center' })
  .text('Departamento de Extensão', { align: 'center' });

doc.moveDown(0.5);
doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
doc.moveDown(0.5);

// Título
doc.fontSize(12).font('Helvetica-Bold')
  .text('TERMO DE ADESÃO PARA VOLUNTÁRIO(A)', { align: 'center' });
doc.moveDown(0.8);

// Dados da Instituição 
secao(doc, 'Dados da Instituição');
caixaTexto(doc, 'Instituição: Universidade Tecnológica Federal do Paraná – UTFPR');
caixaTexto(doc, 'Câmpus: Cornélio Procópio.');
doc.moveDown(0.5);

// Dados da Ação
secao(doc, 'Dados da ação');
caixaTexto(doc, 'Título da ação: Curso Comunitário Prisma – Preparatório para o ENEM e Pré-vestibular');
caixaTexto(doc, 'Modalidade:  ( ) programa   (X) projeto   ( ) evento   ( ) curso');
linha2colunas(doc, `Vigência  Início: ${v.periodo_inicio}.`, `Término: ${v.periodo_fim}.`);
doc.moveDown(0.5);

// Dados da Coordenação
secao(doc, 'Dados da coordenação da ação');
caixaTexto(doc, 'Nome: Alessandro Otávio Marcello.');
linha2colunas(doc, 'CPF: 029.273.799-80', 'Departamento: DIRGRAD-CP');
linha2colunas(doc, 'Fone: (43) 3520-4030', 'E-mail: marcello@utfpr.edu.br');
doc.moveDown(0.5);

// Dados do Voluntário
secao(doc, 'Dados do(a) Voluntário(a)');
linha2colunas(doc, `Nome: ${v.nome}`, `Data nascimento: ${v.data_nascimento}`);
linha2colunas(doc, `CPF: ${v.cpf}`, `Nacionalidade: ${v.nacionalidade}`);
caixaTexto(doc, `É estudante da UTFPR: ${v.estudante_utfpr ? '(X) sim   ( ) não' : '( ) sim   (X) não'}`);
linha3colunas(doc, `Curso: ${v.curso}`, `Período: ${v.periodo}`, `RA: ${v.ra}`);
caixaTexto(doc, `Endereço: ${v.endereco}`);
linha2colunas(doc, `Cidade: ${v.cidade}`, `Estado: ${v.estado}`);
linha2colunas(doc, `Fones: ${v.telefone}`, `E-mail: ${v.email}`);
doc.moveDown(0.5);

// Síntese das Atividades
secao(doc, 'Síntese das atividades a serem desenvolvidas pelo(a) voluntário(a)');
const totalLinhas = Math.max(v.atividades.length, 5);
for (let i = 0; i < totalLinhas; i++) {
  const txt = v.atividades[i] ? `${i + 1}  ${v.atividades[i]}` : `${i + 1}`;
  caixaTexto(doc, txt, 16);
}
doc.moveDown(0.5);

// Cronograma
secao(doc, 'Cronograma das atividades a serem desenvolvidas pelo(a) voluntário(a)');
cronograma(doc, v.atividades);

// Página 2: Condições Gerais
doc.addPage();
doc.fontSize(9).font('Helvetica-Bold')
  .text('COMISSÃO PRESIDIDA PELA PROFESSORA LAÍZE PORTO ALEGRE - DIREXT', { align: 'center' });
doc.moveDown(0.5);

secao(doc, 'Condições Gerais');
doc.fontSize(9).font('Helvetica');

const condicoes = [
  {
    num: '1.', texto: 'O(a) voluntário(a) compromete-se a:',
    itens: [
      'a) Dedicar-se às atividades acadêmicas e ações de extensão em ritmo compatível com as atividades exigidas pelo curso durante o ano letivo.',
      'b) Realizar suas atividades nos dias e horários previstos, podendo modificá-los, em comum acordo com a Coordenação da ação de Extensão.',
      'c) Ser assíduo, pontual e agir de forma ética nas ações extensionistas.',
      'd) Observar as determinações da coordenação alusivas ao bom desenvolvimento das ações de extensão.',
      'e) Solicitar por escrito, com anuência da Coordenação da ação de Extensão, junto à Diretoria de Relações Empresariais e Comunitárias – DIREC, ou órgão equivalente de seu Campus, permissão para afastamentos superiores a 15 dias consecutivos.',
      'f) Apresentar relatório parcial e final do trabalho desenvolvido à Coordenação da ação de Extensão.',
      'g) Participar das reuniões mensais para apresentar os resultados obtidos, receber orientação e alinhar suas atividades com as demais correntes.',
      'h) Qualquer ausência sem aviso prévio e não aprovada pela respectiva Coordenação resultará no desconto proporcional de pontos de atividade complementar, exceto reuniões onde serão descontados dois pontos fixos por falta.',
    ],
  },
  { num: '2.', texto: 'Os trabalhos publicados em decorrência das ações de extensão apoiadas pela UTFPR deverão, necessariamente, fazer referência ao apoio recebido, com a seguinte expressão: "O presente trabalho foi realizado com o apoio da Universidade Tecnológica Federal do Paraná - UTFPR".' },
  { num: '3.', texto: 'O(a) Voluntário(a) declara ser conhecedor da Lei Federal N. 9.608, de 18 de fevereiro de 1998, especialmente de que o serviço voluntário "não gera vínculo empregatício, nem obrigação de natureza trabalhista, previdenciária ou afim".' },
  { num: '4.', texto: 'O(a) Voluntário(a), estudante da UTFPR, contará com o seguro contra acidentes pessoais pago pela UTFPR, conforme dispositivo legal pertinente.' },
  { num: '5.', texto: 'A UTFPR não se responsabiliza por qualquer dano físico ou mental causado ao(à) estudante voluntário(a) na execução da ação de extensão.' },
  { num: '6.', texto: 'À coordenação da ação de extensão cabe supervisionar as atividades desenvolvidas pelo(a) voluntário(a), nos dias e horários previstos, e informar à DIREC sobre o cancelamento deste Termo, quando ocorrer, em até 03 dias.' },
  { num: '7.', texto: 'A UTFPR poderá cancelar ou suspender o vínculo com a atividade quando constatado que foram infringidas quaisquer das condições constantes deste termo e das normas aplicáveis ao Edital respectivo, sem prejuízo da aplicação dos dispositivos legais que disciplinam o ressarcimento dos recursos.' },
  { num: '8.', texto: 'O(a) voluntário(a) e a coordenação da ação de Extensão comprometem-se a cumprir as condições expressas neste instrumento e as normas que lhe são aplicáveis.' },
];

for (const c of condicoes) {
  doc.font('Helvetica-Bold').text(`${c.num}  `, { continued: true });
  doc.font('Helvetica').text(c.texto);
  if (c.itens) {
    for (const item of c.itens) {
      doc.text(item, { indent: 20 });
    }
  }
  doc.moveDown(0.3);
}

// Assinaturas
doc.moveDown(1);
doc.fontSize(9).font('Helvetica')
  .text('Local: _________________________     Data: ____/____/________');

doc.moveDown(1);
doc.font('Helvetica-Bold').fontSize(10).text('ACEITE E CONCORDÂNCIA', { align: 'center' });
doc.font('Helvetica').fontSize(9).text(
  '(Este documento deverá ser assinado pelo voluntário(a), pela coordenação da ação e pela Diretoria de Relações Empresariais e Comunitárias, sendo uma cópia arquivada na DIREC).',
  { align: 'center' }
);

doc.moveDown(2); assinatura(doc, 'Voluntário(a)');
doc.moveDown(2); assinatura(doc, 'Coordenação da ação');
doc.moveDown(2); assinatura(doc, 'Professor Orientador');
doc.moveDown(2); assinatura(doc, 'DIREC');

doc.end();
console.log('✅ PDF gerado com sucesso: termo_teste.pdf');

// Funções auxiliares

function secao(doc, titulo) {
  doc.moveDown(0.3).fontSize(10).font('Helvetica-Bold').text(titulo).moveDown(0.2);
}

function caixaTexto(doc, texto, alturaMin = 18) {
  const x = 50, y = doc.y, w = doc.page.width - 100;
  doc.rect(x, y, w, alturaMin).stroke();
  doc.font('Helvetica').fontSize(9).text(texto, x + 4, y + 4, { width: w - 8 });
  doc.y = y + alturaMin;
}

function linha2colunas(doc, esq, dir) {
  const x = 50, y = doc.y, w = doc.page.width - 100, metade = w / 2, h = 18;
  doc.rect(x, y, metade, h).stroke();
  doc.rect(x + metade, y, metade, h).stroke();
  doc.font('Helvetica').fontSize(9);
  doc.text(esq, x + 4, y + 4, { width: metade - 8 });
  doc.text(dir, x + metade + 4, y + 4, { width: metade - 8 });
  doc.y = y + h;
}

function linha3colunas(doc, a, b, c) {
  const x = 50, y = doc.y, w = doc.page.width - 100;
  const terco = w / 2, quarto = w / 4, h = 18;
  doc.rect(x, y, terco, h).stroke();
  doc.rect(x + terco, y, quarto, h).stroke();
  doc.rect(x + terco + quarto, y, quarto, h).stroke();
  doc.font('Helvetica').fontSize(9);
  doc.text(a, x + 4, y + 4, { width: terco - 8 });
  doc.text(b, x + terco + 4, y + 4, { width: quarto - 8 });
  doc.text(c, x + terco + quarto + 4, y + 4, { width: quarto - 8 });
  doc.y = y + h;
}

function cronograma(doc, atividades) {
  const x = 50, y = doc.y, w = doc.page.width - 100;
  const colunaAtiv = w * 0.3, colunaMes = (w - colunaAtiv) / 12;
  const hCab = 20, hLinha = 16;
  const totalAtiv = Math.max(atividades.length, 5);
  const xIni = x + colunaAtiv;

  doc.rect(x, y, colunaAtiv, hCab).stroke();
  doc.font('Helvetica-Bold').fontSize(8).text('PERÍODO', x + 4, y + 6, { width: colunaAtiv - 8, align: 'center' });
  doc.rect(xIni, y, w - colunaAtiv, hCab / 2).stroke();
  doc.text('INÍCIO  ___/_____', xIni + 4, y + 3, { width: (w - colunaAtiv) / 2 - 8 });
  doc.text('FIM  ___/_____', xIni + (w - colunaAtiv) / 2 + 4, y + 3, { width: (w - colunaAtiv) / 2 - 8 });

  const y2 = y + hCab / 2;
  doc.rect(x, y2, colunaAtiv, hCab / 2 + 4).stroke();
  doc.text('ATIVIDADES', x + 4, y2 + 3, { width: colunaAtiv - 8, align: 'center' });
  for (let m = 1; m <= 12; m++) {
    const xm = xIni + (m - 1) * colunaMes;
    doc.rect(xm, y2, colunaMes, hCab / 2 + 4).stroke();
    doc.text(String(m), xm, y2 + 3, { width: colunaMes, align: 'center' });
  }

  const y3 = y2 + hCab / 2 + 4;
  for (let i = 0; i < totalAtiv; i++) {
    const yl = y3 + i * hLinha;
    doc.rect(x, yl, colunaAtiv, hLinha).stroke();
    doc.font('Helvetica').fontSize(8).text(String(i + 1), x + 4, yl + 4, { width: colunaAtiv - 8 });
    for (let m = 0; m < 12; m++) doc.rect(xIni + m * colunaMes, yl, colunaMes, hLinha).stroke();
  }
  const yl = y3 + totalAtiv * hLinha;
  doc.rect(x, yl, w, hLinha).stroke();
  doc.font('Helvetica').fontSize(8).text('...', x + 4, yl + 4);
  doc.y = yl + hLinha + 10;
}

function assinatura(doc, cargo) {
  doc.moveTo(150, doc.y).lineTo(445, doc.y).stroke();
  doc.font('Helvetica').fontSize(9).text(cargo, { align: 'center' });
}