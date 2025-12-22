import React, { useState, useEffect } from 'react';
import { CONFIRMAR_REUNIAO_WEBHOOK, LISTAR_COLABORADORES_WEBHOOK } from '../../services/webhookUrls';

/**
 * Modal para confirmar reunião quando o admin propôs datas.
 * Exibe lista de datas propostas, permite selecionar uma e adicionar colaboradores.
 */
export default function ConfirmarReuniaoModal({ orcamento, onClose, onSuccess }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [colaboradores, setColaboradores] = useState([]);
    const [colaboradoresSelecionados, setColaboradoresSelecionados] = useState([]);
    const [emailsManuais, setEmailsManuais] = useState([]);
    const [novoEmail, setNovoEmail] = useState('');
    const [loadingColaboradores, setLoadingColaboradores] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Datas propostas pelo admin
    const proposedSchedule = orcamento?.proposed_schedule || [];

    // Dados do cliente logado
    const clientEmail = localStorage.getItem('garagem_projetos_email') || '';
    const organization = localStorage.getItem('garagem_projetos_organization') || '';

    // Buscar colaboradores ao montar
    useEffect(() => {
        const fetchColaboradores = async () => {
            if (!organization) return;

            setLoadingColaboradores(true);
            try {
                const response = await fetch(LISTAR_COLABORADORES_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ organization })
                });

                const result = await response.json();
                let lista = [];

                if (Array.isArray(result)) {
                    lista = result;
                } else if (result.data && Array.isArray(result.data)) {
                    lista = result.data;
                }

                // Filtrar o próprio usuário
                const filtrados = lista.filter(c => c.email?.toLowerCase() !== clientEmail.toLowerCase());
                setColaboradores(filtrados);
            } catch (err) {
                console.error('❌ Erro ao buscar colaboradores:', err);
            } finally {
                setLoadingColaboradores(false);
            }
        };

        fetchColaboradores();
    }, [organization, clientEmail]);

    // Formatar data para dd/mm/aaaa
    const formatarData = (dataStr) => {
        if (!dataStr) return '';

        // Se já está no formato yyyy-mm-dd ou similar
        const partes = dataStr.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }

        // Tentar parse como Date
        const data = new Date(dataStr);
        if (!isNaN(data.getTime())) {
            return data.toLocaleDateString('pt-BR');
        }

        return dataStr;
    };

    // Toggle colaborador selecionado
    const toggleColaborador = (email) => {
        if (colaboradoresSelecionados.includes(email)) {
            setColaboradoresSelecionados(colaboradoresSelecionados.filter(e => e !== email));
        } else {
            setColaboradoresSelecionados([...colaboradoresSelecionados, email]);
        }
    };

    // Adicionar e-mail manual
    const handleAddEmail = () => {
        if (!novoEmail.trim()) return;
        if (!novoEmail.includes('@')) {
            setError('E-mail inválido');
            return;
        }
        const emailLower = novoEmail.toLowerCase();
        if (emailsManuais.includes(emailLower) || colaboradoresSelecionados.includes(emailLower)) {
            setError('E-mail já adicionado');
            return;
        }
        setEmailsManuais([...emailsManuais, emailLower]);
        setNovoEmail('');
        setError(null);
    };

    // Remover e-mail manual
    const handleRemoveEmail = (email) => {
        setEmailsManuais(emailsManuais.filter(e => e !== email));
    };

    // Confirmar reunião
    const handleConfirmar = async () => {
        if (!selectedDate) {
            setError('Selecione uma data para a reunião');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Combinar e-mails dos colaboradores selecionados e manuais
            const todosEmails = [...colaboradoresSelecionados, ...emailsManuais];

            const payload = {
                projeto_id: orcamento.id,
                data_confirmada: selectedDate,
                email_cliente: clientEmail,
                emails_convidados: todosEmails
            };

            const response = await fetch(CONFIRMAR_REUNIAO_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Erro ao confirmar reunião');
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('❌ Erro ao confirmar reunião:', err);
            setError(err.message || 'Erro ao confirmar reunião');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-confirmar-reuniao" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <h2 className="modal-titulo">Confirmar Reunião</h2>
                <p className="modal-subtitulo">
                    Escolha uma das datas propostas para o projeto <strong>{orcamento?.title}</strong>
                </p>

                {/* Lista de datas propostas */}
                <div className="datas-propostas-container">
                    <h3>Datas Disponíveis</h3>

                    {proposedSchedule.length === 0 ? (
                        <p className="sem-datas">Nenhuma data proposta disponível.</p>
                    ) : (
                        <div className="datas-lista">
                            {proposedSchedule.map((item, index) => {
                                // Montar data completa para enviar
                                const dataCompleta = item.data && item.horario
                                    ? `${item.data} ${item.horario}`
                                    : item.data || item;
                                const isSelected = selectedDate === dataCompleta;

                                // Formatar para exibição
                                const dataFormatada = formatarData(item.data || item);

                                return (
                                    <div
                                        key={index}
                                        className={`data-option ${isSelected ? 'data-option-selected' : ''}`}
                                        onClick={() => setSelectedDate(dataCompleta)}
                                    >
                                        <div className="data-radio">
                                            <span className={`radio-circle ${isSelected ? 'checked' : ''}`}></span>
                                        </div>
                                        <div className="data-info">
                                            <span className="data-principal">
                                                {dataFormatada}
                                            </span>
                                            {item.horario && (
                                                <span className="data-horario">{item.horario}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Lista de colaboradores */}
                <div className="colaboradores-container">
                    <h3>Convidar Colaboradores</h3>
                    <p className="colaboradores-descricao">
                        Selecione quem deve participar da reunião.
                    </p>

                    {loadingColaboradores ? (
                        <p className="colaboradores-loading">Carregando colaboradores...</p>
                    ) : colaboradores.length === 0 ? (
                        <p className="sem-colaboradores">Nenhum colaborador disponível.</p>
                    ) : (
                        <div className="colaboradores-lista">
                            {colaboradores.map((colab) => {
                                const isChecked = colaboradoresSelecionados.includes(colab.email);
                                return (
                                    <label
                                        key={colab.email}
                                        className={`colaborador-item ${isChecked ? 'colaborador-selecionado' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => toggleColaborador(colab.email)}
                                            className="colaborador-checkbox"
                                        />
                                        <span className="colaborador-nome">{colab.name || colab.nome || colab.email}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {/* Adicionar outros e-mails manualmente */}
                    <div className="adicionar-email-section">
                        <p className="adicionar-email-label">Adicionar outro e-mail:</p>
                        <div className="add-email-row">
                            <input
                                type="email"
                                placeholder="email@exemplo.com"
                                value={novoEmail}
                                onChange={(e) => setNovoEmail(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                                className="input-email"
                            />
                            <button
                                type="button"
                                onClick={handleAddEmail}
                                className="btn-add-email"
                            >
                                +
                            </button>
                        </div>
                        {emailsManuais.length > 0 && (
                            <div className="emails-lista">
                                {emailsManuais.map((email, idx) => (
                                    <span key={idx} className="email-tag">
                                        {email}
                                        <button onClick={() => handleRemoveEmail(email)}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Erro */}
                {error && (
                    <div className="modal-error">{error}</div>
                )}

                {/* Ações */}
                <div className="modal-footer">
                    <a
                        href="https://wa.me/5511934182212"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-contato"
                    >
                        Entrar em contato com o responsável
                    </a>

                    <div className="modal-buttons">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-cancelar"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmar}
                            className="btn-confirmar"
                            disabled={loading || !selectedDate}
                        >
                            {loading ? 'Confirmando...' : 'Confirmar Reunião'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
