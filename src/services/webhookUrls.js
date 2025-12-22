/**
 * webhookUrls.js
 * Arquivo central para armazenar todas as URLs de webhooks do n8n.
 * Exportações nomeadas para facilitar o import específico.
 */

// Autenticação
export const LOGIN_WEBHOOK = "https://webhook.garagem.dev.br/webhook/d56b699830e77ba53855679cb1d252da";

// Projetos
export const LISTAR_PROJETOS_WEBHOOK = "https://webhook.garagem.dev.br/webhook/bc1q9shqng58tykf3kmwukzez6h5xne559f5gfu2l8";
export const ATUALIZAR_STATUS_PROJETO_WEBHOOK = ""; // Preencher com URL do n8n

// Orçamentos
export const LISTAR_ORCAMENTOS_WEBHOOK = ""; // Preencher com URL do n8n
export const CRIAR_PROJETO_ORCAMENTO_WEBHOOK = "https://webhook.garagem.dev.br/webhook/85addbf8f3aacade12f58118d82accfe";
export const CONFIRMAR_REUNIAO_WEBHOOK = "https://webhook.garagem.dev.br/webhook/fa07740f8597406f394e68accc94c6dd";

// Etapas do Projeto (cards aprovados)
export const LISTAR_ETAPAS_PROJETO_WEBHOOK = "https://webhook.garagem.dev.br/webhook/5fecb1e8c964a865b16af83b6988458d";

// Perfil do Usuário
export const ALTERAR_NOME_WEBHOOK = "https://webhook.garagem.dev.br/webhook/5ff5284b84b8464ff2fa3cf80a440881";
export const ALTERAR_SENHA_WEBHOOK = "https://webhook.garagem.dev.br/webhook/60c8737c773aedd95205686f7d62c21f";
export const ATUALIZAR_FOTO_WEBHOOK = "https://webhook.garagem.dev.br/webhook/9920386dc9716f193ac62994b9f026cf";

// Gestão de Colaboradores (Admin)
export const ADICIONAR_COLABORADOR_WEBHOOK = "https://webhook.garagem.dev.br/webhook/a722c9dfdd0d4d52eff8cc5232471567";
export const EXCLUIR_COLABORADOR_WEBHOOK = "https://webhook.garagem.dev.br/webhook/f07aa4744681e28ed639e333586f1508";
export const PROMOVER_ADMIN_WEBHOOK = "https://webhook.garagem.dev.br/webhook/31c124ccc488e64584544f4c9a58efbc";
export const LISTAR_COLABORADORES_WEBHOOK = "https://webhook.garagem.dev.br/webhook/a65cba46c085de679461bf08f621410d";

// Resposta de Pausa de Etapa
export const RESPONDER_PAUSA_WEBHOOK = "https://webhook.garagem.dev.br/webhook/fb323187977fbc1cf8a9e6a46992803c";

// Confirmar Data de Entrega do Projeto
export const CONFIRMAR_ENTREGA_WEBHOOK = "https://webhook.garagem.dev.br/webhook/886f64feb1d466d9ec2e652866c72444";

// SLA - Suporte pós-entrega
export const ENVIAR_SLA_WEBHOOK = "https://webhook.garagem.dev.br/webhook/cadastra-novo-sla";
export const BUSCAR_SLA_WEBHOOK = "https://webhook.garagem.dev.br/webhook/60d73b261ef398f5908f195cb46e240a";
