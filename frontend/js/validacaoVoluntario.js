function aplicarValidacoesVoluntario() {
  const hoje = obterDataHoje();
  const dataNascimento = document.getElementById('data_nascimento');
  const cpf = document.getElementById('cpf');
  const telefone = document.getElementById('telefone');
  const periodo = document.getElementById('periodo');
  const ra = document.getElementById('ra');

  if (dataNascimento) {
    dataNascimento.min = '1900-01-01';
    dataNascimento.max = hoje;
  }

  if (cpf) {
    cpf.maxLength = 14;
    cpf.inputMode = 'numeric';
    cpf.addEventListener('input', () => {
      cpf.value = formatarCpf(cpf.value);
    });
  }

  if (telefone) {
    telefone.maxLength = 15;
    telefone.inputMode = 'numeric';
    telefone.addEventListener('input', () => {
      telefone.value = formatarTelefone(telefone.value);
    });
  }

  if (periodo) {
    periodo.inputMode = 'numeric';
    periodo.addEventListener('input', () => {
      periodo.value = somenteDigitos(periodo.value).slice(0, 2);
    });
  }

  if (ra) {
    ra.inputMode = 'numeric';
    ra.addEventListener('input', () => {
      ra.value = somenteDigitos(ra.value).slice(0, 12);
    });
  }
}

function obterDadosVoluntario({ incluirAtivo = false } = {}) {
  const dados = {
    nome: obterValor('nome'),
    data_nascimento: obterValor('data_nascimento'),
    cpf: formatarCpf(obterValor('cpf')),
    nacionalidade: obterValor('nacionalidade'),
    estudante: document.querySelector('input[name="estudante"]:checked')?.value || null,
    curso: obterValor('curso'),
    periodo: obterValor('periodo'),
    ra: obterValor('ra'),
    endereco: obterValor('endereco'),
    cidade: obterValor('cidade'),
    estado: obterValor('estado'),
    email: obterValor('email'),
    telefone: formatarTelefone(obterValor('telefone')),
    cronograma_id: obterValor('cronograma') || null
  };

  if (incluirAtivo) {
    const ativo = document.querySelector('input[name="ativo"]:checked')?.value;
    dados.ativo = ativo === 'true';
    dados.ativoSelecionado = ativo !== undefined;
  }

  return dados;
}

function validarVoluntario(dados, { validarAtivo = false } = {}) {
  const obrigatorios = [
    ['nome', 'nome'],
    ['data_nascimento', 'data de nascimento'],
    ['cpf', 'CPF'],
    ['nacionalidade', 'nacionalidade'],
    ['estudante', 'estudante da UTFPR'],
    ['curso', 'curso'],
    ['periodo', 'periodo'],
    ['ra', 'RA'],
    ['endereco', 'endereco'],
    ['cidade', 'cidade'],
    ['estado', 'estado'],
    ['email', 'e-mail'],
    ['telefone', 'telefone'],
    ['cronograma_id', 'cronograma']
  ];

  if (validarAtivo && !dados.ativoSelecionado) {
    mostrarNotificacao('Selecione o status do voluntario.', 'erro');
    return false;
  }

  const campoVazio = obrigatorios.find(([campo]) => !dados[campo]);
  if (campoVazio) {
    mostrarNotificacao(`Preencha o campo ${campoVazio[1]}.`, 'erro');
    focarCampo(campoVazio[0]);
    return false;
  }

  if (!dataNascimentoValida(dados.data_nascimento)) {
    mostrarNotificacao('Informe uma data de nascimento valida entre 1900 e hoje.', 'erro');
    focarCampo('data_nascimento');
    return false;
  }

  if (!cpfValido(dados.cpf)) {
    mostrarNotificacao('CPF invalido. Confira os numeros digitados.', 'erro');
    focarCampo('cpf');
    return false;
  }

  if (!emailValido(dados.email)) {
    mostrarNotificacao('Informe um e-mail valido.', 'erro');
    focarCampo('email');
    return false;
  }

  if (!telefoneValido(dados.telefone)) {
    mostrarNotificacao('Informe um telefone valido com DDD.', 'erro');
    focarCampo('telefone');
    return false;
  }

  const periodoNumero = Number(dados.periodo);
  if (!Number.isInteger(periodoNumero) || periodoNumero < 1 || periodoNumero > 12) {
    mostrarNotificacao('Informe um periodo entre 1 e 12.', 'erro');
    focarCampo('periodo');
    return false;
  }

  if (!/^\d{4,12}$/.test(somenteDigitos(dados.ra))) {
    mostrarNotificacao('Informe um RA valido com numeros.', 'erro');
    focarCampo('ra');
    return false;
  }

  return true;
}

function formatarCpf(valor) {
  const digitos = somenteDigitos(valor).slice(0, 11);

  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarTelefone(valor) {
  const digitos = somenteDigitos(valor).slice(0, 11);

  if (digitos.length <= 10) {
    return digitos
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return digitos
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function dataNascimentoValida(valor) {
  if (!valor) return false;

  const data = new Date(`${valor}T00:00:00`);
  const minimo = new Date('1900-01-01T00:00:00');
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  return data >= minimo && data <= hoje;
}

function obterDataHoje() {
  const hoje = new Date();
  hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
  return hoje.toISOString().split('T')[0];
}

function somenteDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

function obterValor(id) {
  return document.getElementById(id)?.value.trim() || '';
}

function focarCampo(campo) {
  const elemento = document.getElementById(campo);
  if (elemento) {
    elemento.focus();
  }
}

document.addEventListener('DOMContentLoaded', aplicarValidacoesVoluntario);
