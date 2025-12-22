import React, { useState } from 'react';

export default function ConfirmarExclusaoModal({ colaborador, onConfirm, onClose }) {
    const [nomeInput, setNomeInput] = useState('');
    const [fraseInput, setFraseInput] = useState('');
    const [erros, setErros] = useState({});
    const [loading, setLoading] = useState(false);

    const fraseCorreta = 'excluir colaborador';

    const handleConfirm = async () => {
        const novosErros = {};

        if (nomeInput !== colaborador.name) {
            novosErros.nome = 'O nome digitado está incorreto';
        }

        if (fraseInput.toLowerCase() !== fraseCorreta) {
            novosErros.frase = 'A frase de confirmação está incorreta';
        }

        if (Object.keys(novosErros).length > 0) {
            setErros(novosErros);
            return;
        }

        setLoading(true);
        await onConfirm(colaborador.email);
        setLoading(false);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-confirmacao-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Excluir Colaborador</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <p className="modal-confirmacao-aviso modal-confirmacao-danger">
                        Você está prestes a excluir <strong>{colaborador.name}</strong> da empresa.
                        Esta ação não pode ser desfeita.
                    </p>

                    <div className="modal-field">
                        <label>Digite '{colaborador.name}' para confirmar:</label>
                        <input
                            type="text"
                            value={nomeInput}
                            onChange={(e) => {
                                setNomeInput(e.target.value);
                                setErros({ ...erros, nome: null });
                            }}
                            placeholder={colaborador.name}
                        />
                        {erros.nome && <span className="modal-error">{erros.nome}</span>}
                    </div>

                    <div className="modal-field">
                        <label>Digite '{fraseCorreta}' para confirmar:</label>
                        <input
                            type="text"
                            value={fraseInput}
                            onChange={(e) => {
                                setFraseInput(e.target.value);
                                setErros({ ...erros, frase: null });
                            }}
                            placeholder={fraseCorreta}
                        />
                        {erros.frase && <span className="modal-error">{erros.frase}</span>}
                    </div>

                    <div className="modal-confirmacao-actions">
                        <button
                            className="btn-modal-cancelar"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn-modal-confirmar btn-modal-danger"
                            onClick={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? 'Excluindo...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
