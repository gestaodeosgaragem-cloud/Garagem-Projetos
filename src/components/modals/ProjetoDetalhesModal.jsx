import React, { useState, useEffect, useMemo, useRef } from 'react';
import { listarEtapasProjeto, responderPausaEtapa, confirmarEntregaProjeto, listarColaboradores } from '../../services/webhooksN8n';

// Ícones SVG inline (outline branco)
const IconFileText = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
    </svg>
);

const IconSettings = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const IconClock = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
    </svg>
);

const IconClose = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IconPause = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
    </svg>
);

const IconChevronDown = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6,9 12,15 18,9" />
    </svg>
);

const IconChevronRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9,6 15,12 9,18" />
    </svg>
);

// Mapeamento de status
const STATUS_DISPLAY_MAP = {
    'waiting': 'Em espera',
    'waiting_client': 'Aguardando Cliente',
    'in_development': 'Desenvolvimento',
    'waiting_approval': 'Aguardando Aprovação',
    'done': 'Concluído',
    'disponivel': 'Pendente',
    'em_andamento': 'Produzindo',
    'em_producao': 'Em Produção',
    'pausado': 'Pausado',
    'concluido': 'Concluído',
    'aprovado': 'Aprovado',
    'os_concluida': 'Etapa Concluída'
};

// Grupos de status para agrupamento
const STATUS_GROUPS = {
    desenvolvimento: {
        label: 'Etapas em Desenvolvimento',
        icon: '⚙️',
        statuses: ['em_andamento', 'produzindo', 'em_producao', 'waiting_approval', 'in_development'],
        defaultOpen: true
    },
    pausado: {
        label: 'Etapas Pausadas',
        icon: '⏸️',
        statuses: ['pausado'],
        defaultOpen: true
    },
    espera: {
        label: 'Etapas em Espera',
        icon: '⏳',
        statuses: ['waiting', 'waiting_client', 'disponivel', 'pendente'],
        defaultOpen: true
    },
    concluido: {
        label: 'Etapas Concluídas',
        icon: '✅',
        statuses: ['concluido', 'aprovado', 'os_concluida', 'done'],
        defaultOpen: false
    }
};

const getStatusDisplayName = (status) => STATUS_DISPLAY_MAP[status] || status;

// Calcula dias restantes até a data
const calcularDiasRestantes = (dataPrevisao) => {
    if (!dataPrevisao) return null;
    const hoje = new Date();
    const previsao = new Date(dataPrevisao);
    const diffTime = previsao - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Formata data para pt-BR
const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
};

