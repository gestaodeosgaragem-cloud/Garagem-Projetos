/**
 * webhooksN8n.jsx
 * Centraliza todas as chamadas para o n8n.
 * 
 * REGRAS:
 * 1. Não usar Supabase diretamente.
 * 2. Retornar sempre { success: boolean, data: any, error: string }.
 * 3. Tratar falhas de fetch e json parse.
 */

import {
    LISTAR_PROJETOS_WEBHOOK,
    LISTAR_ORCAMENTOS_WEBHOOK,
    CRIAR_PROJETO_ORCAMENTO_WEBHOOK,
    ATUALIZAR_STATUS_PROJETO_WEBHOOK,
    LISTAR_ETAPAS_PROJETO_WEBHOOK,
    RESPONDER_PAUSA_WEBHOOK,
    CONFIRMAR_ENTREGA_WEBHOOK,
    LISTAR_COLABORADORES_WEBHOOK,
    ENVIAR_SLA_WEBHOOK,
    BUSCAR_SLA_WEBHOOK
} from './webhookUrls';

// Objeto interno para facilitar o uso no mock (ou poderíamos usar as vars direto)
const WEBHOOK_URLS = {
    LISTAR_PROJETOS: LISTAR_PROJETOS_WEBHOOK,
    LISTAR_ORCAMENTOS: LISTAR_ORCAMENTOS_WEBHOOK,
    CRIAR_PROJETO_ORCAMENTO: CRIAR_PROJETO_ORCAMENTO_WEBHOOK,
    ATUALIZAR_STATUS_PROJETO: ATUALIZAR_STATUS_PROJETO_WEBHOOK
};

const safeFetch = async (url, options = {}) => {
    if (!url) {
        console.warn('⚠️ [webhooksN8n] URL não configurada.');
        return { success: false, data: null, error: 'URL do webhook não configurada.' };
    }

    try {
        const response = await fetch(url, options);
        const json = await response.json();

        // Espera-se que o n8n retorne { success, data, error }
        // Caso retorne direto o payload, tentamos adaptar
        if (json.success === undefined && json.data === undefined) {
            return { success: true, data: json, error: null };
        }

        return json;
    } catch (err) {
        console.error(`❌ [webhooksN8n] Erro ao chamar ${url}:`, err);
        return { success: false, data: null, error: err.message || 'Erro de conexão' };
    }
};

export const listarProjetos = async () => {
    console.log('📡 [webhooksN8n] Buscando projetos...');
    // MOCK TEMPORÁRIO ENQUANTO NÃO TEM URL
    if (!WEBHOOK_URLS.LISTAR_PROJETOS) {
        return {
            success: true,
            data: [
                { id: 1, nome_projeto: 'App Delivery', cliente_nome: 'Restaurante X', status_kanban: 'Desenvolvimento', data_previsao_entrega: '2025-12-20' },
                { id: 2, nome_projeto: 'Site Institucional', cliente_nome: 'Advocacia Y', status_kanban: 'Aguardando Aprovação', data_previsao_entrega: '2025-12-15' },
                { id: 3, nome_projeto: 'Automação N8N', cliente_nome: 'Logística Z', status_kanban: 'Em espera', data_previsao_entrega: '2026-01-10' }
            ]
        };
    }
    return safeFetch(WEBHOOK_URLS.LISTAR_PROJETOS);
};

export const listarOrcamentos = async () => {
    console.log('📡 [webhooksN8n] Buscando orçamentos...');
    // MOCK TEMPORÁRIO
    if (!WEBHOOK_URLS.LISTAR_ORCAMENTOS) {
        return {
            success: true,
            data: [
                { id: 101, cliente_nome: 'Banco do Brasil', descricao_curta: 'Landing Page Campanha', situacao_orcamento: 'Solicitados', valor_total: null },
                { id: 102, cliente_nome: 'Padaria Central', descricao_curta: 'Sistema de Estoque', situacao_orcamento: 'Reunião Agendada', valor_total: null },
                { id: 103, cliente_nome: 'Startup Tech', descricao_curta: 'App MVP', situacao_orcamento: 'Aprovados', valor_total: 'R$ 15.000,00' }
            ]
        };
    }
    return safeFetch(WEBHOOK_URLS.LISTAR_ORCAMENTOS);
};

export const criarProjetoOrcamento = async (payload) => {
    console.log('📡 [webhooksN8n] Criando solicitação:', payload);
    return safeFetch(WEBHOOK_URLS.CRIAR_PROJETO_ORCAMENTO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
};

export const atualizarStatusProjeto = async (id, novoStatus) => {
    console.log('📡 [webhooksN8n] Atualizando status:', { id, novoStatus });
    return safeFetch(WEBHOOK_URLS.ATUALIZAR_STATUS_PROJETO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status_kanban: novoStatus })
    });
};

/**
 * Lista as etapas (cards) de um projeto específico
 * @param {number} projectId - ID do projeto
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export const listarEtapasProjeto = async (projectId) => {
    console.log('📡 [webhooksN8n] Buscando etapas do projeto:', projectId);
    return safeFetch(LISTAR_ETAPAS_PROJETO_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId })
    });
};

/**
 * Responde a uma pausa de etapa (card)
 * @param {Object} payload - { card_id, answered, date_answered }
 * @returns {Promise<{success: boolean, data: any, error: string|null}>}
 */
export const responderPausaEtapa = async (payload) => {
    console.log('📡 [webhooksN8n] Respondendo pausa:', payload);
    return safeFetch(RESPONDER_PAUSA_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
};

/**
 * Confirma a data de entrega do projeto e envia convites
 * @param {Object} payload - { projeto_id, data_confirmada, email_cliente, emails_convidados }
 * @returns {Promise<{success: boolean, data: any, error: string|null}>}
 */
export const confirmarEntregaProjeto = async (payload) => {
    console.log('📡 [webhooksN8n] Confirmando entrega:', payload);
    return safeFetch(CONFIRMAR_ENTREGA_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
};

/**
 * Lista os colaboradores de uma organização
 * @param {string} organizationId - ID da organização
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export const listarColaboradores = async (organizationId) => {
    console.log('📡 [webhooksN8n] Buscando colaboradores da organização:', organizationId);
    return safeFetch(LISTAR_COLABORADORES_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_organization: organizationId })
    });
};

/**
 * Envia itens de SLA para um projeto
 * @param {Object} payload - { projeto_id, sla_items: [{ funcao, mensagem }] }
 * @returns {Promise<{success: boolean, data: any, error: string|null}>}
 */
export const enviarSLA = async (payload) => {
    console.log('📡 [webhooksN8n] Enviando SLA:', payload);
    return safeFetch(ENVIAR_SLA_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
};

/**
 * Busca SLAs de um projeto
 * @param {number} projetoId - ID do projeto
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export const buscarSLAs = async (projetoId) => {
    console.log('📡 [webhooksN8n] Buscando SLAs do projeto:', projetoId);
    return safeFetch(BUSCAR_SLA_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projeto_id: projetoId })
    });
};
