import { useState } from 'react';
import { ModalSistema } from './ModalSistema';
import { FormInput } from '../FormInput/FormInput';
import { BotaoSistema } from '../Botao/BotaoSistema';
import { alterarSenha } from '../../api/api';

const senhaForte = (s) =>
  s.length >= 8 &&
  s.length <= 72 &&
  /[@#%*!$&^\-_+=\[{\]:;'"<>,.?\/|\\]/.test(s) &&
  /[A-Z]/.test(s) &&
  /[a-z]/.test(s) &&
  /\d/.test(s);

export function ModalAlterarSenha({ aberto = false, onClose, onSalvo }) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const limpar = () => {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setErro('');
  };

  const fechar = () => {
    limpar();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (carregando) return;
    setErro('');

    if (!senhaForte(novaSenha)) {
      setErro('A nova senha precisa ter de 8 a 72 caracteres, 1 símbolo (@#%*), uma letra maiúscula, uma minúscula e um número.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('A confirmação não coincide com a nova senha.');
      return;
    }

    setCarregando(true);
    try {
      await alterarSenha(senhaAtual, novaSenha);
      limpar();
      if (onSalvo) onSalvo();
      onClose();
    } catch (err) {
      setErro(
        err.message === 'Failed to fetch'
          ? 'Não foi possível conectar ao servidor. Tente novamente.'
          : err.status === 401
            ? 'Sua sessão expirou. Entre novamente.'
            : err.message
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ModalSistema aberto={aberto} onClose={fechar} titulo="Alterar Senha" tamanho="sm">
      <form onSubmit={handleSubmit}>
        {erro && (
          <div className="alert alert-danger py-2 px-3 fs-6 mb-3" role="alert">
            {erro}
          </div>
        )}

        <div className="mb-2">
          <FormInput
            id="senha-atual"
            label="Senha Atual"
            type="password"
            isPasswordToggle
            placeholder="Digite sua senha atual"
            value={senhaAtual}
            onChange={(e) => { setSenhaAtual(e.target.value); setErro(''); }}
            required
          />
        </div>

        <div className="mb-2">
          <FormInput
            id="nova-senha"
            label="Nova Senha"
            type="password"
            isPasswordToggle
            placeholder="Digite a nova senha"
            value={novaSenha}
            onChange={(e) => { setNovaSenha(e.target.value); setErro(''); }}
            required
          />
        </div>

        <div className="mb-3">
          <FormInput
            id="confirmar-nova-senha"
            label="Confirmar Nova Senha"
            type="password"
            isPasswordToggle
            placeholder="Confirme a nova senha"
            value={confirmarSenha}
            onChange={(e) => { setConfirmarSenha(e.target.value); setErro(''); }}
            required
          />
        </div>

        <div className="is-modal-actions">
          <BotaoSistema variante="orange" tipo="submit" className="fs-6" disabled={carregando}>
            {carregando ? 'Salvando...' : 'Salvar Nova Senha'}
          </BotaoSistema>
          <BotaoSistema variante="outline-green" tipo="button" className="fs-6" onClick={fechar}>
            Cancelar
          </BotaoSistema>
        </div>
      </form>
    </ModalSistema>
  );
}

export default ModalAlterarSenha;