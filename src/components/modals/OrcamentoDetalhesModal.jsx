import React from 'react';

// Mapeamento completo de status do BD para nomes amigáveis
const STATUS_DISPLAY_MAP = {
    // Status de Orçamentos (antes de aprovação)
    'new': 'Solicitados',
    'requested': 'Solicitados',
    'meeting_scheduled': 'Reunião Agendada',
    // Status de Projetos (quando production_permission = true)
    'waiting': 'Em espera',
    'waiting_client': 'Aguardando Cliente',
    'in_development': 'Desenvolvimento',
    'waiting_approval': 'Aguardando aprovação',
    'done': 'Concluído'
};

// Função para obter o nome amigável do status
const getStatusDisplayName = (status) => {
    return STATUS_DISPLAY_MAP[status] || status;
};

/**
 * Modal de detalhes para Orçamentos
 * Usa classes CSS específicas: .orcamento-modal-overlay, .orcamento-modal-content
 */
export default function OrcamentoDetalhesModal({ orcamento, onClose }) {
    if (!orcamento) return null;

    // Função auxiliar para renderizar lista de itens
    const renderList = (items) => {
        if (!items || items.length === 0) return <span style={{ color: 'rgba(255,255,255,0.5)' }}>Não especificado</span>;
        return (
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'rgba(255,255,255,0.85)' }}>
                {items.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
        );
    };

    return (
        <div className="orcamento-modal-overlay" onClick={onClose}>
            <div className="orcamento-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="orcamento-modal-header">
                    <h2>{orcamento.title}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="orcamento-modal-body">
                    {/* Status e Criador */}
                    <div className="orcamento-meta-grid" style={{ marginBottom: '1.5rem' }}>
                        <div className="orcamento-meta-item">
                            <span className="orcamento-label">Status</span>
                            <span className="orcamento-status-badge">
                                {getStatusDisplayName(orcamento.status)}
                            </span>
                        </div>
                        <div className="orcamento-meta-item">
                            <span className="orcamento-label">Criado em</span>
                            <span>{new Date(orcamento.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {orcamento.create_by && (
                            <div className="orcamento-meta-item">
                                <span className="orcamento-label">Solicitante</span>
                                <span>{orcamento.create_by}</span>
                            </div>
                        )}
                    </div>

                    {/* Descrição Geral */}
                    {orcamento.description && (
                        <div className="orcamento-info-section">
                            <h3 className="orcamento-section-title">Descrição Geral</h3>
                            <div className="orcamento-description-box">
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                    {typeof orcamento.description === 'string'
                                        ? orcamento.description.replace(/^"|"$/g, '')
                                        : orcamento.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Objetivo Principal */}
                    {orcamento.objetivo_principal && (
                        <div className="orcamento-info-section">
                            <h3 className="orcamento-section-title">Objetivo Principal</h3>
                            <div className="orcamento-description-box">
                                <p style={{ margin: 0 }}>{orcamento.objetivo_principal}</p>
                            </div>
                        </div>
                    )}

                    {/* Situação Atual */}
                    {orcamento.situacao_atual && (
                        <div className="orcamento-info-section">
                            <h3 className="orcamento-section-title">Situação Atual</h3>
                            <div className="orcamento-description-box">
                                <p style={{ margin: 0 }}>{orcamento.situacao_atual}</p>
                            </div>
                        </div>
                    )}

                    {/* Entradas (Input) */}
                    {orcamento.entradas && (
                        <div className="orcamento-info-section">
                            <h3 className="orcamento-section-title">Entradas de Informação</h3>
                            <div className="orcamento-description-box">
                                {renderList(orcamento.entradas.tipos)}
                                {orcamento.entradas.exemplo && (
                                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                        <strong>Exemplo:</strong> {orcamento.entradas.exemplo}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Saídas (Output) */}
                    {orcamento.saidas && (
                        <div className="orcamento-info-section">
                            <h3 className="orcamento-section-title">Saídas Esperadas</h3>
                            <div className="orcamento-description-box">
                                {renderList(orcamento.saidas.tipos)}
                                {orcamento.saidas.formato && (
                                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                        <strong>Formato:</strong> {orcamento.saidas.formato}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Critério de Sucesso */}
                    {orcamento.criterio_sucesso && (
                        <div className="orcamento-info-section">
                            <h3 className="orcamento-section-title">Critério de Sucesso</h3>
                            <div className="orcamento-description-box">
                                <p style={{ margin: 0 }}>{orcamento.criterio_sucesso}</p>
                            </div>
                        </div>
                    )}

                    {/* Volume Estimado */}
                    {orcamento.volume && (
                        <div className="orcamento-info-section">
                            <h3 className="orcamento-section-title">Volume Estimado</h3>
                            <div className="orcamento-meta-grid">
                                {orcamento.volume.usuarios && (
                                    <div className="orcamento-meta-item">
                                        <span className="orcamento-label">Usuários</span>
                                        <span>{orcamento.volume.usuarios}</span>
                                    </div>
                                )}
                                {orcamento.volume.registros_periodo && (
                                    <div className="orcamento-meta-item">
                                        <span className="orcamento-label">Registros/Período</span>
                                        <span>{orcamento.volume.registros_periodo}</span>
                                    </div>
                                )}
                                {orcamento.volume.crescimento_esperado && (
                                    <div className="orcamento-meta-item">
                                        <span className="orcamento-label">Crescimento Esperado</span>
                                        <span>{orcamento.volume.crescimento_esperado}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ferramentas */}
                    {orcamento.ferramentas && (
                        <div className="orcamento-info-section">
                            <h3 className="orcamento-section-title">Ferramentas e Sistemas</h3>
                            <div className="orcamento-description-box">
                                {renderList(orcamento.ferramentas.selecionadas)}
                                {orcamento.ferramentas.quais && (
                                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                        <strong>Especificação:</strong> {orcamento.ferramentas.quais}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Restrições */}
                    {orcamento.restricoes && (
                        <div className="orcamento-info-section">
                            <h3 className="orcamento-section-title">Restrições e Cuidados</h3>
                            <div className="orcamento-description-box">
                                <p style={{ margin: 0 }}>{orcamento.restricoes}</p>
                            </div>
                        </div>
                    )}

                    {/* Observações */}
                    {orcamento.observacoes && orcamento.observacoes.toLowerCase() !== 'não' && (
                        <div className="orcamento-info-section">
                            <h3 className="orcamento-section-title">Observações</h3>
                            <div className="orcamento-description-box">
                                <p style={{ margin: 0 }}>{orcamento.observacoes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
