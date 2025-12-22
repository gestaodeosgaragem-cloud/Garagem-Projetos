import React, { useState, useEffect } from 'react';
import { listarEtapasProjeto, buscarSLAs, enviarSLA } from '../../services/webhooksN8n';
import TermosSLAModal from './TermosSLAModal';

// Ícones SVG inline
const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
);

/**
 * Modal para projetos entregues (approved_status === true)
 * Possui 3 abas: Detalhes, Escopo, SLA
 * USA CLASSES ÚNICAS COM PREFIXO "pe-" (projeto-entregue)
 */
export default function ProjetoEntregueModal({ projeto, onClose }) {
    const [activeTab, setActiveTab] = useState('detalhes');
    const [etapas, setEtapas] = useState([]);
    const [loadingEtapas, setLoadingEtapas] = useState(false);
    const [slaItems, setSlaItems] = useState([]);
    const [loadingSLAs, setLoadingSLAs] = useState(false);
    const [enviandoSLA, setEnviandoSLA] = useState(false);

    const [novoSLA, setNovoSLA] = useState({ funcao: '', mensagem: '' });
    const [pendingSLAs, setPendingSLAs] = useState([]);
    const [feedbackModal, setFeedbackModal] = useState({ show: false, type: '', message: '' });
    const [showTermosSLA, setShowTermosSLA] = useState(false);

    useEffect(() => {
        if (activeTab === 'escopo' && projeto?.id && etapas.length === 0) {
            carregarEtapas();
        }
    }, [activeTab, projeto?.id]);

    useEffect(() => {
        if (activeTab === 'sla' && projeto?.id) {
            carregarSLAs();
        }
    }, [activeTab, projeto?.id]);

    const carregarEtapas = async () => {
        setLoadingEtapas(true);
        try {
            const response = await listarEtapasProjeto(projeto.id);
            if (response.success && Array.isArray(response.data)) {
                setEtapas(response.data);
            }
        } catch (err) {
            console.error('Erro ao carregar etapas:', err);
        } finally {
            setLoadingEtapas(false);
        }
    };

    const carregarSLAs = async () => {
        setLoadingSLAs(true);
        try {
            const response = await buscarSLAs(projeto.id);
            if (response.success && Array.isArray(response.data)) {
                setSlaItems(response.data);
            }
        } catch (err) {
            console.error('Erro ao carregar SLAs:', err);
        } finally {
            setLoadingSLAs(false);
        }
    };

    const handleAddPendingSLA = () => {
        if (!novoSLA.funcao.trim() || !novoSLA.mensagem.trim()) {
            setFeedbackModal({ show: true, type: 'warning', message: 'Preencha o nome da função e a descrição do erro.' });
            return;
        }
        setPendingSLAs([...pendingSLAs, { ...novoSLA }]);
        setNovoSLA({ funcao: '', mensagem: '' });
    };

    const handleRemovePendingSLA = (index) => {
        setPendingSLAs(pendingSLAs.filter((_, i) => i !== index));
    };

    const handleEnviarSLAs = async () => {
        if (pendingSLAs.length === 0) {
            setFeedbackModal({ show: true, type: 'warning', message: 'Adicione pelo menos um item de SLA antes de enviar.' });
            return;
        }

        setEnviandoSLA(true);
        try {
            const payload = {
                id_project: projeto.id,
                sla_items: pendingSLAs.map(item => ({
                    sla_function: item.funcao,
                    sla_text: item.mensagem
                }))
            };

            const response = await enviarSLA(payload);
            if (response.success) {
                setFeedbackModal({ show: true, type: 'success', message: 'SLA(s) enviado(s) com sucesso!' });
                setPendingSLAs([]);
                carregarSLAs();
            } else {
                throw new Error(response.error || 'Erro ao enviar SLA');
            }
        } catch (err) {
            console.error('Erro ao enviar SLA:', err);
            setFeedbackModal({ show: true, type: 'error', message: 'Erro ao enviar SLA. Tente novamente.' });
        } finally {
            setEnviandoSLA(false);
        }
    };

    const agruparEtapasPorStatus = () => {
        const grupos = {};
        etapas.forEach(etapa => {
            const status = etapa.status || 'sem_status';
            if (!grupos[status]) grupos[status] = [];
            grupos[status].push(etapa);
        });
        return grupos;
    };

    const formatarData = (dataISO) => {
        if (!dataISO) return '-';
        try {
            return new Date(dataISO).toLocaleDateString('pt-BR');
        } catch {
            return dataISO;
        }
    };

    if (!projeto) return null;

    const etapasAgrupadas = agruparEtapasPorStatus();

    return (
        <>
            <div className="pe-overlay" onClick={onClose}>
                <div className="pe-modal" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="pe-header">
                        <div className="pe-header-info">
                            <h2 className="pe-title">{projeto.titulo || projeto.title || projeto.name || 'Projeto'}</h2>
                            <span className="pe-badge">Projeto Entregue</span>
                        </div>
                        <button className="pe-close" onClick={onClose}>
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="pe-tabs">
                        <button
                            className={`pe-tab ${activeTab === 'detalhes' ? 'pe-tab-active' : ''}`}
                            onClick={() => setActiveTab('detalhes')}
                        >
                            Detalhes
                        </button>
                        <button
                            className={`pe-tab ${activeTab === 'escopo' ? 'pe-tab-active' : ''}`}
                            onClick={() => setActiveTab('escopo')}
                        >
                            Escopo
                        </button>
                        <button
                            className={`pe-tab ${activeTab === 'sla' ? 'pe-tab-active' : ''}`}
                            onClick={() => setActiveTab('sla')}
                        >
                            SLA
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="pe-content">
                        {/* === ABA DETALHES === */}
                        {activeTab === 'detalhes' && (
                            <div className="pe-detalhes">
                                {/* Meta Info */}
                                <div className="pe-meta-grid">
                                    <div className="pe-meta-item">
                                        <span className="pe-label">Status</span>
                                        <span className="pe-badge">Projeto Entregue</span>
                                    </div>
                                    <div className="pe-meta-item">
                                        <span className="pe-label">Criado em</span>
                                        <span className="pe-value">{formatarData(projeto.created_at)}</span>
                                    </div>
                                </div>

                                {/* Solicitante */}
                                {projeto.create_by && (
                                    <div className="pe-meta-item">
                                        <span className="pe-label">Solicitante</span>
                                        <span className="pe-value">{projeto.create_by}</span>
                                    </div>
                                )}

                                {/* Descrição Geral */}
                                {projeto.description && (
                                    <div className="pe-section">
                                        <h4 className="pe-section-title">Descrição Geral</h4>
                                        <div className="pe-section-box">
                                            <p className="pe-section-text">
                                                {typeof projeto.description === 'string'
                                                    ? projeto.description.replace(/^"|"$/g, '')
                                                    : JSON.stringify(projeto.description)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Objetivo Principal */}
                                {(projeto.objetivo_principal || projeto.objetivo) && (
                                    <div className="pe-section">
                                        <h4 className="pe-section-title">Objetivo Principal</h4>
                                        <div className="pe-section-box">
                                            <p className="pe-section-text">{projeto.objetivo_principal || projeto.objetivo}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Situação Atual */}
                                {projeto.situacao_atual && (
                                    <div className="pe-section">
                                        <h4 className="pe-section-title">Situação Atual</h4>
                                        <div className="pe-section-box">
                                            <p className="pe-section-text">{projeto.situacao_atual}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Entradas de Informação */}
                                {projeto.entradas && (
                                    <div className="pe-section">
                                        <h4 className="pe-section-title">Entradas de Informação</h4>
                                        <div className="pe-section-box">
                                            {Array.isArray(projeto.entradas?.tipos) ? (
                                                <ul className="pe-list">
                                                    {projeto.entradas.tipos.map((item, idx) => <li key={idx}>{item}</li>)}
                                                </ul>
                                            ) : (
                                                <p className="pe-section-text">{JSON.stringify(projeto.entradas)}</p>
                                            )}
                                            {projeto.entradas?.exemplo && (
                                                <div className="pe-subsection">
                                                    <strong>Exemplo:</strong> {projeto.entradas.exemplo}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Saídas Esperadas */}
                                {projeto.saidas && (
                                    <div className="pe-section">
                                        <h4 className="pe-section-title">Saídas Esperadas</h4>
                                        <div className="pe-section-box">
                                            {Array.isArray(projeto.saidas?.tipos) ? (
                                                <ul className="pe-list">
                                                    {projeto.saidas.tipos.map((item, idx) => <li key={idx}>{item}</li>)}
                                                </ul>
                                            ) : (
                                                <p className="pe-section-text">{JSON.stringify(projeto.saidas)}</p>
                                            )}
                                            {projeto.saidas?.formato && (
                                                <div className="pe-subsection">
                                                    <strong>Formato:</strong> {projeto.saidas.formato}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Critério de Sucesso */}
                                {projeto.criterio_sucesso && (
                                    <div className="pe-section">
                                        <h4 className="pe-section-title">Critério de Sucesso</h4>
                                        <div className="pe-section-box">
                                            <p className="pe-section-text">{projeto.criterio_sucesso}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Ferramentas */}
                                {projeto.ferramentas && (
                                    <div className="pe-section">
                                        <h4 className="pe-section-title">Ferramentas e Sistemas</h4>
                                        <div className="pe-section-box">
                                            {Array.isArray(projeto.ferramentas?.selecionadas) ? (
                                                <ul className="pe-list">
                                                    {projeto.ferramentas.selecionadas.map((item, idx) => <li key={idx}>{item}</li>)}
                                                </ul>
                                            ) : (
                                                <p className="pe-section-text">{JSON.stringify(projeto.ferramentas)}</p>
                                            )}
                                            {projeto.ferramentas?.quais && (
                                                <div className="pe-subsection">
                                                    <strong>Especificação:</strong> {projeto.ferramentas.quais}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Restrições */}
                                {projeto.restricoes && (
                                    <div className="pe-section">
                                        <h4 className="pe-section-title">Restrições e Cuidados</h4>
                                        <div className="pe-section-box">
                                            <p className="pe-section-text">{projeto.restricoes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Observações */}
                                {projeto.observacoes && projeto.observacoes.toLowerCase() !== 'não' && (
                                    <div className="pe-section">
                                        <h4 className="pe-section-title">Observações</h4>
                                        <div className="pe-section-box">
                                            <p className="pe-section-text">{projeto.observacoes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* === ABA ESCOPO === */}
                        {activeTab === 'escopo' && (
                            <div className="pe-escopo">
                                {loadingEtapas ? (
                                    <div className="pe-loading">Carregando etapas...</div>
                                ) : etapas.length === 0 ? (
                                    <div className="pe-empty">Nenhuma etapa encontrada.</div>
                                ) : (
                                    <div className="pe-grupos">
                                        {Object.entries(etapasAgrupadas).map(([status, lista]) => (
                                            <div key={status} className="pe-grupo">
                                                <h4 className="pe-grupo-header">
                                                    {status === 'done' ? 'Concluídas' :
                                                        status === 'in_progress' ? 'Em Progresso' :
                                                            status === 'paused' ? 'Pausadas' : status}
                                                    <span className="pe-grupo-count">({lista.length})</span>
                                                </h4>
                                                <div className="pe-lista">
                                                    {lista.map((etapa, index) => (
                                                        <div key={etapa.id || index} className="pe-etapa">
                                                            <div className="pe-etapa-header">
                                                                <CheckIcon />
                                                                <strong>{etapa.titulo || etapa.title}</strong>
                                                            </div>
                                                            {etapa.resumo && (
                                                                <p className="pe-etapa-resumo">{etapa.resumo}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* === ABA SLA === */}
                        {activeTab === 'sla' && (
                            <div className="pe-sla">
                                {/* Link Termos de SLA */}
                                <a href="#" className="pe-sla-link" onClick={(e) => { e.preventDefault(); setShowTermosSLA(true); }}>
                                    📋 Termos de SLA
                                </a>

                                {/* Formulário de Reportar Erro */}
                                <div className="pe-sla-form-section">
                                    <h4 className="pe-sla-section-title">Reportar Erro</h4>

                                    <div className="pe-sla-form">
                                        <input
                                            type="text"
                                            placeholder="Nome da função"
                                            value={novoSLA.funcao}
                                            onChange={(e) => setNovoSLA({ ...novoSLA, funcao: e.target.value })}
                                            className="pe-sla-input"
                                        />
                                        <textarea
                                            placeholder="Descreva o erro encontrado"
                                            value={novoSLA.mensagem}
                                            onChange={(e) => setNovoSLA({ ...novoSLA, mensagem: e.target.value })}
                                            className="pe-sla-textarea"
                                            rows={3}
                                        />
                                        <button className="pe-sla-add-btn" onClick={handleAddPendingSLA}>
                                            <PlusIcon /> Adicionar
                                        </button>
                                    </div>

                                    {pendingSLAs.length > 0 && (
                                        <div className="pe-sla-pending">
                                            <h5 className="pe-sla-pending-title">Itens a enviar ({pendingSLAs.length}):</h5>
                                            {pendingSLAs.map((item, index) => (
                                                <div key={index} className="pe-sla-pending-item">
                                                    <div className="pe-sla-pending-info">
                                                        <strong>{item.funcao}</strong>
                                                        <span>{item.mensagem}</span>
                                                    </div>
                                                    <button className="pe-sla-remove-btn" onClick={() => handleRemovePendingSLA(index)}>
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            ))}
                                            <button className="pe-sla-enviar-btn" onClick={handleEnviarSLAs} disabled={enviandoSLA}>
                                                {enviandoSLA ? 'Enviando...' : `Enviar (${pendingSLAs.length})`}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Histórico de SLAs */}
                                <div className="pe-sla-historico">
                                    <h4 className="pe-sla-section-title">Histórico de SLAs</h4>
                                    {loadingSLAs ? (
                                        <div className="pe-loading">Carregando SLAs...</div>
                                    ) : slaItems.length === 0 ? (
                                        <div className="pe-empty">Nenhum SLA registrado.</div>
                                    ) : (
                                        <div className="pe-sla-lista">
                                            {slaItems.map((sla, index) => {
                                                // Determinar status do SLA
                                                const isAnalyzed = sla.scope !== null && sla.scope !== undefined;
                                                const isAnswered = sla.answered !== null && sla.answered !== undefined;
                                                const isInScope = sla.scope === true;

                                                return (
                                                    <div
                                                        key={sla.id || index}
                                                        className="pe-sla-item"
                                                        style={{
                                                            borderLeft: isAnswered
                                                                ? (isInScope ? '4px solid #22c55e' : '4px solid #ef4444')
                                                                : (isAnalyzed ? '4px solid #eab308' : '4px solid var(--garagem-magenta)')
                                                        }}
                                                    >
                                                        <div className="pe-sla-item-header">
                                                            <strong>{sla.sla_function || sla.funcao}</strong>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                {/* Badge de status */}
                                                                {isAnswered ? (
                                                                    <span style={{
                                                                        fontSize: '0.7rem',
                                                                        padding: '0.2rem 0.5rem',
                                                                        borderRadius: '4px',
                                                                        background: isInScope ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                                        color: isInScope ? '#22c55e' : '#ef4444'
                                                                    }}>
                                                                        {isInScope ? '✓ No Escopo' : '✗ Fora do Escopo'}
                                                                    </span>
                                                                ) : isAnalyzed ? (
                                                                    <span style={{
                                                                        fontSize: '0.7rem',
                                                                        padding: '0.2rem 0.5rem',
                                                                        borderRadius: '4px',
                                                                        background: 'rgba(234, 179, 8, 0.2)',
                                                                        color: '#eab308'
                                                                    }}>
                                                                        ⏳ Aguardando
                                                                    </span>
                                                                ) : (
                                                                    <span style={{
                                                                        fontSize: '0.7rem',
                                                                        padding: '0.2rem 0.5rem',
                                                                        borderRadius: '4px',
                                                                        background: 'rgba(156, 163, 175, 0.2)',
                                                                        color: '#9ca3af'
                                                                    }}>
                                                                        Analisando...
                                                                    </span>
                                                                )}
                                                                {sla.created_at && <span className="pe-sla-item-date">{formatarData(sla.created_at)}</span>}
                                                            </div>
                                                        </div>
                                                        <p className="pe-sla-item-msg">{sla.sla_text || sla.mensagem}</p>

                                                        {/* Resposta do admin (quando answered não é null) */}
                                                        {isAnswered && (
                                                            <div style={{
                                                                marginTop: '0.75rem',
                                                                padding: '0.75rem',
                                                                borderRadius: '8px',
                                                                background: isInScope ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                border: isInScope ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                                                            }}>
                                                                <span style={{
                                                                    fontSize: '0.75rem',
                                                                    color: 'var(--garagem-branco-muted)',
                                                                    display: 'block',
                                                                    marginBottom: '0.25rem'
                                                                }}>
                                                                    Resposta da Garagem:
                                                                </span>
                                                                <p style={{
                                                                    margin: 0,
                                                                    fontSize: '0.85rem',
                                                                    color: 'rgba(255,255,255,0.9)'
                                                                }}>
                                                                    {sla.answered}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Feedback Modal */}
                    {feedbackModal.show && (
                        <div className="pe-feedback-overlay" onClick={() => setFeedbackModal({ show: false, type: '', message: '' })}>
                            <div className="pe-feedback-box" onClick={(e) => e.stopPropagation()}>
                                <div className={`pe-feedback-icon pe-feedback-${feedbackModal.type}`}>
                                    {feedbackModal.type === 'success' && '✓'}
                                    {feedbackModal.type === 'error' && '✕'}
                                    {feedbackModal.type === 'warning' && '⚠'}
                                </div>
                                <p className="pe-feedback-msg">{feedbackModal.message}</p>
                                <button className={`pe-feedback-btn pe-feedback-${feedbackModal.type}`} onClick={() => setFeedbackModal({ show: false, type: '', message: '' })}>
                                    OK
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Termos de SLA */}
            {
                showTermosSLA && (
                    <TermosSLAModal onClose={() => setShowTermosSLA(false)} />
                )
            }
        </>
    );
}
