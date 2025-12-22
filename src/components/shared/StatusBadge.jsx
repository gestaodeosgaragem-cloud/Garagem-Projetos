import React from 'react';

/**
 * Componente centralizado para Badges de Status.
 * Mapeia todos os estados do sistema (Kanban, Orçamentos, Etapas) para cores do tema.
 */
export default function StatusBadge({ status, type = 'default', className = '' }) {

    // Mapa de estilos por status
    // Padrão: bg-cor/20 text-cor border-cor/30
    const statusMap = {
        // Kanban Projetos
        'Em espera': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        'Aguardando Cliente': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
        'Desenvolvimento': 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse-slow',
        'Aguardando Aprovação': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'Concluído': 'bg-green-500/20 text-green-400 border-green-500/30',

        // Etapas Internas
        'Produzindo': 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse-slow',
        'Pendente': 'bg-gray-600/20 text-gray-500 border-gray-600/30',

        // Orçamentos
        'Solicitados': 'bg-blue-500/20 text-blue-400',
        'Reunião Agendada': 'bg-yellow-500/20 text-yellow-400',
        'Aprovados': 'bg-green-500/20 text-green-400',
        'Finalizados': 'bg-gray-600/20 text-gray-400 decoration-line-through',

        // Default
        'default': 'bg-gray-800 text-gray-400 border-gray-700'
    };

    const styleClass = statusMap[status] || statusMap['default'];

    return (
        <span
            className={`
        inline-flex items-center justify-center px-2 py-0.5 
        text-[10px] font-bold uppercase tracking-wider 
        border rounded select-none
        ${styleClass} 
        ${className}
      `}
        >
            {status}
        </span>
    );
}
