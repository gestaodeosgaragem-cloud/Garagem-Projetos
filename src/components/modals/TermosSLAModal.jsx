import React from 'react';

/**
 * Modal para exibir os Termos de SLA completos
 * Usa classes únicas com prefixo "sla-termos-"
 */
export default function TermosSLAModal({ onClose }) {
    return (
        <div className="sla-termos-overlay" onClick={onClose}>
            <div className="sla-termos-modal" onClick={(e) => e.stopPropagation()}>
                <div className="sla-termos-header">
                    <h2>📋 Termos de SLA</h2>
                    <button className="sla-termos-close" onClick={onClose}>✕</button>
                </div>

                <div className="sla-termos-body">
                    {/* 1. OBJETO DO SLA */}
                    <section className="sla-section">
                        <h3>🔷 1. OBJETO DO SLA</h3>
                        <p><strong>Este SLA define:</strong></p>
                        <ul>
                            <li>horários de atendimento,</li>
                            <li>canais de suporte,</li>
                            <li>procedimentos,</li>
                            <li>prioridades,</li>
                            <li>prazos máximos de resposta,</li>
                            <li>prazos máximos de solução,</li>
                            <li>limitações do suporte,</li>
                            <li>itens excluídos.</li>
                        </ul>
                        <p><strong>O SLA aplica-se exclusivamente à:</strong></p>
                        <ul>
                            <li>plataforma MoneySage,</li>
                            <li>bot WhatsApp,</li>
                            <li>backend,</li>
                            <li>PWA,</li>
                            <li>OCR,</li>
                            <li>IA convencional textual,</li>
                            <li>painéis administrativos.</li>
                        </ul>
                        <p className="sla-note">Não se aplica a novas funcionalidades ou melhorias evolutivas.</p>
                    </section>

                    {/* 2. DEFINIÇÕES */}
                    <section className="sla-section">
                        <h3>🔷 2. DEFINIÇÕES</h3>
                        <p>Para fins deste SLA, considera-se:</p>

                        <h4>2.1. Manutenção Corretiva</h4>
                        <p>Correção de erros, bugs ou falhas técnicas que impeçam ou comprometam o funcionamento de funcionalidades existentes no ESCOPO FECHADO.</p>

                        <h4>2.2. Suporte Técnico</h4>
                        <p>Atendimento destinado a orientar, esclarecer dúvidas ou auxiliar na utilização correta da plataforma.</p>

                        <h4>2.3. Atendimento Emergencial</h4>
                        <p>Situações onde a plataforma está totalmente indisponível (downtime total).</p>

                        <h4>2.4. Canal Oficial</h4>
                        <p>Todos os atendimentos serão feitos exclusivamente por:</p>
                        <ul>
                            <li>E-mail oficial da CONTRATADA</li>
                            <li>Canal privado no WhatsApp Business (número fornecido após assinatura)</li>
                        </ul>
                        <p className="sla-note">Nenhum outro canal terá validade contratual.</p>
                    </section>

                    {/* 3. HORÁRIOS DE ATENDIMENTO */}
                    <section className="sla-section">
                        <h3>🔷 3. HORÁRIOS DE ATENDIMENTO (SUPORTE REGULAR)</h3>
                        <p>O suporte será prestado nos seguintes horários:</p>
                        <p><strong>🕘 Segunda a Sexta-feira</strong><br />09h às 18h (horário de Brasília)</p>
                        <p><strong>⛔ Sábados, domingos e feriados nacionais</strong> – sem suporte regular.</p>
                        <p className="sla-note">Suporte fora do horário será tratado como próximo dia útil.</p>
                    </section>

                    {/* 4. ATENDIMENTO EMERGENCIAL */}
                    <section className="sla-section">
                        <h3>🔷 4. ATENDIMENTO EMERGENCIAL (24h / 7 dias)</h3>
                        <p>Apenas nos seguintes casos:</p>
                        <ul>
                            <li>indisponibilidade total da plataforma;</li>
                            <li>indisponibilidade total do bot WhatsApp;</li>
                            <li>falha grave que impossibilite login ou acesso das usuárias;</li>
                            <li>queda completa do backend.</li>
                        </ul>
                        <p className="sla-note">Se a falha for causada por terceiros (provedor, API, nuvem), o atendimento será feito em best effort, sem garantia de prazo.</p>
                    </section>

                    {/* 5. PRIORIDADES E PRAZOS */}
                    <section className="sla-section">
                        <h3>🔷 5. PRIORIDADES E PRAZOS DE ATENDIMENTO</h3>
                        <p>Cada solicitação será classificada conforme tabela abaixo.</p>

                        <h4>5.1. Prioridade 1 – Crítica (Emergencial)</h4>
                        <p><strong>Situações:</strong></p>
                        <ul>
                            <li>plataforma indisponível,</li>
                            <li>login não funciona para nenhuma usuária,</li>
                            <li>bot WhatsApp totalmente inoperante,</li>
                            <li>OCR travando backend,</li>
                            <li>falha sistêmica generalizada.</li>
                        </ul>
                        <div className="sla-prazos">
                            <p><strong>Tempo máximo de resposta:</strong> Até 2 horas quando reportado entre 06h e 00h America/São Paulo</p>
                            <p><strong>Tempo máximo de solução:</strong> Até 24 horas, salvo se depender de serviços externos.</p>
                        </div>

                        <h4>5.2. Prioridade 2 – Alta</h4>
                        <p><strong>Situações:</strong></p>
                        <ul>
                            <li>funcionalidade essencial não funciona (registro de transações, metas, notificações);</li>
                            <li>erros que impedem operação normal para uma parte das usuárias;</li>
                            <li>lentidões severas.</li>
                        </ul>
                        <div className="sla-prazos">
                            <p><strong>Tempo máximo de resposta:</strong> Até 1 dia útil</p>
                            <p><strong>Tempo máximo de solução:</strong> 2 a 5 dias úteis</p>
                        </div>

                        <h4>5.3. Prioridade 3 – Média</h4>
                        <p><strong>Situações:</strong></p>
                        <ul>
                            <li>erros visuais ou de interface,</li>
                            <li>instabilidade não impeditiva,</li>
                            <li>falhas em relatórios não essenciais,</li>
                            <li>inconsistências de comportamento não críticas.</li>
                        </ul>
                        <div className="sla-prazos">
                            <p><strong>Tempo máximo de resposta:</strong> 2 dias úteis</p>
                            <p><strong>Tempo máximo de solução:</strong> Até 10 dias úteis</p>
                        </div>

                        <h4>5.4. Prioridade 4 – Baixa</h4>
                        <p><strong>Situações:</strong></p>
                        <ul>
                            <li>dúvidas de uso,</li>
                            <li>melhoria pontual não crítica,</li>
                            <li>refinamentos estéticos,</li>
                            <li>sugestões.</li>
                        </ul>
                        <div className="sla-prazos">
                            <p><strong>Tempo máximo de resposta:</strong> Até 3 dias úteis</p>
                            <p><strong>Tempo máximo de solução:</strong> Até 20 dias úteis (se aplicável)</p>
                        </div>
                    </section>

                    {/* 6. O QUE ESTÁ INCLUÍDO */}
                    <section className="sla-section">
                        <h3>🔷 6. O QUE ESTÁ INCLUÍDO NO SLA</h3>

                        <h4>6.1. Correção de Bugs</h4>
                        <ul>
                            <li>falhas técnicas que impeçam o uso normal,</li>
                            <li>erros causados por código entregue pela CONTRATADA,</li>
                            <li>problemas decorrentes de atualizações internas.</li>
                        </ul>

                        <h4>6.2. Ajustes de Estabilidade</h4>
                        <ul>
                            <li>otimizações pequenas de performance,</li>
                            <li>melhoria de tempo de resposta básico,</li>
                            <li>ajustes de compatibilidade entre navegador e PWA.</li>
                        </ul>

                        <h4>6.3. Suporte Operacional</h4>
                        <ul>
                            <li>dúvidas gerais de uso,</li>
                            <li>orientações sobre boas práticas,</li>
                            <li>instrução para o uso adequado das funcionalidades existentes.</li>
                        </ul>
                    </section>

                    {/* 7. EXCLUSÕES */}
                    <section className="sla-section">
                        <h3>🔷 7. O QUE NÃO ESTÁ INCLUÍDO (EXCLUSÕES DO SLA)</h3>
                        <p>Esses itens não fazem parte do escopo de manutenção, mesmo que relacionados às funcionalidades:</p>

                        <h4>❌ 7.1. Features evolutivas</h4>
                        <p>Qualquer nova funcionalidade não especificada no ESCOPO TÉCNICO, incluindo:</p>
                        <ul>
                            <li>novos módulos,</li>
                            <li>gráficos avançados,</li>
                            <li>IA nova,</li>
                            <li>telas novas,</li>
                            <li>sistema multi-contas,</li>
                            <li>automações complexas.</li>
                        </ul>

                        <h4>❌ 7.2. Manutenções causadas pela CONTRATANTE</h4>
                        <ul>
                            <li>alterações indevidas,</li>
                            <li>integrações feitas por terceiros,</li>
                            <li>inserção de dados incorretos,</li>
                            <li>manipulação no servidor,</li>
                            <li>uso incorreto que rompa fluxos.</li>
                        </ul>

                        <h4>❌ 7.3. Problemas em serviços externos</h4>
                        <ul>
                            <li>provedores de hospedagem,</li>
                            <li>APIs de terceiros,</li>
                            <li>conectores,</li>
                            <li>WhatsApp (Meta),</li>
                            <li>serviços de OCR externos.</li>
                        </ul>
                        <p className="sla-note">Não há SLA nesses casos.</p>

                        <h4>❌ 7.4. Suporte a infraestrutura</h4>
                        <ul>
                            <li>DevOps avançado,</li>
                            <li>backup automático,</li>
                            <li>restauração completa de ambiente,</li>
                            <li>criação de ambientes de staging ou production,</li>
                            <li>segurança avançada,</li>
                            <li>monitoramento 24/7,</li>
                            <li>alta disponibilidade.</li>
                        </ul>

                        <h4>❌ 7.5. Atendimentos fora do horário</h4>
                        <p>Exceto indisponibilidade total (Prioridade 1).</p>
                    </section>

                    {/* 8. RESPONSABILIDADES */}
                    <section className="sla-section">
                        <h3>🔷 8. RESPONSABILIDADES DA CONTRATANTE NO SLA</h3>
                        <p>A CONTRATANTE se compromete a:</p>
                        <ul>
                            <li>relatar corretamente os erros;</li>
                            <li>enviar prints, vídeos e passos para reprodução;</li>
                            <li>não acionar suporte por canais não oficiais;</li>
                            <li>não modificar código, banco ou infraestrutura;</li>
                            <li>fornecer acesso quando solicitado;</li>
                            <li>manter servidores e provedores ativos e pagos.</li>
                        </ul>
                        <p className="sla-note">Se não cumprir, o SLA é automaticamente suspenso até regularização.</p>
                    </section>

                    {/* 9. SUSPENSÃO */}
                    <section className="sla-section">
                        <h3>🔷 9. SUSPENSÃO DO SLA</h3>
                        <p>O SLA será automaticamente suspenso quando:</p>
                        <ul>
                            <li>houver atraso em pagamentos;</li>
                            <li>houver intervenção técnica indevida da CONTRATANTE;</li>
                            <li>houver integrações não autorizadas;</li>
                            <li>o ambiente de hospedagem não estiver funcional;</li>
                            <li>houver tentativas de engenharia reversa;</li>
                            <li>houver adulteração de código por terceiros.</li>
                        </ul>
                        <p className="sla-note">Durante suspensão, não há obrigação de suporte ou manutenção.</p>
                    </section>

                    {/* 10. LIMITAÇÃO */}
                    <section className="sla-section">
                        <h3>🔷 10. LIMITAÇÃO DE RESPONSABILIDADE (INTEGRADA AO SLA)</h3>
                        <p>A CONTRATADA não garante:</p>
                        <ul>
                            <li>uptime de 100%,</li>
                            <li>ausência total de falhas,</li>
                            <li>compatibilidade com todos os dispositivos,</li>
                            <li>performance idêntica entre navegadores,</li>
                            <li>funcionamento de APIs externas.</li>
                        </ul>
                        <p className="sla-note">Responsabilidade máxima permanece limitada ao valor já pago, conforme o contrato principal.</p>
                    </section>

                    {/* 11. PRAZOS */}
                    <section className="sla-section">
                        <h3>🔷 11. PRAZOS DE SLA E MANUTENÇÃO GRATUITA</h3>
                        <p>A manutenção corretiva está incluída por <strong>12 meses</strong>, contados da entrega da V1 funcional e disponível para comercialização.</p>
                        <p>Após esse período:</p>
                        <ul>
                            <li>qualquer correção, ajuste ou suporte será orçado separadamente,</li>
                            <li>ou poderá ser contratado um plano de suporte contínuo.</li>
                        </ul>
                    </section>

                    {/* 12. CANCELAMENTO */}
                    <section className="sla-section">
                        <h3>🔷 12. CANCELAMENTO DO SLA</h3>
                        <p>O SLA é automaticamente encerrado quando:</p>
                        <ul>
                            <li>contrato principal for rescindido por qualquer parte;</li>
                            <li>houver inadimplência;</li>
                            <li>houver violação contratual grave;</li>
                            <li>término do período de 12 meses.</li>
                        </ul>
                    </section>

                    {/* 13. ESCOPO FECHADO */}
                    <section className="sla-section">
                        <h3>🔷 13. ESCOPO FECHADO DO SLA</h3>
                        <p className="sla-final">Qualquer item não listado como "incluído" é automaticamente considerado excluído, salvo contratação adicional mediante proposta comercial formal.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
