import React, { useState, useEffect } from 'react';
import NovoProjetoWizard from '../components/modals/NovoProjetoWizard';
import OrcamentoDetalhesModal from '../components/modals/OrcamentoDetalhesModal';
import ConfirmarReuniaoModal from '../components/modals/ConfirmarReuniaoModal';
import { LISTAR_PROJETOS_WEBHOOK } from '../services/webhookUrls';

// Mapeamento de status do BD para os títulos do Kanban de Orçamentos
// Nota: "Aprovados" e "Finalizados" são determinados por production_permission, não por status
const STATUS_MAP_ORCAMENTOS = {
    'new': 'Solicitados',
    'requested': 'Solicitados',
    'waiting_scheduled': 'Aguardando Confirmação',
    'meeting_scheduled': 'Reunião Agendada'
};

const ORCAMENTO_COLUMNS = [
    'Solicitados',
    'Aguardando Confirmação',
    'Reunião Agendada',
    'Aprovados',
    'Finalizados'
];

export default function OrcamentosPage() {
    const [orcamentos, setOrcamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showWizard, setShowWizard] = useState(false);
    const [selectedOrcamento, setSelectedOrcamento] = useState(null);
    const [orcamentoParaConfirmar, setOrcamentoParaConfirmar] = useState(null);

    const fetchOrcamentos = async () => {
        const organization = localStorage.getItem('garagem_projetos_organization');

        if (!organization) {
            window.location.href = '/login';
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(LISTAR_PROJETOS_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organization }),
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const result = await response.json();

            let items = [];
            if (Array.isArray(result)) {
                items = result;
            } else if (result.data && Array.isArray(result.data)) {
                items = result.data;
            }

            setOrcamentos(items);

        } catch (err) {
            console.error('❌ Erro ao buscar orçamentos:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrcamentos();
    }, []);

    // Refresh automático quando a aba ficar visível novamente
    useEffect(() => {
        const handleVisibilityChange = () => {
            // Só atualiza se a aba ficar visível E não houver modal/wizard aberto
            const hasOpenModal = showWizard || selectedOrcamento || orcamentoParaConfirmar;
            if (document.visibilityState === 'visible' && !hasOpenModal) {
                console.log('👁️ Aba visível - atualizando orçamentos...');
                fetchOrcamentos();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [showWizard, selectedOrcamento, orcamentoParaConfirmar]);

    // Função para determinar a coluna do orçamento
    // - Finalizados: aproved_status === true OU (production_permission === true E status === 'done')
    // - Aprovados: production_permission === true (e status !== 'done' e não entregue)
    // - Aguardando Confirmação: status === 'waiting_scheduled'
    // - Demais: usa o mapeamento de status
    const getOrcamentoColumn = (item) => {
        // Se aproved_status === true, projeto está entregue (Finalizados)
        if (item.aproved_status === true) {
            return 'Finalizados';
        }
        if (item.production_permission === true) {
            if (item.status === 'done') {
                return 'Finalizados';
            }
            return 'Aprovados';
        }
        return STATUS_MAP_ORCAMENTOS[item.status] || 'Solicitados';
    };

    // Handler para clicar em um card
    const handleCardClick = (orcamento) => {
        // Se tem datas propostas e está aguardando confirmação, abre modal de confirmação
        if (orcamento.status === 'waiting_scheduled' && orcamento.proposed_schedule?.length > 0) {
            setOrcamentoParaConfirmar(orcamento);
        } else {
            setSelectedOrcamento(orcamento);
        }
    };

    // Callback de sucesso na confirmação
    const handleConfirmacaoSucesso = () => {
        fetchOrcamentos(); // Recarregar lista
    };

    if (loading) {
        return (
            <div className="loading-state">
                Carregando Orçamentos...
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                Erro ao carregar orçamentos: {error}
            </div>
        );
    }

    return (
        <div className="kanban-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="kanban-titulo" style={{ marginBottom: 0 }}>Orçamentos</h1>
                <button
                    className="btn-primary"
                    onClick={() => setShowWizard(true)}
                    style={{
                        background: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: '1px solid var(--garagem-magenta)',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'var(--fonte-corpo)',
                        textTransform: 'capitalize'
                    }}
                >
                    + Solicitar Novo Projeto
                </button>
            </div>

            <div className="kanban-container" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {ORCAMENTO_COLUMNS.map(columnTitle => (
                    <div key={columnTitle} className="kanban-coluna">
                        <div className="kanban-coluna-header">
                            <h2>{columnTitle}</h2>
                        </div>

                        <div className="kanban-coluna-body">
                            {orcamentos
                                .filter(o => getOrcamentoColumn(o) === columnTitle)
                                .map(o => {
                                    // Lidar com description que pode ser string ou array
                                    const descricaoTexto = typeof o.description === 'string'
                                        ? o.description.replace(/^"|"$/g, '').substring(0, 100)
                                        : (o.description && o.description[0])
                                            ? (o.description[0].idea || o.description[0].title || '').substring(0, 100)
                                            : '';

                                    // Indicador de datas propostas
                                    const temDatasPropostas = o.status === 'waiting_scheduled' && o.proposed_schedule?.length > 0;

                                    return (
                                        <div
                                            key={o.id}
                                            className={`projeto-card ${temDatasPropostas ? 'card-acao-pendente' : ''}`}
                                            onClick={() => handleCardClick(o)}
                                        >
                                            <h3 className="projeto-card-titulo">{o.title}</h3>
                                            {descricaoTexto && (
                                                <p className="projeto-card-descricao">
                                                    {descricaoTexto}{descricaoTexto.length >= 100 ? '...' : ''}
                                                </p>
                                            )}
                                            {temDatasPropostas && (
                                                <div className="card-badge-acao">
                                                    📅 {o.proposed_schedule.length} data(s) proposta(s)
                                                </div>
                                            )}
                                            <div className="projeto-card-meta">
                                                {o.create_by && <span>{o.create_by} • </span>}
                                                {new Date(o.created_at).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                    );
                                })}

                            {orcamentos.filter(o => getOrcamentoColumn(o) === columnTitle).length === 0 && (
                                <p className="kanban-vazio">Nenhum orçamento</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showWizard && (
                <NovoProjetoWizard onClose={() => setShowWizard(false)} />
            )}

            {selectedOrcamento && (
                <OrcamentoDetalhesModal
                    orcamento={selectedOrcamento}
                    onClose={() => setSelectedOrcamento(null)}
                />
            )}

            {orcamentoParaConfirmar && (
                <ConfirmarReuniaoModal
                    orcamento={orcamentoParaConfirmar}
                    onClose={() => setOrcamentoParaConfirmar(null)}
                    onSuccess={handleConfirmacaoSucesso}
                />
            )}
        </div>
    );
}
