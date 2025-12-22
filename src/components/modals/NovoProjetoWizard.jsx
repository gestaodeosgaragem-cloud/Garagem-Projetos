import React from 'react';
import { CRIAR_PROJETO_ORCAMENTO_WEBHOOK } from '../../services/webhookUrls';

const WIZARD_STORAGE_KEY = 'garagem_wizard_draft';

// Estado inicial do formulário
const getInitialFormData = () => {
    // Tentar carregar dados salvos do localStorage
    try {
        const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            console.log('📂 Restaurando rascunho do wizard:', parsed);
            return parsed.formData || defaultFormData;
        }
    } catch (err) {
        console.warn('⚠️ Erro ao carregar rascunho:', err);
    }
    return defaultFormData;
};

const getInitialStep = () => {
    try {
        const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.step || 1;
        }
    } catch (err) {
        console.warn('⚠️ Erro ao carregar step:', err);
    }
    return 1;
};

const defaultFormData = {
    // Passo 1: Nome do projeto
    nome: '',
    // Passo 2: Descrição geral
    descricao_geral: '',
    // Passo 3: Objetivo principal
    objetivo_principal: '',
    // Passo 4: Situação atual
    situacao_atual: '',
    // Passo 5: Entrada de informações (Input)
    input_mensagens: false,
    input_arquivos: false,
    input_dados_digitados: false,
    input_dados_sistemas: false,
    input_outro: false,
    input_outro_texto: '',
    input_exemplo: '',
    // Passo 6: Saída esperada (Output)
    output_mensagens: false,
    output_relatorios: false,
    output_arquivos: false,
    output_sistemas: false,
    output_dashboards: false,
    output_outro: false,
    output_outro_texto: '',
    output_formato: '',
    // Passo 7: Critério de sucesso
    criterio_sucesso: '',
    // Passo 8: Volume estimado
    volume_usuarios: '',
    volume_registros: '',
    volume_crescimento: '',
    // Passo 9: Ferramentas ou sistemas envolvidos
    ferramenta_whatsapp: false,
    ferramenta_email: false,
    ferramenta_sheets: false,
    ferramenta_crm: false,
    ferramenta_erp: false,
    ferramenta_outro_sistema: false,
    ferramenta_nao_sei: false,
    ferramenta_quais: '',
    // Passo 10: Restrições ou cuidados importantes
    restricoes: '',
    // Passo 11: Observações finais
    observacoes: ''
};