export default function ProjetoDetalhesModal({ projeto, onClose }) {
    const [etapas, setEtapas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [slaItems, setSlaItems] = useState([]);
    const [slaForm, setSlaForm] = useState({ nomeFuncao: '', descricaoErro: '' });
    const [showSlaTermos, setShowSlaTermos] = useState(false);

    // Estado para controle de grupos abertos/fechados
    const [openGroups, setOpenGroups] = useState({
        desenvolvimento: true,
        pausado: true,
        espera: true,
        concluido: false
    });

    // Estados para resposta de pausa - CADA ETAPA TEM SEU PRÓPRIO ESTADO
    const [respostas, setRespostas] = useState({}); // { [etapa.id]: texto }
    const [enviandoResposta, setEnviandoResposta] = useState(null); // ID da etapa sendo enviada
    const [respostaEnviada, setRespostaEnviada] = useState({});

    // Estados para seleção de data de entrega
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [emailsConvidados, setEmailsConvidados] = useState(['']);
    const [enviandoConfirmacao, setEnviandoConfirmacao] = useState(false);

    // Estados para colaboradores
    const [colaboradores, setColaboradores] = useState([]);
    const [colaboradoresSelecionados, setColaboradoresSelecionados] = useState([]);
    const [loadingColaboradores, setLoadingColaboradores] = useState(false);

    // Estado para modal de feedback (substitui alert)
    const [feedbackModal, setFeedbackModal] = useState({ show: false, type: '', message: '' });

    // Verificar se projeto tem datas de entrega disponíveis E ainda não foi aprovado
    const temDatasEntrega = Array.isArray(projeto?.delivery_dates)
        && projeto.delivery_dates.length > 0
        && !projeto?.data_approved;

    // Ref para scroll automático à etapa pausada
    const etapaPausadaRef = useRef(null);

    // Carregar etapas quando o modal abrir
    useEffect(() => {
        if (projeto?.id) {
            carregarEtapas();
        }
    }, [projeto?.id]);

    // Scroll automático para primeira etapa pausada
    useEffect(() => {
        if (etapaPausadaRef.current && !loading) {
            setTimeout(() => {
                etapaPausadaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, [etapas, loading]);

    // Carregar colaboradores quando projeto tem datas de entrega
    useEffect(() => {
        if (temDatasEntrega && projeto?.organization_id) {
            carregarColaboradores();
        }
    }, [temDatasEntrega, projeto?.organization_id]);

    const carregarColaboradores = async () => {
        setLoadingColaboradores(true);
        try {
            const orgId = projeto?.organization_id || localStorage.getItem('organization_id');
            if (!orgId) {
                console.warn('⚠️ organization_id não encontrado');
                return;
            }
            const response = await listarColaboradores(orgId);
            if (response.success && Array.isArray(response.data)) {
                setColaboradores(response.data);
            }
        } catch (err) {
            console.error('Erro ao carregar colaboradores:', err);
        } finally {
            setLoadingColaboradores(false);
        }
    };

    const carregarEtapas = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔍 Buscando etapas para projeto ID:', projeto.id);
            const response = await listarEtapasProjeto(projeto.id);
            console.log('📋 Resposta etapas:', response);

            if (response.success && response.data) {
                // Aceitar array ou objeto único
                let etapasData = [];
                if (Array.isArray(response.data)) {
                    etapasData = response.data;
                } else if (response.data.id && response.data.titulo) {
                    // Objeto único - wrapar em array
                    etapasData = [response.data];
                    console.log('⚠️ Webhook retornou objeto único, wrapping em array');
                }

                // Ordenar por prazo_limite
                const etapasOrdenadas = etapasData.sort((a, b) => {
                    if (!a.prazo_limite) return 1;
                    if (!b.prazo_limite) return -1;
                    return new Date(a.prazo_limite) - new Date(b.prazo_limite);
                });
                console.log('✅ Etapas ordenadas:', etapasOrdenadas.length);
                setEtapas(etapasOrdenadas);
            } else {
                console.log('❌ Resposta sem sucesso ou sem data');
                setError(response.error || 'Erro ao carregar etapas');
            }
        } catch (err) {
            console.error('❌ Erro ao carregar etapas:', err);
            setError('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    // Agrupar etapas por status
    const etapasAgrupadas = useMemo(() => {
        const grupos = {
            desenvolvimento: [],
            pausado: [],
            espera: [],
            concluido: []
        };

        etapas.forEach((etapa, index) => {
            const status = etapa.status || 'disponivel';
            let grupoEncontrado = false;

            for (const [grupoKey, grupoConfig] of Object.entries(STATUS_GROUPS)) {
                if (grupoConfig.statuses.includes(status)) {
                    grupos[grupoKey].push({ ...etapa, originalIndex: index });
                    grupoEncontrado = true;
                    break;
                }
            }

            // Se não encontrou grupo, coloca em espera
            if (!grupoEncontrado) {
                grupos.espera.push({ ...etapa, originalIndex: index });
            }
        });

        return grupos;
    }, [etapas]);

    // Calcular status do projeto baseado nas etapas
    const statusCalculado = useMemo(() => {
        if (etapas.length === 0) return projeto?.status;

        const todasPendentes = etapas.every(e => e.status === 'disponivel' || e.status === 'pendente');
        const algumaProduzindo = etapas.some(e => e.status === 'em_andamento' || e.status === 'produzindo');
        const todasAprovadas = etapas.every(e => e.status === 'aprovado' || e.status === 'concluido' || e.status === 'os_concluida');

        if (todasPendentes) return 'waiting';
        if (algumaProduzindo) return 'in_development';
        if (todasAprovadas) return 'waiting_approval';

        return projeto?.status || 'waiting';
    }, [etapas, projeto?.status]);

    // Data de previsão = maior prazo_limite das etapas
    const previsaoEntrega = useMemo(() => {
        if (etapas.length === 0) return projeto?.date_finish;
        const prazos = etapas.filter(e => e.prazo_limite).map(e => new Date(e.prazo_limite));
        if (prazos.length === 0) return projeto?.date_finish;
        return new Date(Math.max(...prazos)).toISOString();
    }, [etapas, projeto?.date_finish]);

    const diasRestantes = calcularDiasRestantes(previsaoEntrega);

    // Detectar primeira etapa pausada que precisa de resposta
    const primeiraEtapaPausada = useMemo(() => {
        const pausadaComPendencia = etapas.find(e => {
            const isPausado = e.status === 'pausado';
            const precisaResposta = e.pause_reason && (!e.date_answered || new Date(e.date_answered) <= new Date(e.paused_at));
            return isPausado && precisaResposta;
        });

        if (pausadaComPendencia) return pausadaComPendencia;

        const qualquerPausada = etapas.find(e => e.status === 'pausado');
        if (qualquerPausada) return qualquerPausada;

        return null;
    }, [etapas]);

    // Verificar se etapa já foi respondida
    const etapaFoiRespondida = (etapa) => {
        if (!etapa.date_answered || !etapa.paused_at) return false;
        return new Date(etapa.date_answered) > new Date(etapa.paused_at);
    };

    // Toggle de grupo
    const toggleGroup = (groupKey) => {
        setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
    };

    // Enviar resposta de pausa
    const handleEnviarResposta = async (etapa) => {
        const textoResposta = respostas[etapa.id] || '';
        if (!textoResposta.trim() || !etapa?.id) return;

        setEnviandoResposta(etapa.id);
        try {
            const payload = {
                card_id: etapa.id,
                project_id: projeto.id,
                answered: textoResposta.trim(),
                date_answered: new Date().toISOString()
            };

            console.log('📤 Enviando resposta de pausa:', payload);
            const response = await responderPausaEtapa(payload);

            if (response.success) {
                setRespostaEnviada(prev => ({ ...prev, [etapa.id]: true }));
                setRespostas(prev => ({ ...prev, [etapa.id]: '' }));

                // Criar nova mensagem para adicionar ao chat_messages local
                const novaMensagem = {
                    id: `client-resp-${Date.now()}`,
                    sender: 'client',
                    sender_name: 'Cliente',
                    content: payload.answered,
                    timestamp: payload.date_answered,
                    type: 'client_response'
                };

                // Atualizar a etapa localmente
                setEtapas(prev => prev.map(e => {
                    if (e.id !== etapa.id) return e;
                    const existingMessages = Array.isArray(e.chat_messages) ? e.chat_messages : [];
                    return {
                        ...e,
                        answered: payload.answered,
                        date_answered: payload.date_answered,
                        chat_messages: [...existingMessages, novaMensagem]
                    };
                }));
                console.log('✅ Resposta enviada com sucesso');
            } else {
                console.error('❌ Erro ao enviar resposta:', response.error);
                alert('Erro ao enviar resposta. Tente novamente.');
            }
        } catch (err) {
            console.error('❌ Erro de conexão ao enviar resposta:', err);
            alert('Erro de conexão. Tente novamente.');
        } finally {
            setEnviandoResposta(null);
        }
    };

    // ========== Handlers para Seleção de Data de Entrega ==========
    const handleAddEmail = () => {
        setEmailsConvidados([...emailsConvidados, '']);
    };

    const handleRemoveEmail = (index) => {
        setEmailsConvidados(emailsConvidados.filter((_, i) => i !== index));
    };

    const handleEmailChange = (index, value) => {
        setEmailsConvidados(prev => prev.map((e, i) => i === index ? value : e));
    };

    // Toggle colaborador selecionado
    const toggleColaborador = (colaborador) => {
        setColaboradoresSelecionados(prev => {
            const jaExiste = prev.some(c => c.id === colaborador.id);
            if (jaExiste) {
                return prev.filter(c => c.id !== colaborador.id);
            } else {
                return [...prev, colaborador];
            }
        });
    };

    const handleConfirmarEntrega = async () => {
        if (!dataSelecionada) {
            setFeedbackModal({ show: true, type: 'warning', message: 'Por favor, selecione uma data para a entrega.' });
            return;
        }

        // Filtrar emails válidos dos inputs manuais
        const emailsValidos = emailsConvidados.filter(e => e.trim() && e.includes('@'));

        // Combinar emails dos colaboradores selecionados + emails manuais
        const emailsColaboradores = colaboradoresSelecionados
            .map(c => c.email)
            .filter(Boolean);
        const todosEmails = [...new Set([...emailsColaboradores, ...emailsValidos])];

        if (todosEmails.length === 0) {
            setFeedbackModal({ show: true, type: 'warning', message: 'Por favor, selecione pelo menos um participante ou adicione um e-mail.' });
            return;
        }

        setEnviandoConfirmacao(true);
        try {
            // Formatar data_confirmada: "2025-12-17 14:00"
            const dataFormatada = `${dataSelecionada.data} ${dataSelecionada.horario}`;

            const payload = {
                projeto_id: projeto.id,
                data_confirmada: dataFormatada,
                emails_convidados: todosEmails
            };

            console.log('📤 Confirmando entrega:', payload);
            const response = await confirmarEntregaProjeto(payload);

            if (response.success) {
                setFeedbackModal({
                    show: true,
                    type: 'success',
                    message: 'Data de entrega confirmada com sucesso! Você receberá um convite no seu calendário.',
                    onClose: () => onClose()
                });
            } else {
                throw new Error(response.error || 'Erro na confirmação');
            }
        } catch (err) {
            console.error('Erro ao confirmar entrega:', err);
            setFeedbackModal({ show: true, type: 'error', message: 'Erro ao confirmar entrega. Tente novamente.' });
        } finally {
            setEnviandoConfirmacao(false);
        }
    };


    // Adicionar item SLA
    const handleAddSlaItem = () => {
        if (!slaForm.nomeFuncao.trim() || !slaForm.descricaoErro.trim()) return;
        setSlaItems([...slaItems, { ...slaForm }]);
        setSlaForm({ nomeFuncao: '', descricaoErro: '' });
    };

    // Enviar SLA
    const handleEnviarSla = () => {
        console.log('📤 SLA a enviar:', slaItems);
        alert('Funcionalidade de envio será implementada em breve.');
    };

    // Renderizar uma etapa individual
    const renderEtapa = (etapa, index) => {
        const statusEtapa = etapa.status || 'disponivel';
        const isConcluido = statusEtapa === 'concluido' || statusEtapa === 'aprovado' || statusEtapa === 'os_concluida';
        const isProduzindo = statusEtapa === 'em_andamento' || statusEtapa === 'produzindo' || statusEtapa === 'em_producao' || statusEtapa === 'waiting_approval';
        const isPendente = statusEtapa === 'disponivel' || statusEtapa === 'pendente';
        const isPausado = statusEtapa === 'pausado';
        const jaRespondida = etapaFoiRespondida(etapa);
        const isPrimeiraEtapaPausada = primeiraEtapaPausada?.id === etapa.id;

        return (
            <div
                key={etapa.id || index}
                ref={isPrimeiraEtapaPausada ? etapaPausadaRef : null}
                className={`etapa-item ${isConcluido ? 'etapa-concluida' : ''} ${isProduzindo ? 'etapa-produzindo' : ''} ${isPendente ? 'etapa-pendente' : ''} ${isPausado ? 'etapa-pausado' : ''} ${isPrimeiraEtapaPausada ? 'etapa-destaque' : ''}`}
            >
                <div className="etapa-icon">
                    {isConcluido && <IconFileText />}
                    {isProduzindo && <IconSettings />}
                    {isPendente && <IconClock />}
                    {isPausado && <IconPause />}
                </div>
                <div className="etapa-content">
                    <div className="etapa-header">
                        <h4 className="etapa-titulo">
                            Etapa {etapa.originalIndex !== undefined ? etapa.originalIndex + 1 : index + 1} - {etapa.titulo || 'Sem título'}
                        </h4>
                        <span className={`etapa-status ${jaRespondida ? 'status-respondido' : ''}`}>
                            {jaRespondida ? 'Respondido' : getStatusDisplayName(statusEtapa)}
                        </span>
                    </div>

                    {/* Resumo só aparece quando em produção */}
                    {isProduzindo && (
                        <div className="etapa-resumo-container">
                            <p className="etapa-resumo">{etapa.resumo || ''}</p>
                        </div>
                    )}

                    {/* Chat Completo - SOMENTE quando pausado */}
                    {isPausado && (() => {
                        const chatMessages = Array.isArray(etapa.chat_messages) ? etapa.chat_messages : [];
                        const hasMessages = chatMessages.length > 0 || etapa.pause_reason;

                        if (!hasMessages) return null;

                        const mensagensParaExibir = chatMessages.length > 0 ? chatMessages : [
                            {
                                id: 'pause-legacy',
                                sender: 'dev',
                                sender_name: 'Desenvolvedor',
                                content: etapa.pause_reason,
                                timestamp: etapa.paused_at,
                                type: 'pause_reason'
                            },
                            ...(etapa.answered ? [{
                                id: 'answer-legacy',
                                sender: 'client',
                                sender_name: 'Cliente',
                                content: etapa.answered,
                                timestamp: etapa.date_answered,
                                type: 'client_response'
                            }] : [])
                        ];

                        const mensagensOrdenadas = [...mensagensParaExibir].sort((a, b) =>
                            new Date(a.timestamp) - new Date(b.timestamp)
                        );

                        const temRespostaPendente = isPausado && !jaRespondida;

                        return (
                            <div className="pausa-chat-container">
                                {mensagensOrdenadas.map((msg, msgIndex) => {
                                    const isDevMessage = msg.sender === 'dev';
                                    const msgClass = isDevMessage ? 'pausa-mensagem-dev' : 'pausa-mensagem-cliente';

                                    let icone = '💬';
                                    if (msg.type === 'pause_reason') icone = '⏸️';
                                    else if (msg.type === 'client_response') icone = '✅';
                                    else if (msg.type === 'followup') icone = '💬';
                                    else if (msg.type === 'resume') icone = '▶️';

                                    return (
                                        <div key={msg.id || msgIndex} className={`pausa-mensagem ${msgClass}`}>
                                            <div className="pausa-mensagem-header">
                                                <span className="pausa-mensagem-autor">
                                                    {icone} {msg.sender_name || (isDevMessage ? 'Desenvolvedor' : 'Cliente')}
                                                </span>
                                                <span className="pausa-mensagem-data">
                                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleString('pt-BR') : ''}
                                                </span>
                                            </div>
                                            <p className="pausa-mensagem-texto">{msg.content}</p>
                                        </div>
                                    );
                                })}

                                {temRespostaPendente && (
                                    <div className="pausa-resposta-form">
                                        <textarea
                                            className="pausa-resposta-input"
                                            placeholder="Digite sua resposta..."
                                            value={respostas[etapa.id] || ''}
                                            onChange={(e) => setRespostas(prev => ({ ...prev, [etapa.id]: e.target.value }))}
                                            rows={3}
                                        />
                                        <button
                                            className="pausa-resposta-btn"
                                            onClick={() => handleEnviarResposta(etapa)}
                                            disabled={enviandoResposta === etapa.id || !(respostas[etapa.id] || '').trim()}
                                        >
                                            {enviandoResposta === etapa.id ? 'Enviando...' : 'Enviar Resposta'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>
        );
    };

    if (!projeto) return null;

    // Verifica se projeto está finalizado (aproved_status === true)
    const projetoFinalizado = projeto.aproved_status === true;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content projeto-detalhes-modal" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="modal-header">
                    <h2 className="projeto-titulo">{projeto.title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <IconClose />
                    </button>
                </div>

                {/* Info Bar */}
                <div className="projeto-info-bar">
                    <div className="info-item">
                        <span className="info-label">STATUS</span>
                        <span className="info-badge" data-status={statusCalculado}>
                            {getStatusDisplayName(statusCalculado)}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">DIAS PARA ENTREGA</span>
                        <span className="info-value">
                            {diasRestantes !== null
                                ? (diasRestantes > 0 ? `Restam: ${diasRestantes} dias` : 'Prazo vencido')
                                : 'N/A'
                            }
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">PREVISÃO DE ENTREGA</span>
                        <span className="info-value">{formatarData(previsaoEntrega)}</span>
                    </div>
                </div>

                {/* Banner e Seleção de Data de Entrega - quando delivery_dates preenchido */}
                {temDatasEntrega && (
                    <div className="delivery-section">
                        <div className="delivery-banner">
                            <div className="delivery-text">
                                <h3>Projeto Pronto para Entrega!</h3>
                                <p>Escolha uma data para a call de entrega e adicione os participantes.</p>
                            </div>
                        </div>

                        <div className="delivery-dates">
                            <label className="delivery-label">Selecione uma data:</label>
                            <div className="dates-grid">
                                {projeto.delivery_dates.map((item, index) => (
                                    <button
                                        key={index}
                                        className={`date-option ${dataSelecionada?.data === item.data && dataSelecionada?.horario === item.horario ? 'selected' : ''}`}
                                        onClick={() => setDataSelecionada(item)}
                                    >
                                        <span className="date-day">{new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                                        <span className="date-time">{item.horario}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Seleção de Colaboradores */}
                        <div className="delivery-colaboradores">
                            <label className="delivery-label">Selecione os participantes:</label>
                            {loadingColaboradores ? (
                                <div className="colaboradores-loading">Carregando colaboradores...</div>
                            ) : colaboradores.length === 0 ? (
                                <div className="colaboradores-empty">Nenhum colaborador encontrado</div>
                            ) : (
                                <div className="colaboradores-list">
                                    {colaboradores.map((colaborador) => {
                                        const isSelected = colaboradoresSelecionados.some(c => c.id === colaborador.id);
                                        return (
                                            <label
                                                key={colaborador.id}
                                                className={`colaborador-item ${isSelected ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleColaborador(colaborador)}
                                                />
                                                <span className="colaborador-info">
                                                    <span className="colaborador-nome">{colaborador.name || colaborador.nome || 'Sem nome'}</span>
                                                    <span className="colaborador-email">{colaborador.email}</span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="delivery-participants">
                            <label className="delivery-label">E-mails adicionais (opcional):</label>
                            {emailsConvidados.map((email, index) => (
                                <div key={index} className="participant-row">
                                    <input
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        value={email}
                                        onChange={(e) => handleEmailChange(index, e.target.value)}
                                        className="participant-input"
                                    />
                                    {emailsConvidados.length > 1 && (
                                        <button className="remove-participant" onClick={() => handleRemoveEmail(index)}>×</button>
                                    )}
                                </div>
                            ))}
                            <button className="add-participant" onClick={handleAddEmail}>
                                + Adicionar e-mail
                            </button>
                        </div>


                        <button
                            className="confirm-delivery-btn"
                            onClick={handleConfirmarEntrega}
                            disabled={enviandoConfirmacao || !dataSelecionada}
                        >
                            {enviandoConfirmacao ? 'Confirmando...' : '✓ Confirmar Data de Entrega'}
                        </button>
                    </div>
                )}

                {/* Lista de Etapas Agrupadas */}
                <div className="modal-body">
                    {loading ? (
                        <div className="etapas-loading">Carregando etapas...</div>
                    ) : error ? (
                        <div className="etapas-error">{error}</div>
                    ) : etapas.length === 0 ? (
                        <div className="etapas-empty">Nenhuma etapa encontrada para este projeto.</div>
                    ) : (
                        <div className="etapas-grupos">
                            {Object.entries(STATUS_GROUPS).map(([groupKey, groupConfig]) => {
                                const etapasDoGrupo = etapasAgrupadas[groupKey];
                                if (etapasDoGrupo.length === 0) return null;

                                const isOpen = openGroups[groupKey];

                                return (
                                    <div key={groupKey} className="etapas-grupo">
                                        <button
                                            className="grupo-header"
                                            onClick={() => toggleGroup(groupKey)}
                                        >
                                            <span className="grupo-toggle">
                                                {isOpen ? <IconChevronDown /> : <IconChevronRight />}
                                            </span>
                                            <span className="grupo-icon">{groupConfig.icon}</span>
                                            <span className="grupo-label">{groupConfig.label}</span>
                                            <span className="grupo-count">{etapasDoGrupo.length}</span>
                                        </button>
                                        {isOpen && (
                                            <div className="etapas-lista">
                                                {etapasDoGrupo.map((etapa, index) => renderEtapa(etapa, index))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Seção SLA - apenas quando projeto está finalizado */}
                    {projetoFinalizado && (
                        <div className="sla-section">
                            <button
                                className="sla-termos-link"
                                onClick={() => setShowSlaTermos(!showSlaTermos)}
                            >
                                📋 Termos de SLA
                            </button>

                            {showSlaTermos && (
                                <div className="sla-termos-content">
                                    <h4>OBJETO DO SLA</h4>
                                    <p>Este SLA define: horários de atendimento, canais de suporte, procedimentos, prioridades, prazos máximos de resposta e solução.</p>
                                    <p><strong>Prioridade 1 (Crítica):</strong> Resposta em até 2h, solução em até 24h</p>
                                    <p><strong>Prioridade 2 (Alta):</strong> Resposta em 1 dia útil, solução em 2-5 dias úteis</p>
                                    <p><strong>Prioridade 3 (Média):</strong> Resposta em 2 dias úteis, solução em até 10 dias úteis</p>
                                    <p><strong>Prioridade 4 (Baixa):</strong> Resposta em 3 dias úteis, solução em até 20 dias úteis</p>
                                </div>
                            )}

                            {/* Formulário de SLA */}
                            <div className="sla-form">
                                <h4>Reportar Erro</h4>
                                <div className="sla-form-row">
                                    <input
                                        type="text"
                                        placeholder="Nome da função"
                                        value={slaForm.nomeFuncao}
                                        onChange={(e) => setSlaForm({ ...slaForm, nomeFuncao: e.target.value })}
                                        className="sla-input"
                                    />
                                </div>
                                <div className="sla-form-row">
                                    <textarea
                                        placeholder="Descreva o erro encontrado"
                                        value={slaForm.descricaoErro}
                                        onChange={(e) => setSlaForm({ ...slaForm, descricaoErro: e.target.value })}
                                        className="sla-textarea"
                                    />
                                </div>
                                <div className="sla-form-actions">
                                    <button className="sla-btn-add" onClick={handleAddSlaItem}>
                                        + Adicionar
                                    </button>
                                    {slaItems.length > 0 && (
                                        <button className="sla-btn-enviar" onClick={handleEnviarSla}>
                                            Enviar ({slaItems.length})
                                        </button>
                                    )}
                                </div>

                                {/* Lista de itens adicionados */}
                                {slaItems.length > 0 && (
                                    <div className="sla-items-lista">
                                        {slaItems.map((item, i) => (
                                            <div key={i} className="sla-item">
                                                <strong>{item.nomeFuncao}</strong>: {item.descricaoErro}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Feedback (substitui alert) */}
            {feedbackModal.show && (
                <div className="feedback-modal-overlay" onClick={() => {
                    if (feedbackModal.onClose) feedbackModal.onClose();
                    setFeedbackModal({ show: false, type: '', message: '' });
                }}>
                    <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className={`feedback-icon ${feedbackModal.type}`}>
                            {feedbackModal.type === 'success' && '✓'}
                            {feedbackModal.type === 'error' && '✕'}
                            {feedbackModal.type === 'warning' && '⚠'}
                        </div>
                        <p className="feedback-message">{feedbackModal.message}</p>
                        <button
                            className={`feedback-btn ${feedbackModal.type}`}
                            onClick={() => {
                                if (feedbackModal.onClose) feedbackModal.onClose();
                                setFeedbackModal({ show: false, type: '', message: '' });
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
