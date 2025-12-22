import React, { useState } from 'react';
import { ALTERAR_SENHA_WEBHOOK } from '../../services/webhookUrls';
import { hashPassword } from '../../utils/crypto';

// Ícone de olho aberto (senha visível)
const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

// Ícone de olho fechado (senha oculta)
const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

export default function AlterarSenhaModal({ onClose }) {
    const userEmail = localStorage.getItem('garagem_projetos_email') || '';

    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados para visibilidade das senhas
    const [showSenhaAtual, setShowSenhaAtual] = useState(false);
    const [showNovaSenha, setShowNovaSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validações
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            setError('Preencha todos os campos.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setError('As senhas não coincidem.');
            return;
        }

        if (novaSenha.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            // Envia: email, password (nova senha hasheada), old_password (para validação)
            const response = await fetch(ALTERAR_SENHA_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    password: hashPassword(novaSenha),
                    old_password: hashPassword(senhaAtual)
                })
            });

            const result = await response.json();

            if (response.ok && (result.success || result.code === '200')) {
                setSuccess('Senha alterada com sucesso!');
                setTimeout(() => onClose(), 2000);
            } else {
                setError(result.message || 'Erro ao alterar senha. Verifique a senha atual.');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    // Estilos do botão de olho (sem hover/animação)
    const eyeButtonStyle = {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'rgba(255,255,255,0.5)',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-senha-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Alterar Senha</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="modal-field">
                        <label>Senha Atual</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showSenhaAtual ? 'text' : 'password'}
                                value={senhaAtual}
                                onChange={(e) => setSenhaAtual(e.target.value)}
                                placeholder="Digite sua senha atual"
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                                style={eyeButtonStyle}
                            >
                                {showSenhaAtual ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <div className="modal-field">
                        <label>Nova Senha</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showNovaSenha ? 'text' : 'password'}
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                                placeholder="Digite a nova senha"
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNovaSenha(!showNovaSenha)}
                                style={eyeButtonStyle}
                            >
                                {showNovaSenha ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <div className="modal-field">
                        <label>Confirmar Nova Senha</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmarSenha ? 'text' : 'password'}
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                placeholder="Confirme a nova senha"
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                                style={eyeButtonStyle}
                            >
                                {showConfirmarSenha ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="modal-error">{error}</p>}
                    {success && <p className="modal-success">{success}</p>}

                    <button
                        type="submit"
                        className="btn-modal-submit"
                        disabled={loading}
                    >
                        {loading ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
}
