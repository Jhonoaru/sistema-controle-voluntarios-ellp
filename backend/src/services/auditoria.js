async function registrarAuditoria(executor, usuario, acao, entidade, entidadeId, detalhes = {}) {
  await executor.query(
    `INSERT INTO auditoria
      (coordenador_id, coordenador_nome, acao, entidade, entidade_id, detalhes)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      usuario?.id || null,
      usuario?.nome || 'Sistema',
      acao,
      entidade,
      entidadeId || null,
      JSON.stringify(detalhes)
    ]
  );
}

module.exports = { registrarAuditoria };
