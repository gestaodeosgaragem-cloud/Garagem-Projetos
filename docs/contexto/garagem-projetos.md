# GARAGEM-PROJETOS

## 1. Resumo rápido
Aplicação web para clientes acompanharem o andamento de projetos e orçamentos em tempo real via Kanban.

## 2. Objetivo principal
Fornecer transparência total aos clientes do ecossistema Garagem, permitindo que visualizem o status de seus projetos, etapas em desenvolvimento e solicitem novos orçamentos de forma autônoma e centralizada.

## 3. Escopo atual
- **Aba Projetos**:
  - Kanban com colunas (Em espera, Aguardando Cliente, Desenvolvimento, Aguardando Aprovação, Concluído).
  - Modal de detalhes do projeto com lista de etapas (demandas) e status.
  - Indicadores de prazo e esforço.
- **Aba Orçamentos**:
  - Listagem por status (Solicitados, Reunião, Aprovados, Finalizados).
  - Wizard "Solicitar Novo Projeto" com formulário passo-a-passo.
- **Integração**:
  - Leitura e escrita de dados EXCLUSIVAMENTE via webhooks n8n.
  - Zero acesso direto ao banco de dados (Supabase) pelo front-end.
- **Interface**:
  - Tema visual "Garagem" (CSS global).
  - Responsividade para desktop e mobile.

## 4. Fora de escopo
- ~~Login/Autenticação complexa~~ → Implementado via webhook n8n.
- Painel administrativo para gestão interna (isso é feito no n8n/Supabase/Outro sistema).
- Chat em tempo real.

## 5. Arquitetura e fluxo de dados
- **Front-end**: React (Vite), SPA.
- **Back-end**: n8n (Orquestrador de regras de negócio e acesso a dados).
- **Banco de Dados**: Supabase (Acessado apenas pelo n8n).
- **Fluxo**: User Action -> React Component -> n8n Webhook -> Supabase -> Response -> React UI.

## 6. Integrações e webhooks
- `listarProjetos` (n8n)
- `listarOrcamentos` (n8n)
- `criarProjetoOrcamento` (n8n)
- `atualizarStatusProjeto` (n8n - se aplicável para o cliente)
- Brand CSS: `https://garagem-brand.vercel.app/garagem-theme.css`

## 7. Decisões já tomadas
- [2025-12-10] Uso obrigatório do tema CSS da Garagem sem Tailwind.
- [2025-12-10] Proibição de chamadas diretas ao Supabase no front-end.
- [2025-12-10] Estrutura de navegação simplificada em abas (Projetos / Orçamentos).
- [2025-12-10] Login implementado via webhook n8n com hash MD5 da senha.
- [2025-12-10] Projetos carregados por `organization` retornada no login.

## 8. Premissas e restrições
- Idioma PT-BR obrigatório.
- Design deve priorizar a estética "Premium" e "Garagem".
- Tratamento de erros amigável caso o n8n falhe ou mude contrato.

## 9. Riscos e pontos de atenção
- Dependência da disponibilidade dos webhooks do n8n.
- Mudanças na estrutura de resposta do n8n podem quebrar a UI (necessário logar erros no console).
- Performance se houver muitos projetos (paginação não citada no escopo inicial).

## 10. Histórico de mudanças de escopo
- [2025-12-10] Criação inicial do contexto.
- [2025-12-10] Login adicionado ao escopo (via webhook n8n).
- [2025-12-10] Projetos agora carregados com base na `organization` do usuário logado.
