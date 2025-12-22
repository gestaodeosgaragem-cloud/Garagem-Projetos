import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hashPassword } from '../utils/crypto';

// Webhook para validar key e salvar senha
const PRIMEIRO_ACESSO_WEBHOOK = 'https://webhook.garagem.dev.br/webhook/e2d35e5186fdf8c179fb823ad12627ca';

export default function PrimeiroAcessoPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [key, setKey] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [keyInvalida, setKeyInvalida] = useState(false);

    // Ler key da URL ao carregar
    useEffect(() => {
        const keyFromUrl = searchParams.get('key');
        if (keyFromUrl) {
            setKey(keyFromUrl);
        } else {
            setKeyInvalida(true);
            setErrorMessage('Link inválido. Verifique o link enviado por e-mail.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        // Validações
        if (!novaSenha || !confirmarSenha) {
            setErrorMessage('Preencha todos os campos.');
            return;
        }

        if (novaSenha.length < 6) {
            setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setErrorMessage('As senhas não coincidem.');
            return;
        }

        if (!key) {
            setErrorMessage('Chave de acesso não encontrada.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Hash da senha antes de enviar
            const senhaHash = hashPassword(novaSenha);

            const response = await fetch(PRIMEIRO_ACESSO_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: key,
                    nova_senha: senhaHash
                })
            });

            const result = await response.json();

            // Verifica resposta do webhook
            if (result.success || result.code === '200' || response.ok) {
                setSuccessMessage('Senha criada com sucesso! Você será redirecionado para o login.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setErrorMessage(result.message || 'Erro ao criar senha. Verifique se o link ainda é válido.');
            }
        } catch (error) {
            console.error('Erro ao criar senha:', error);
            setErrorMessage('Erro de conexão. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fundo-escuro" style={{ minHeight: "100vh" }}>
            <main className="container secao">
                <div className="flex flex-col centralizado">

                    {/* Cabeçalho / Logo */}
                    <div className="mb-3rem text-center" style={{ textAlign: 'center' }}>
                        {/* Logo conforme tema */}
                        <div className="logo logo-md mb-2rem" style={{ margin: '0 auto 2rem auto' }} />
                        <p className="text-white opacity-70">
                            GARAGEM-PROJETOS
                        </p>
                    </div>

                    {/* Card de Criar Senha */}
                    <section className="card card-escuro" style={{ maxWidth: "420px", width: "100%", background: "var(--bg-secundario)" }}>
                        <h1 className="mb-2rem text-center" style={{ textAlign: "center", color: 'white' }}>Criar Senha</h1>

                        {/* Mensagem de Sucesso */}
                        {successMessage && (
                            <div className="mb-2rem" style={{
                                background: 'rgba(34, 197, 94, 0.15)',
                                border: '1px solid #22c55e',
                                borderRadius: '8px',
                                padding: '1rem',
                                textAlign: 'center'
                            }}>
                                <p style={{ color: '#22c55e', fontWeight: 'bold', margin: 0 }}>
                                    ✓ {successMessage}
                                </p>
                            </div>
                        )}

                        {/* Mensagem de Erro */}
                        {errorMessage && (
                            <div className="mb-2rem">
                                <p style={{ color: "#D93030", textAlign: "left", fontWeight: "bold" }}>
                                    {errorMessage}
                                </p>
                            </div>
                        )}

                        {/* Formulário (só mostra se key válida e não teve sucesso) */}
                        {!keyInvalida && !successMessage && (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-2rem" style={{ textAlign: "left" }}>
                                    <label htmlFor="novaSenha" style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Nova Senha</label>
                                    <input
                                        id="novaSenha"
                                        type="password"
                                        value={novaSenha}
                                        onChange={(e) => setNovaSenha(e.target.value)}
                                        placeholder="Digite sua nova senha"
                                        style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                        disabled={isSubmitting}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="mb-2rem" style={{ textAlign: "left" }}>
                                    <label htmlFor="confirmarSenha" style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Confirmar Senha</label>
                                    <input
                                        id="confirmarSenha"
                                        type="password"
                                        value={confirmarSenha}
                                        onChange={(e) => setConfirmarSenha(e.target.value)}
                                        placeholder="Confirme sua nova senha"
                                        style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                        disabled={isSubmitting}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="mb-2rem">
                                    <button
                                        type="submit"
                                        className="botao flex centralizado"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Criando..." : "Criar Senha"}
                                    </button>
                                </div>

                                <div className="text-center" style={{ textAlign: 'center', marginTop: '1rem' }}>
                                    <a
                                        href="/login"
                                        style={{
                                            color: 'var(--garagem-magenta, #E41F7B)',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        ← Voltar para o Login
                                    </a>
                                </div>
                            </form>
                        )}

                        {/* Link para voltar ao login (quando key inválida) */}
                        {keyInvalida && (
                            <div className="text-center" style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <a
                                    href="/login"
                                    style={{
                                        color: 'var(--garagem-magenta, #E41F7B)',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    ← Voltar para o Login
                                </a>
                            </div>
                        )}
                    </section>

                </div>
            </main>
        </div>
    );
}
