let voluntarioId = null;
exigirAutenticacao();

function getId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function carregarVoluntario() {
  try {
    voluntarioId = getId();

    const res = await apiFetch('/voluntarios');
    if (!res.ok) {
      throw new Error('Erro ao carregar voluntario');
    }

    const data = await res.json();
    const v = data.find(voluntario => voluntario.id == voluntarioId);

    if (!v) {
      mostrarNotificacao('Voluntario nao encontrado.', 'erro');
      return;
    }

    document.getElementById('nome').value = v.nome || '';
    document.getElementById('cpf').value = formatarCpf(v.cpf || '');
    document.getElementById('email').value = v.email || '';
    document.getElementById('telefone').value = formatarTelefone(v.telefone || '');
    document.getElementById('curso').value = v.curso || '';
    document.getElementById('periodo').value = v.periodo || '';
    document.getElementById('ra').value = v.ra || '';
    document.getElementById('endereco').value = v.endereco || '';
    document.getElementById('cidade').value = v.cidade || '';
    document.getElementById('estado').value = v.estado || '';
    document.getElementById('nacionalidade').value = v.nacionalidade || '';

    if (v.data_nascimento) {
      document.getElementById('data_nascimento').value = v.data_nascimento.split('T')[0];
    }

    if (v.ativo !== undefined) {
      document.querySelector(`input[name="ativo"][value="${v.ativo}"]`).checked = true;
    }

    if (v.estudante) {
      const estudante = document.querySelector(`input[name="estudante"][value="${v.estudante}"]`);
      if (estudante) {
        estudante.checked = true;
      }
    }

    await carregarCronogramas(v.cronograma_id);
  } catch (error) {
    console.error('Erro ao carregar voluntario:', error);
    mostrarNotificacao('Erro ao carregar voluntario.', 'erro');
  }
}

async function salvar() {
  const dados = obterDadosVoluntario({ incluirAtivo: true });

  if (!validarVoluntario(dados, { validarAtivo: true })) return;
  delete dados.ativoSelecionado;

  try {
    const res = await apiFetch(`/voluntarios/${voluntarioId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Erro ao salvar voluntario');
    }

    salvarNotificacaoPendente('Voluntario atualizado com sucesso.', 'sucesso');
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Erro ao salvar voluntario:', error);
    mostrarNotificacao(error.message || 'Nao foi possivel salvar o voluntario.', 'erro');
  }
}

async function carregarCronogramas(selectedId = null) {
  try {
    const res = await apiFetch('/cronogramas');
    if (!res.ok) {
      throw new Error('Erro ao carregar cronogramas');
    }

    const data = await res.json();
    const select = document.getElementById('cronograma');
    select.innerHTML = '<option value="">Selecione</option>';

    data.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      option.text = c.nome;

      if (selectedId && c.id == selectedId) {
        option.selected = true;
      }

      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar cronogramas:', error);
    mostrarNotificacao('Erro ao carregar cronogramas.', 'erro');
  }
}

function voltar() {
  window.location.href = 'dashboard.html';
}

async function excluir() {
  if (!confirm('Tem certeza que deseja desativar este voluntario?')) return;

  try {
    const res = await apiFetch(`/voluntarios/${voluntarioId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error('Erro ao desativar voluntario');
    }

    salvarNotificacaoPendente('Voluntario desativado com sucesso.', 'sucesso');
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Erro ao desativar voluntario:', error);
    mostrarNotificacao('Nao foi possivel desativar o voluntario.', 'erro');
  }
}

carregarVoluntario();
