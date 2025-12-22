import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import ProjetosPage from './routes/ProjetosPage';
import OrcamentosPage from './routes/OrcamentosPage';
import LoginPage from './routes/LoginPage';
import ConfiguracoesPage from './routes/ConfiguracoesPage';
import PrimeiroAcessoPage from './routes/PrimeiroAcessoPage';

function MainLayout({ children }) {
    const navigate = useNavigate();

    // Dados do usuário do localStorage
    const userName = localStorage.getItem('garagem_projetos_name') || 'Usuário';
    const userAvatar = localStorage.getItem('garagem_projetos_avatar');

    const handleLogout = () => {
        localStorage.removeItem('garagem_projetos_organization');
        localStorage.removeItem('garagem_projetos_message');
        localStorage.removeItem('garagem_projetos_name');
        localStorage.removeItem('garagem_projetos_email');
        localStorage.removeItem('garagem_projetos_avatar');
        localStorage.removeItem('garagem_projetos_client');
        window.location.href = '/login';
    };

    const handleProfileClick = () => {
        navigate('/configuracoes');
    };

    return (
        <div className="app-projetos">
            <header className="app-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="app-logo">
                        GARAGEM<span className="destaque">.</span>PROJETOS
                    </div>

                    <nav className="app-nav">
                        <NavLink
                            to="/projetos"
                            className={({ isActive }) => isActive ? 'active' : ''}
                        >
                            PROJETOS
                        </NavLink>
                        <NavLink
                            to="/orcamentos"
                            className={({ isActive }) => isActive ? 'active' : ''}
                        >
                            ORÇAMENTOS
                        </NavLink>
                    </nav>
                </div>

                <div className="app-header-actions">
                    <div className="user-profile-header" onClick={handleProfileClick}>
                        <div className="user-avatar">
                            {userAvatar ? (
                                <img src={userAvatar} alt="Avatar" />
                            ) : (
                                <span className="avatar-placeholder">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <span className="user-greeting">Olá, {userName}</span>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        Sair
                    </button>
                </div>
            </header>

            <main className="app-main">
                {children}
            </main>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rotas Públicas - Sem Layout */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/primeiro-acesso" element={<PrimeiroAcessoPage />} />

                {/* Rotas Protegidas (com Layout) */}
                <Route path="/" element={
                    <MainLayout>
                        <ProjetosPage />
                    </MainLayout>
                } />
                <Route path="/projetos" element={
                    <MainLayout>
                        <ProjetosPage />
                    </MainLayout>
                } />
                <Route path="/orcamentos" element={
                    <MainLayout>
                        <OrcamentosPage />
                    </MainLayout>
                } />
                <Route path="/configuracoes" element={
                    <MainLayout>
                        <ConfiguracoesPage />
                    </MainLayout>
                } />

                {/* Redirect Dashboard -> Projetos */}
                <Route path="/dashboard" element={<Navigate to="/projetos" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