export default function NovoProjetoWizard({ onClose, onSuccess }) {
    const [step, setStep] = React.useState(getInitialStep);
    const [formData, setFormData] = React.useState(getInitialFormData);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState(null);

    // Salvar progresso no localStorage sempre que formData ou step mudar
    React.useEffect(() => {
        const draft = { formData, step };
        localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(draft));
    }, [formData, step]);

    // Limpar rascunho do localStorage
    const clearDraft = () => {
        localStorage.removeItem(WIZARD_STORAGE_KEY);
        console.log('🗑️ Rascunho do wizard removido');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    // Enviar dados para o webhook n8n
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);


        const organization = localStorage.getItem('garagem_projetos_organization');
        const userName = localStorage.getItem('garagem_projetos_name');

        if (!organization) {
            setSubmitError('Organização não encontrada. Faça login novamente.');
            setIsSubmitting(false);
            return;
        }

        // Montar arrays de inputs selecionados
        const inputsSelecionados = [];
        if (formData.input_mensagens) inputsSelecionados.push('Mensagens (WhatsApp, e-mail, chat, etc.)');
        if (formData.input_arquivos) inputsSelecionados.push('Arquivos (PDF, Excel, CSV, imagens, áudios, etc.)');
        if (formData.input_dados_digitados) inputsSelecionados.push('Dados digitados por pessoas');
        if (formData.input_dados_sistemas) inputsSelecionados.push('Dados de outros sistemas');
        if (formData.input_outro && formData.input_outro_texto) inputsSelecionados.push(`Outro: ${formData.input_outro_texto}`);

        // Montar arrays de outputs selecionados
        const outputsSelecionados = [];
        if (formData.output_mensagens) outputsSelecionados.push('Mensagens automáticas');
        if (formData.output_relatorios) outputsSelecionados.push('Relatórios');
        if (formData.output_arquivos) outputsSelecionados.push('Arquivos gerados');
        if (formData.output_sistemas) outputsSelecionados.push('Atualização de sistemas/bancos de dados');
        if (formData.output_dashboards) outputsSelecionados.push('Dashboards / visualizações');
        if (formData.output_outro && formData.output_outro_texto) outputsSelecionados.push(`Outro: ${formData.output_outro_texto}`);

        // Montar arrays de ferramentas selecionadas
        const ferramentasSelecionadas = [];
        if (formData.ferramenta_whatsapp) ferramentasSelecionadas.push('WhatsApp');
        if (formData.ferramenta_email) ferramentasSelecionadas.push('E-mail');
        if (formData.ferramenta_sheets) ferramentasSelecionadas.push('Google Sheets / Excel');
        if (formData.ferramenta_crm) ferramentasSelecionadas.push('CRM');
        if (formData.ferramenta_erp) ferramentasSelecionadas.push('ERP');
        if (formData.ferramenta_outro_sistema) ferramentasSelecionadas.push('Outro sistema interno');
        if (formData.ferramenta_nao_sei) ferramentasSelecionadas.push('Não sei / aberto a sugestão');

        // Montar o payload conforme especificado
        const payload = {
            organization: organization,
            user_name: userName || 'Usuário não identificado',
            novo_projeto: {
                title: formData.nome,
                description: formData.descricao_geral,
                objetivo_principal: formData.objetivo_principal,
                situacao_atual: formData.situacao_atual,
                entradas: {
                    tipos: inputsSelecionados,
                    exemplo: formData.input_exemplo
                },
                saidas: {
                    tipos: outputsSelecionados,
                    formato: formData.output_formato
                },
                criterio_sucesso: formData.criterio_sucesso,
                volume: {
                    usuarios: formData.volume_usuarios,
                    registros_periodo: formData.volume_registros,
                    crescimento_esperado: formData.volume_crescimento
                },
                ferramentas: {
                    selecionadas: ferramentasSelecionadas,
                    quais: formData.ferramenta_quais
                },
                restricoes: formData.restricoes,
                observacoes: formData.observacoes
            }
        };

        try {
            console.log('📤 Enviando novo projeto para n8n:', payload);

            const response = await fetch(CRIAR_PROJETO_ORCAMENTO_WEBHOOK, {
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
            console.log('✅ Projeto criado com sucesso:', result);

            // Limpar rascunho do localStorage após sucesso
            clearDraft();

            // Chamar callback de sucesso se existir (para atualizar lista)
            if (onSuccess) {
                onSuccess(result);
            }

            // Fechar o modal
            onClose();

        } catch (err) {
            console.error('❌ Erro ao criar projeto:', err);
            setSubmitError(err.message || 'Erro ao enviar solicitação. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalSteps = 12;

    // Estilos inline para o wizard
    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
        },
        modal: {
            background: 'var(--bg-secundario)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        },
        header: {
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        },
        stepLabel: {
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '0.25rem'
        },
        title: {
            fontFamily: 'var(--fonte-headings)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '2px'
        },
        closeBtn: {
            background: 'var(--garagem-magenta)',
            border: 'none',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            lineHeight: 1
        },
        progressBar: {
            width: '100%',
            height: '3px',
            background: 'rgba(255, 255, 255, 0.1)'
        },
        progressFill: {
            height: '100%',
            background: 'var(--garagem-magenta)',
            transition: 'width 0.3s ease'
        },
        content: {
            padding: '2rem',
            flex: 1,
            overflowY: 'auto'
        },
        question: {
            fontFamily: 'var(--fonte-corpo)',
            fontSize: '1.125rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
        },
        hint: {
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '1.5rem'
        },
        input: {
            width: '100%',
            background: 'var(--bg-princial)',
            border: '1px solid var(--garagem-magenta)',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '1rem',
            color: 'white',
            outline: 'none',
            fontFamily: 'var(--fonte-corpo)'
        },
        textarea: {
            width: '100%',
            background: 'var(--bg-princial)',
            border: '1px solid var(--garagem-magenta)',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '1rem',
            color: 'white',
            outline: 'none',
            fontFamily: 'var(--fonte-corpo)',
            minHeight: '120px',
            resize: 'vertical'
        },
        checkboxGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1rem'
        },
        checkboxLabel: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.95rem',
            color: 'rgba(255, 255, 255, 0.9)',
            cursor: 'pointer',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid transparent',
            transition: 'all 0.2s ease'
        },
        checkboxLabelChecked: {
            background: 'rgba(232, 0, 120, 0.15)',
            border: '1px solid var(--garagem-magenta)'
        },
        checkbox: {
            width: '20px',
            height: '20px',
            accentColor: 'var(--garagem-magenta)',
            cursor: 'pointer'
        },
        inlineInput: {
            marginTop: '0.5rem',
            marginLeft: '2rem',
            width: 'calc(100% - 2rem)',
            background: 'var(--bg-princial)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: 'white',
            outline: 'none',
            fontFamily: 'var(--fonte-corpo)'
        },
        subLabel: {
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.6)',
            marginTop: '1.5rem',
            marginBottom: '0.5rem'
        },
        footer: {
            padding: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        backBtn: {
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            padding: '0.5rem 1rem'
        },
        nextBtn: {
            background: 'var(--garagem-gradiente)',
            border: 'none',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
        },
        submitBtn: {
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: 'none',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
        },
        summary: {
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            maxHeight: '300px',
            overflowY: 'auto'
        },
        summaryItem: {
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        },
        summaryLabel: {
            color: 'var(--garagem-magenta)',
            fontWeight: 'bold',
            display: 'block',
            marginBottom: '0.25rem'
        },
        emoji: {
            fontSize: '3rem',
            textAlign: 'center',
            marginBottom: '1rem'
        }
    };

    // Função helper para renderizar checkbox
    const renderCheckbox = (name, label) => {
        const isChecked = formData[name];
        return (
            <label
                style={{
                    ...styles.checkboxLabel,
                    ...(isChecked ? styles.checkboxLabelChecked : {})
                }}
            >
                <input
                    type="checkbox"
                    name={name}
                    checked={isChecked}
                    onChange={handleChange}
                    style={styles.checkbox}
                />
                {label}
            </label>
        );
    };

    // Montar resumo para a última tela
    const buildSummaryInputs = () => {
        const items = [];
        if (formData.input_mensagens) items.push('Mensagens');
        if (formData.input_arquivos) items.push('Arquivos');
        if (formData.input_dados_digitados) items.push('Dados digitados');
        if (formData.input_dados_sistemas) items.push('Dados de sistemas');
        if (formData.input_outro) items.push(`Outro: ${formData.input_outro_texto}`);
        return items.join(', ') || 'Não especificado';
    };

    const buildSummaryOutputs = () => {
        const items = [];
        if (formData.output_mensagens) items.push('Mensagens automáticas');
        if (formData.output_relatorios) items.push('Relatórios');
        if (formData.output_arquivos) items.push('Arquivos gerados');
        if (formData.output_sistemas) items.push('Atualização de sistemas');
        if (formData.output_dashboards) items.push('Dashboards');
        if (formData.output_outro) items.push(`Outro: ${formData.output_outro_texto}`);
        return items.join(', ') || 'Não especificado';
    };

    const buildSummaryFerramentas = () => {
        const items = [];
        if (formData.ferramenta_whatsapp) items.push('WhatsApp');
        if (formData.ferramenta_email) items.push('E-mail');
        if (formData.ferramenta_sheets) items.push('Google Sheets / Excel');
        if (formData.ferramenta_crm) items.push('CRM');
        if (formData.ferramenta_erp) items.push('ERP');
        if (formData.ferramenta_outro_sistema) items.push('Outro sistema interno');
        if (formData.ferramenta_nao_sei) items.push('Aberto a sugestão');
        return items.join(', ') || 'Não especificado';
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <p style={styles.stepLabel}>Passo {step} de {totalSteps}</p>
                        <h2 style={styles.title}>Novo Projeto</h2>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Progress Bar */}
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${(step / totalSteps) * 100}%` }}></div>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {/* Passo 1: Nome do projeto */}
                    {step === 1 && (
                        <div>
                            <p style={styles.question}>Qual o nome que você gostaria de dar para esse projeto?</p>
                            <p style={styles.hint}>Descreva aqui o nome do seu cliente ou o nome do projeto para organizar as suas demandas.</p>
                            <input
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                type="text"
                                style={styles.input}
                                placeholder="Ex: Automação WhatsApp - Cliente XYZ"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Passo 2: Descrição geral do projeto */}
                    {step === 2 && (
                        <div>
                            <p style={styles.question}>Descrição geral do projeto</p>
                            <p style={styles.hint}>Em poucas palavras, o que você gostaria que essa automação fizesse? (Qual problema ela resolve ou qual processo ela melhora?)</p>
                            <textarea
                                name="descricao_geral"
                                value={formData.descricao_geral}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Ex: Quero automatizar o atendimento inicial dos clientes que chegam pelo WhatsApp, filtrar leads qualificados e agendar reuniões automaticamente..."
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Passo 3: Objetivo principal */}
                    {step === 3 && (
                        <div>
                            <p style={styles.question}>Objetivo principal</p>
                            <p style={styles.hint}>Qual é o principal resultado esperado com esse projeto? (Ex.: ganhar tempo, reduzir erros, escalar atendimento, centralizar informações, gerar relatórios, etc.)</p>
                            <textarea
                                name="objetivo_principal"
                                value={formData.objetivo_principal}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Ex: Reduzir o tempo de resposta aos clientes e liberar a equipe comercial para focar em vendas de maior valor..."
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Passo 4: Situação atual */}
                    {step === 4 && (
                        <div>
                            <p style={styles.question}>Situação atual</p>
                            <p style={styles.hint}>Hoje, como esse processo é feito? (Manual, planilhas, pessoas envolvidas, sistemas diferentes, retrabalho, etc.)</p>
                            <textarea
                                name="situacao_atual"
                                value={formData.situacao_atual}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Ex: Hoje temos 2 pessoas respondendo manualmente pelo WhatsApp, copiando dados para uma planilha e depois cadastrando no CRM..."
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Passo 5: Entrada de informações (Input) */}
                    {step === 5 && (
                        <div>
                            <p style={styles.question}>Entrada de informações (Input)</p>
                            <p style={styles.hint}>Quais informações a automação irá receber?</p>

                            <div style={styles.checkboxGroup}>
                                {renderCheckbox('input_mensagens', 'Mensagens (WhatsApp, e-mail, chat, etc.)')}
                                {renderCheckbox('input_arquivos', 'Arquivos (PDF, Excel, CSV, imagens, áudios, etc.)')}
                                {renderCheckbox('input_dados_digitados', 'Dados digitados por pessoas')}
                                {renderCheckbox('input_dados_sistemas', 'Dados de outros sistemas')}
                                {renderCheckbox('input_outro', 'Outro')}
                                {formData.input_outro && (
                                    <input
                                        name="input_outro_texto"
                                        value={formData.input_outro_texto}
                                        onChange={handleChange}
                                        type="text"
                                        style={styles.inlineInput}
                                        placeholder="Especifique qual..."
                                    />
                                )}
                            </div>

                            <p style={styles.subLabel}>Se possível, descreva ou envie um exemplo real:</p>
                            <textarea
                                name="input_exemplo"
                                value={formData.input_exemplo}
                                onChange={handleChange}
                                style={{ ...styles.textarea, minHeight: '80px' }}
                                placeholder="Ex: O cliente envia uma mensagem como 'Olá, gostaria de saber mais sobre os serviços de automação...'"
                            />
                        </div>
                    )}

                    {/* Passo 6: Saída esperada (Output) */}
                    {step === 6 && (
                        <div>
                            <p style={styles.question}>Saída esperada (Output)</p>
                            <p style={styles.hint}>O que você espera que a automação entregue?</p>

                            <div style={styles.checkboxGroup}>
                                {renderCheckbox('output_mensagens', 'Mensagens automáticas')}
                                {renderCheckbox('output_relatorios', 'Relatórios')}
                                {renderCheckbox('output_arquivos', 'Arquivos gerados')}
                                {renderCheckbox('output_sistemas', 'Atualização de sistemas/bancos de dados')}
                                {renderCheckbox('output_dashboards', 'Dashboards / visualizações')}
                                {renderCheckbox('output_outro', 'Outro')}
                                {formData.output_outro && (
                                    <input
                                        name="output_outro_texto"
                                        value={formData.output_outro_texto}
                                        onChange={handleChange}
                                        type="text"
                                        style={styles.inlineInput}
                                        placeholder="Especifique qual..."
                                    />
                                )}
                            </div>

                            <p style={styles.subLabel}>Em qual formato?</p>
                            <input
                                name="output_formato"
                                value={formData.output_formato}
                                onChange={handleChange}
                                type="text"
                                style={styles.input}
                                placeholder="Ex: PDF, Excel, planilha online, mensagem, dashboard..."
                            />
                        </div>
                    )}

                    {/* Passo 7: Critério de sucesso */}
                    {step === 7 && (
                        <div>
                            <p style={styles.question}>Critério de sucesso</p>
                            <p style={styles.hint}>Como você saberá que o projeto deu certo? (Ex.: reduzir X horas de trabalho, eliminar erros, responder clientes mais rápido, centralizar dados, etc.)</p>
                            <textarea
                                name="criterio_sucesso"
                                value={formData.criterio_sucesso}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Ex: Considero sucesso se conseguirmos responder 100% dos leads em menos de 5 minutos e reduzir o tempo da equipe em 4 horas por dia..."
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Passo 8: Volume estimado */}
                    {step === 8 && (
                        <div>
                            <p style={styles.question}>Volume estimado</p>
                            <p style={styles.hint}>Qual o volume aproximado envolvido?</p>

                            <p style={styles.subLabel}>Quantidade de usuários:</p>
                            <input
                                name="volume_usuarios"
                                value={formData.volume_usuarios}
                                onChange={handleChange}
                                type="text"
                                style={styles.input}
                                placeholder="Ex: 5 usuários internos, 200 clientes/mês..."
                            />

                            <p style={styles.subLabel}>Quantidade de mensagens / arquivos / registros por dia ou mês:</p>
                            <input
                                name="volume_registros"
                                value={formData.volume_registros}
                                onChange={handleChange}
                                type="text"
                                style={styles.input}
                                placeholder="Ex: Cerca de 50 mensagens por dia, 1500 por mês..."
                            />

                            <p style={styles.subLabel}>Crescimento esperado no futuro:</p>
                            <input
                                name="volume_crescimento"
                                value={formData.volume_crescimento}
                                onChange={handleChange}
                                type="text"
                                style={styles.input}
                                placeholder="Ex: Sim, esperamos dobrar o volume em 6 meses..."
                            />
                        </div>
                    )}

                    {/* Passo 9: Ferramentas ou sistemas envolvidos */}
                    {step === 9 && (
                        <div>
                            <p style={styles.question}>Ferramentas ou sistemas envolvidos</p>
                            <p style={styles.hint}>Existe alguma ferramenta que precisa ou gostaria que fosse usada?</p>

                            <div style={styles.checkboxGroup}>
                                {renderCheckbox('ferramenta_whatsapp', 'WhatsApp')}
                                {renderCheckbox('ferramenta_email', 'E-mail')}
                                {renderCheckbox('ferramenta_sheets', 'Google Sheets / Excel')}
                                {renderCheckbox('ferramenta_crm', 'CRM')}
                                {renderCheckbox('ferramenta_erp', 'ERP')}
                                {renderCheckbox('ferramenta_outro_sistema', 'Outro sistema interno')}
                                {renderCheckbox('ferramenta_nao_sei', 'Não sei / aberto a sugestão')}
                            </div>

                            <p style={styles.subLabel}>Se sim, quais?</p>
                            <input
                                name="ferramenta_quais"
                                value={formData.ferramenta_quais}
                                onChange={handleChange}
                                type="text"
                                style={styles.input}
                                placeholder="Ex: PipeDrive, RD Station, HubSpot, Trello..."
                            />
                        </div>
                    )}

                    {/* Passo 10: Restrições ou cuidados importantes */}
                    {step === 10 && (
                        <div>
                            <p style={styles.question}>Restrições ou cuidados importantes</p>
                            <p style={styles.hint}>Existe algo que não pode acontecer ou que exige cuidado especial? (Segurança, LGPD, dados sensíveis, aprovações manuais, regras internas, etc.)</p>
                            <textarea
                                name="restricoes"
                                value={formData.restricoes}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Ex: Os dados de clientes são sensíveis e precisam seguir LGPD. Contratos acima de R$10k precisam de aprovação manual do gerente..."
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Passo 11: Observações finais */}
                    {step === 11 && (
                        <div>
                            <p style={styles.question}>Observações finais</p>
                            <p style={styles.hint}>Existe algo que você considera importante e não foi perguntado acima?</p>
                            <textarea
                                name="observacoes"
                                value={formData.observacoes}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Ex: Já tivemos uma tentativa de automação que não funcionou bem porque... / Temos urgência para lançar até..."
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Passo 12: Resumo e confirmação */}
                    {step === 12 && (
                        <div style={{ textAlign: 'center' }}>
                            <p style={styles.question}>Tudo pronto!</p>
                            <p style={styles.hint}>Revisamos suas informações. Ao confirmar, nossa equipe receberá sua solicitação imediatamente.</p>

                            <div style={styles.summary}>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Projeto:</span>
                                    {formData.nome || 'Não informado'}
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Descrição:</span>
                                    {formData.descricao_geral || 'Não informado'}
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Objetivo:</span>
                                    {formData.objetivo_principal || 'Não informado'}
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Entradas:</span>
                                    {buildSummaryInputs()}
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Saídas esperadas:</span>
                                    {buildSummaryOutputs()}
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Ferramentas:</span>
                                    {buildSummaryFerramentas()}
                                </div>
                            </div>

                            {/* Exibir erro se houver */}
                            {submitError && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(239, 68, 68, 0.5)',
                                    borderRadius: '8px',
                                    color: '#ef4444',
                                    fontSize: '0.875rem'
                                }}>
                                    ⚠️ {submitError}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    {step > 1 ? (
                        <button
                            onClick={prevStep}
                            style={styles.backBtn}
                            disabled={isSubmitting}
                        >
                            ← Voltar
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < totalSteps ? (
                        <button
                            onClick={nextStep}
                            style={{
                                ...styles.nextBtn,
                                opacity: step === 1 && !formData.nome ? 0.5 : 1,
                                cursor: step === 1 && !formData.nome ? 'not-allowed' : 'pointer'
                            }}
                            disabled={step === 1 && !formData.nome}
                        >
                            Continuar
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            style={{
                                ...styles.submitBtn,
                                opacity: isSubmitting ? 0.7 : 1,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
