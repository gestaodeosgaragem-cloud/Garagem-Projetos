import React, { useState } from 'react';

import { LOGIN_WEBHOOK } from '../services/webhookUrls';
import { hashPassword } from '../utils/crypto';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        // Validação simples
        if (!email || !password) {
            console.warn('⚠️ Campos vazios');
            setErrorMessage("Preencha e-mail e senha.");
            return;
        }

        const passwordHash = hashPassword(password);

        console.log('🚀 Tentando login em:', LOGIN_WEBHOOK);
        console.log('📤 Payload:', { email, password: passwordHash });

        setIsSubmitting(true);

        try {
            const response = await fetch(LOGIN_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password: passwordHash }),
            });

            console.log('📥 Status da resposta:', response.status);

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const result = await response.json();
            console.log('📦 Resposta completa:', result);

            // Formato de resposta do n8n: [{ response: { body: {...} } }]
            // Extrair o body da resposta
            let loginData = result;
            if (Array.isArray(result) && result[0]?.response?.body) {
                loginData = result[0].response.body;
            }

            if (loginData.code === "200") {
                // Salvar dados no localStorage
                localStorage.setItem('garagem_projetos_organization', loginData.organization);

                // Salvar organization_id (necessário para webhooks)
                if (loginData.organization_id) {
                    localStorage.setItem('organization_id', loginData.organization_id);
                }

                // Salvar dados do perfil do usuário
                if (loginData.name) {
                    localStorage.setItem('garagem_projetos_name', loginData.name);
                }
                // Salvar email (do formulário ou da resposta)
                localStorage.setItem('garagem_projetos_email', email);
                localStorage.setItem('user_email', email); // Compatível com outros modais

                if (loginData.picture_url) {
                    localStorage.setItem('garagem_projetos_avatar', loginData.picture_url);
                }
                if (loginData.client) {
                    localStorage.setItem('garagem_projetos_client', loginData.client);
                }

                console.log('✅ Login bem-sucedido. Organization:', loginData.organization, 'ID:', loginData.organization_id);

                // Redirecionamento para o dashboard/projetos
                window.location.href = "/projetos";
            } else {
                // Erro controlado do backend
                setErrorMessage(loginData.data || loginData.message || "Falha ao autenticar.");
            }

        } catch (error) {
            console.error(error);
            setErrorMessage("Erro inesperado ao tentar fazer login. Verifique sua conexão e tente novamente.");
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

                    {/* Card de Login */}
                    <section className="card card-escuro" style={{ maxWidth: "420px", width: "100%", background: "var(--bg-secundario)" }}>
                        <h1 className="mb-2rem text-center" style={{ textAlign: "center", color: 'white' }}>Entrar</h1>

                        {errorMessage && (
                            <div className="mb-2rem">
                                <p style={{ color: "#D93030", textAlign: "left", fontWeight: "bold" }}>
                                    {errorMessage}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-2rem" style={{ textAlign: "left" }}>
                                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>E-mail</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                    required
                                />
                            </div>

                            <div className="mb-2rem" style={{ textAlign: "left" }}>
                                <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Senha</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                    required
                                />
                            </div>

                            <div className="mb-2rem">
                                <button
                                    type="submit"
                                    className="botao flex centralizado"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Entrando..." : "Entrar"}
                                </button>
                            </div>

                            <div className="text-center" style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', opacity: 0.4, color: 'white' }}>
                                    Esqueceu a senha? Em breve teremos recuperação de acesso.
                                </p>
                            </div>
                        </form>
                    </section>

                </div>
            </main>
        </div>
    );
}
