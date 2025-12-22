import React, { useState, useRef, useEffect } from 'react';
import AlterarSenhaModal from '../components/modals/AlterarSenhaModal';
import ConfirmarPromocaoModal from '../components/modals/ConfirmarPromocaoModal';
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal';
import {
    ALTERAR_NOME_WEBHOOK,
    ATUALIZAR_FOTO_WEBHOOK,
    ADICIONAR_COLABORADOR_WEBHOOK,
    EXCLUIR_COLABORADOR_WEBHOOK,
    PROMOVER_ADMIN_WEBHOOK,
    LISTAR_COLABORADORES_WEBHOOK
} from '../services/webhookUrls';

export default function ConfiguracoesPage() {
    const userClient = localStorage.getItem('garagem_projetos_client') || 'worker';
    const userName = localStorage.getItem('garagem_projetos_name') || '';
    const userEmail = localStorage.getItem('garagem_projetos_email') || '';
    const userAvatar = localStorage.getItem('garagem_projetos_avatar') || '';
    const organization = localStorage.getItem('garagem_projetos_organization') || '';

    // Estado para o menu (admin/super_admin)
    const [activeMenu, setActiveMenu] = useState('perfil');

    // Estado para edição de perfil
    const [nome, setNome] = useState(userName);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Estado para modal de senha
    const [showSenhaModal, setShowSenhaModal] = useState(false);

    // Estado para colaboradores (admin)
    const [colaboradores, setColaboradores] = useState([]);
    const [administradores, setAdministradores] = useState([]);
    const [loadingColabs, setLoadingColabs] = useState(false);
    const [novoColabNome, setNovoColabNome] = useState('');
    const [novoColabEmail, setNovoColabEmail] = useState('');

    // Estado para modais de confirmação
    const [showPromocaoModal, setShowPromocaoModal] = useState(false);
    const [showExclusaoModal, setShowExclusaoModal] = useState(false);
    const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);

    // Ref para input de foto
    const fileInputRef = useRef(null);

    const isAdmin = userClient === 'admin' || userClient === 'super_admin';

    // Salvar nome
    const handleSaveNome = async () => {
        setSaving(true);
        setMessage('');
        try {
            const response = await fetch(ALTERAR_NOME_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, name: nome })
            });
            if (response.ok) {
                localStorage.setItem('garagem_projetos_name', nome);
                setMessage('Nome atualizado com sucesso!');
            } else {
                setMessage('Erro ao atualizar nome.');
            }
        } catch (err) {
            setMessage('Erro ao atualizar nome.');
        } finally {
            setSaving(false);
        }
    };

    // Upload de foto
    const handleFotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('email', userEmail);
        formData.append('avatar', file);

        try {
            const response = await fetch(ATUALIZAR_FOTO_WEBHOOK, {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                const result = await response.json();
                if (result.avatar_url) {
                    localStorage.setItem('garagem_projetos_avatar', result.avatar_url);
                    window.location.reload();
                }
            }
        } catch (err) {
            console.error('Erro ao atualizar foto:', err);
        }
    };

    // Carregar colaboradores
    const loadColaboradores = async () => {
        setLoadingColabs(true);
        try {
            const response = await fetch(LISTAR_COLABORADORES_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organization })
            });
            if (response.ok) {
                const result = await response.json();
                if (Array.isArray(result)) {
                    // Separar colaboradores (workers) e administradores
                    setColaboradores(result.filter(c => c.client === 'worker'));
                    setAdministradores(result.filter(c => c.client === 'admin' || c.client === 'super_admin'));
                }
            }
        } catch (err) {
            console.error('Erro ao carregar colaboradores:', err);
        } finally {
            setLoadingColabs(false);
        }
    };

    // Adicionar colaborador
    const handleAddColaborador = async () => {
        if (!novoColabNome || !novoColabEmail) return;

        try {
            await fetch(ADICIONAR_COLABORADOR_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: novoColabNome,
                    email: novoColabEmail,
                    organization
                })
            });
            setNovoColabNome('');
            setNovoColabEmail('');
            loadColaboradores();
        } catch (err) {
            console.error('Erro ao adicionar colaborador:', err);
        }
    };

    // Excluir colaborador - abre modal
    const handleDeleteClick = (colab) => {
        setColaboradorSelecionado(colab);
        setShowExclusaoModal(true);
    };

    // Confirma exclusão após validação do modal
    const handleConfirmDelete = async (email) => {
        try {
            await fetch(EXCLUIR_COLABORADOR_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            loadColaboradores();
        } catch (err) {
            console.error('Erro ao excluir colaborador:', err);
        }
    };

    // Promover a admin - abre modal
    const handlePromoverClick = (colab) => {
        setColaboradorSelecionado(colab);
        setShowPromocaoModal(true);
    };

    // Confirma promoção após validação do modal
    const handleConfirmPromover = async (email) => {
        try {
            await fetch(PROMOVER_ADMIN_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            loadColaboradores();
        } catch (err) {
            console.error('Erro ao promover colaborador:', err);
        }
    };

    // Carregar colaboradores quando mudar para aba empresa
    useEffect(() => {
        if (activeMenu === 'empresa' && isAdmin) {
            loadColaboradores();
        }
    }, [activeMenu]);

    // JSX para seção de Perfil
    const renderPerfilSection = () => (
        <div className="config-section">
            <h2 className="config-section-title">Meu Perfil</h2>

            {/* Avatar */}
            <div className="config-avatar-section">
                <div
                    className="config-avatar"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {userAvatar ? (
                        <img src={userAvatar} alt="Avatar" />
                    ) : (
                        <span className="config-avatar-placeholder">
                            {userName.charAt(0).toUpperCase()}
                        </span>
                    )}
                    <div className="config-avatar-overlay">
                        <span>Alterar</span>
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFotoChange}
                />
                <p className="config-avatar-hint">Clique para alterar a foto</p>
            </div>

            {/* Nome */}
            <div className="config-field">
                <label>Nome</label>
                <div className="config-field-row">
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome"
                    />
                    <button
                        onClick={handleSaveNome}
                        disabled={saving || nome === userName}
                        className="btn-config-save"
                    >
                        {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>

            {/* Email (readonly) */}
            <div className="config-field">
                <label>E-mail</label>
                <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="config-input-disabled"
                />
            </div>

            {/* Senha */}
            <div className="config-field">
                <label>Senha</label>
                <button
                    onClick={() => setShowSenhaModal(true)}
                    className="btn-config-alterar"
                >
                    Alterar Senha
                </button>
            </div>

            {message && <p className="config-message">{message}</p>}
        </div>
    );

    // JSX para seção de Empresa
    const renderEmpresaSection = () => (
        <div className="config-section">
            {/* Seção de Administradores */}
            <h2 className="config-section-title">Administradores</h2>

            <div className="config-colab-list" style={{ marginBottom: '2rem' }}>
                {loadingColabs ? (
                    <p className="config-loading">Carregando...</p>
                ) : administradores.length === 0 ? (
                    <p className="config-empty">Nenhum administrador encontrado.</p>
                ) : (
                    administradores.map(admin => (
                        <div key={admin.email} className="config-colab-item">
                            <div className="config-colab-info">
                                <span className="config-colab-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {admin.name}
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: admin.client === 'super_admin' ? '#E41F7B' : '#7C3AED',
                                        color: 'white',
                                        fontSize: '0.65rem',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {admin.client === 'super_admin' ? 'Super Admin' : 'Admin'}
                                    </span>
                                </span>
                                <span className="config-colab-email">{admin.email}</span>
                            </div>
                            {/* Admins não podem ser excluídos ou promovidos por aqui */}
                        </div>
                    ))
                )}
            </div>

            {/* Seção de Colaboradores */}
            <h2 className="config-section-title">Colaboradores</h2>

            <div className="config-colab-list">
                {/* Form de adicionar novo colaborador (primeiro item da lista) */}
                <div className="config-colab-item config-colab-add-form">
                    <input
                        type="text"
                        placeholder="Nome"
                        value={novoColabNome}
                        onChange={(e) => setNovoColabNome(e.target.value)}
                        className="config-colab-input"
                    />
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={novoColabEmail}
                        onChange={(e) => setNovoColabEmail(e.target.value)}
                        className="config-colab-input"
                    />
                    <button
                        onClick={handleAddColaborador}
                        className="btn-config-add"
                        disabled={!novoColabNome || !novoColabEmail}
                    >
                        Adicionar
                    </button>
                </div>

                {/* Lista de colaboradores */}
                {loadingColabs ? (
                    <p className="config-loading">Carregando...</p>
                ) : colaboradores.length === 0 ? (
                    <p className="config-empty">Nenhum colaborador encontrado.</p>
                ) : (
                    colaboradores.map(colab => (
                        <div key={colab.email} className="config-colab-item">
                            <div className="config-colab-info">
                                <span className="config-colab-name">{colab.name}</span>
                                <span className="config-colab-email">{colab.email}</span>
                            </div>
                            <div className="config-colab-actions">
                                <button
                                    className="config-colab-btn-crown"
                                    onClick={() => handlePromoverClick(colab)}
                                    title="Promover a Admin"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                                        <path d="M3 20h18" />
                                    </svg>
                                </button>
                                <button
                                    className="config-colab-btn-delete"
                                    onClick={() => handleDeleteClick(colab)}
                                    title="Excluir"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="config-page">
            {isAdmin ? (
                // Layout com menu lateral para admin
                <div className="config-layout-admin">
                    <aside className="config-sidebar">
                        <nav className="config-menu">
                            <button
                                className={activeMenu === 'perfil' ? 'active' : ''}
                                onClick={() => setActiveMenu('perfil')}
                            >
                                Meu Perfil
                            </button>
                            <button
                                className={activeMenu === 'empresa' ? 'active' : ''}
                                onClick={() => setActiveMenu('empresa')}
                            >
                                Minha Empresa
                            </button>
                        </nav>
                    </aside>
                    <main className="config-content">
                        {activeMenu === 'perfil' && renderPerfilSection()}
                        {activeMenu === 'empresa' && renderEmpresaSection()}
                    </main>
                </div>
            ) : (
                // Layout simples para worker
                <div className="config-layout-worker">
                    {renderPerfilSection()}
                </div>
            )}

            {showSenhaModal && (
                <AlterarSenhaModal onClose={() => setShowSenhaModal(false)} />
            )}

            {showPromocaoModal && colaboradorSelecionado && (
                <ConfirmarPromocaoModal
                    colaborador={colaboradorSelecionado}
                    onConfirm={handleConfirmPromover}
                    onClose={() => {
                        setShowPromocaoModal(false);
                        setColaboradorSelecionado(null);
                    }}
                />
            )}

            {showExclusaoModal && colaboradorSelecionado && (
                <ConfirmarExclusaoModal
                    colaborador={colaboradorSelecionado}
                    onConfirm={handleConfirmDelete}
                    onClose={() => {
                        setShowExclusaoModal(false);
                        setColaboradorSelecionado(null);
                    }}
                />
            )}
        </div>
    );
}
