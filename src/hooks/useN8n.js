import { useState, useEffect } from 'react';

/**
 * Hook flexível para buscar dados do n8n (webhooksN8n.jsx).
 * Centraliza o estado de loading, erro e os dados.
 * 
 * @param {Function} fetchFunction - Função async importada de webhooksN8n.jsx
 * @param {Array} dependencies - Dependências do useEffect (opcional)
 */
export function useN8n(fetchFunction, dependencies = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const resp = await fetchFunction();

                if (!mounted) return;

                if (resp.success) {
                    setData(resp.data);
                } else {
                    // Se o n8n retornou erro controlado
                    setError(resp.error || 'Erro desconhecido do servidor.');
                    // Em caso de erro, definimos data como vazio seguro dependendo do contexto?
                    // Aqui deixamos null, mas o componente deve tratar.
                }
            } catch (err) {
                if (mounted) {
                    setError(err.message || 'Falha na comunicação.');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        if (fetchFunction) {
            load();
        }

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return { data, loading, error, setData };
}
