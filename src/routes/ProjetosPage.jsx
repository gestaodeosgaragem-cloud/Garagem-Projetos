import React, { useState, useEffect } from 'react';
import ProjetoDetalhesModal from '../components/modals/ProjetoDetalhesModal';
import ProjetoEntregueModal from '../components/modals/ProjetoEntregueModal';
import { LISTAR_PROJETOS_WEBHOOK } from '../services/webhookUrls';

// Mapeamento de status do BD para os títulos do Kanban
const STATUS_MAP = {
    'waiting': 'Em espera',
    'waiting_client': 'Aguardando Cliente',
    'in_development': 'Desenvolvimento',
    'waiting_approval': 'Aguardando aprovação',
    'done': 'Concluído'
};

const KANBAN_COLUMNS = [
    'Em espera',
    'Aguardando Cliente',
    'Desenvolvimento',
    'Aguardando aprovação',
    'Concluído'
];

export default function ProjetosPage() {
    const [projetos, setProjetos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProjeto, setSelectedProjeto] = useState(null);
    const [alertExpanded, setAlertExpanded] = useState(true);

    const fetchProjetos = async () => {
        // Tenta organization_id primeiro, depois fallback para organization name
        let organizationId = localStorage.getItem('organization_id');
        const organizationName = localStorage.getItem('garagem_projetos_organization');

        // Se não tiver nem ID nem nome, redireciona para login
        if (!organizationId && !organizationName) {
            window.location.href = '/login';
            return;
        }

        try {
            // Monta payload: usa organization_id se disponível, senão usa organization
            const payload = organizationId
                ? { organization_id: organizationId }
                : { organization: organizationName };

            const response = await fetch(LISTAR_PROJETOS_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
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

            // Projetos são itens com production_permission = true
            // O status já vem calculado do n8n
            const projetosAprovados = items.filter(item => item.production_permission === true);

            setProjetos(projetosAprovados);
            console.log('🔄 Projetos carregados:', projetosAprovados.length);

        } catch (err) {
            console.error('❌ Erro ao buscar projetos:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch inicial
    useEffect(() => {
        fetchProjetos();
    }, []);

    // Refresh automático quando a aba ficar visível novamente
    useEffect(() => {
        const handleVisibilityChange = () => {
            // Só atualiza se a aba ficar visível E não houver modal aberto
            if (document.visibilityState === 'visible' && !selectedProjeto) {
                console.log('👁️ Aba visível - atualizando projetos...');
                fetchProjetos();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [selectedProjeto]);

    const getKanbanStatus = (projeto) => {
        // Se projeto está entregue (aproved_status === true), vai para Concluído
        if (projeto.aproved_status === true) {
            return 'Concluído';
        }
        return STATUS_MAP[projeto.status] || 'Em espera';
    };

    // Função para determinar se o card deve ter estilo de alerta
    // Cards com status waiting_client sempre recebem alert-card
    const getCardClassName = (projeto) => {
        if (projeto.status === 'waiting_client') {
            return 'projeto-card alert-card';
        }
        return 'projeto-card';
    };

    // Projetos que precisam de atenção (status = waiting_client)
    const projetosAguardando = projetos.filter(p => p.status === 'waiting_client');

    if (loading) {
        return (
            <div className="loading-state">
                Carregando Kanban...
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                Erro ao carregar projetos: {error}
            </div>
        );
    }

    return (
        <div className="kanban-page">
            <h1 className="kanban-titulo">Tela de Projetos</h1>

            <div className="kanban-container">
                {KANBAN_COLUMNS.map(columnTitle => (
                    <div key={columnTitle} className="kanban-coluna">
                        <div className="kanban-coluna-header">
                            <h2>{columnTitle}</h2>
                        </div>

                        <div className="kanban-coluna-body">
                            {projetos
                                .filter(p => getKanbanStatus(p) === columnTitle)
                                .map(p => (
                                    <div
                                        key={p.id}
                                        className={getCardClassName(p)}
                                        onClick={() => setSelectedProjeto(p)}
                                    >
                                        <h3 className="projeto-card-titulo">{p.title}</h3>
                                        {p.description && p.description[0] && (
                                            <p className="projeto-card-descricao">
                                                {p.description[0].idea || p.description[0].title}
                                            </p>
                                        )}
                                        <div className="projeto-card-meta">
                                            Criado: {new Date(p.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                ))}

                            {projetos.filter(p => getKanbanStatus(p) === columnTitle).length === 0 && (
                                <p className="kanban-vazio">Nenhum projeto</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Alert - só aparece se houver projetos em waiting_client */}
            {projetosAguardando.length > 0 && (
                alertExpanded ? (
                    <div className="floating-alert-expanded">
                        <div className="floating-alert-header">
                            <h3 className="floating-alert-title">
                                Estes projetos precisam da sua atenção!
                            </h3>
                            <button
                                className="floating-alert-collapse"
                                onClick={() => setAlertExpanded(false)}
                            >
                                −
                            </button>
                        </div>
                        <div className="floating-alert-list">
                            {projetosAguardando.map(p => (
                                <div
                                    key={p.id}
                                    className="floating-alert-item"
                                    onClick={() => setSelectedProjeto(p)}
                                >
                                    <span className="floating-alert-item-title">{p.title}</span>
                                    <span className="floating-alert-item-action">Verificar &gt;</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <button
                        className="floating-alert-icon"
                        onClick={() => setAlertExpanded(true)}
                    >
                        !
                    </button>
                )
            )}

            {selectedProjeto && (
                selectedProjeto.aproved_status === true ? (
                    <ProjetoEntregueModal
                        projeto={selectedProjeto}
                        onClose={() => setSelectedProjeto(null)}
                    />
                ) : (
                    <ProjetoDetalhesModal
                        projeto={selectedProjeto}
                        onClose={() => setSelectedProjeto(null)}
                    />
                )
            )}
        </div>
    );
}
