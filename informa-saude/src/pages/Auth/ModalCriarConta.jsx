import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AuthModalLayout } from './AuthModalLayout';
import { FormInput } from '../../components';
import {
  cadastrar,
  entrar,
  buscarPerfil,
  verificarEmail,
  reenviarCodigoCadastro
} from '../../api/api';
import { useUser } from '../../context/UserContext';
import VerifyCode from '../RecoverPassword/Codeverify/Codeverify';

const OPCOES_SEXO = [
  { id: 'sexoFem', valor: 'Feminino' },
  { id: 'sexoMasc', valor: 'Masculino' },
  { id: 'sexoOutro', valor: 'Outro / Prefiro não informar' }
];

const validarDataNascimento = (dataStr) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) return false;
  const [diaStr, mesStr, anoStr] = dataStr.split('/');
  const dia = parseInt(diaStr, 10);
  const mes = parseInt(mesStr, 10);
  const ano = parseInt(anoStr, 10);
  const anoAtual = new Date().getFullYear();

  if (mes < 1 || mes > 12) return false;
  if (ano < 1900 || ano > anoAtual) return false;

  const diasNoMes = new Date(ano, mes, 0).getDate();
  return dia >= 1 && dia <= diasNoMes;
};
const converterDataParaApi = (dataStr) => {
  const [dia, mes, ano] = dataStr.split('/');
  return `${ano}-${mes}-${dia}`;
};

const validarRequisitosSenha = (senha) => {
  const minCaracteres = senha.length >= 8 && senha.length <= 72;
  const temSimbolo = /[@#%*!$&&^\-_+=\[{\]:;'"<>,.?\/|\\]/.test(senha);
  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);
  const temNumero = /\d/.test(senha);

  return {
    valido: minCaracteres && temSimbolo && temMaiuscula && temMinuscula && temNumero,
    minCaracteres,
    temSimbolo,
    temMaiuscula,
    temMinuscula,
    temNumero
  };
};

const mensagemDeErro = (err) =>
  err.message === 'Failed to fetch'
    ? 'Não foi possível conectar ao servidor. Tente novamente.'
    : err.message;

export function ModalCriarConta({ onClose, onAbrirLogin }) {
  const navigate = useNavigate();
  const { atualizarUsuario } = useUser();

  const [etapaCadastro, setEtapaCadastro] = useState(1);
  const [dadosCadastro, setDadosCadastro] = useState({
    nome: '',
    dataNascimento: '',
    sexo: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });
  const [erroEtapa1, setErroEtapa1] = useState('');
  const [erroEtapa2, setErroEtapa2] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [emailPendente, setEmailPendente] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleAvancarCadastroEtapa1 = (e) => {
    e.preventDefault();
    if (!validarDataNascimento(dadosCadastro.dataNascimento)) {
      setErroEtapa1('Por favor, digite uma data de nascimento válida (DD/MM/AAAA).');
      return;
    }
    setErroEtapa1('');
    setEtapaCadastro(2);
  };

  const handleFinalizarCadastro = async (e) => {
    e.preventDefault();
    setErroEtapa2('');

    const statusSenha = validarRequisitosSenha(dadosCadastro.senha);
    if (!statusSenha.valido) {
      setErroEtapa2('A senha precisa atender a todos os requisitos mínimos listados abaixo.');
      return;
    }

    if (dadosCadastro.senha !== dadosCadastro.confirmarSenha) {
      setErroEtapa2('A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    const email = dadosCadastro.email.trim().toLowerCase();
    setCarregando(true);

    try {
      await cadastrar({
        nome: dadosCadastro.nome.trim(),
        email,
        senha: dadosCadastro.senha,
        sexo: dadosCadastro.sexo,
        data_nascimento: converterDataParaApi(dadosCadastro.dataNascimento),
        telefone: dadosCadastro.telefone.replace(/\D/g, '') || null
      });
    } catch (err) {
      setCarregando(false);
      if (err.status === 400) {
        setFeedback('alerta');
      } else {
        setErroEtapa2(mensagemDeErro(err));
      }
      return;
    }

    setCarregando(false);
    setEmailPendente(email);
    setVerificandoEmail(true);
  };

  const handleEmailVerificado = async () => {
    try {
      await entrar(emailPendente, dadosCadastro.senha);
      const perfil = await buscarPerfil();
      atualizarUsuario({ nome: perfil.nome, email: perfil.email });
    } catch {
    }

    setVerificandoEmail(false);
    setFeedback('sucesso');
  };

  const handleVoltarDaVerificacao = () => {
    setVerificandoEmail(false);
    setEtapaCadastro(2);
  };

  const handleIrParaPerfil = () => {
    setFeedback(null);
    onClose();
    navigate('/questionario');
  };

  const atualizarCampo = (campo, valor) => {
    setDadosCadastro((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor
    }));
  };

  const formatarDataNascimento = (valor) => {
    let valorFormatado = valor.replace(/\D/g, '');
    if (valorFormatado.length > 2) valorFormatado = valorFormatado.replace(/^(\d{2})/, '$1/');
    if (valorFormatado.length > 5) valorFormatado = valorFormatado.replace(/^(\d{2})\/(\d{2})/, '$1/$2/');
    return valorFormatado;
  };

  const formatarTelefone = (valor) => {
    let valorFormatado = valor.replace(/\D/g, '');
    if (valorFormatado.length > 2) valorFormatado = valorFormatado.replace(/^(\d{2})/, '($1) ');
    if (valorFormatado.length > 7) valorFormatado = valorFormatado.replace(/^\((\d{2})\)\s(\d{5})/, '($1) $2-');
    return valorFormatado;
  };

  if (verificandoEmail) {
    return (
      <AuthModalLayout onClose={onClose} centralizarConteudo>
        <VerifyCode
          embutido
          email={emailPendente}
          verificar={verificarEmail}
          reenviar={reenviarCodigoCadastro}
          onSuccess={handleEmailVerificado}
          onClose={onClose}
          onBack={handleVoltarDaVerificacao}
        />
      </AuthModalLayout>
    );
  }

  if (feedback === 'sucesso') {
    return (
      <AuthModalLayout onClose={onClose} centralizarConteudo>
        <div className="py-3 text-center d-flex flex-column align-items-center justify-content-center h-100">
          <CheckCircle2 size={56} className="is-auth-success-icon mb-2" />
          <h4 className="is-auth-feedback-title fw-bold text-dark fs-4 mb-1">Cadastro criado com sucesso!</h4>
          <p className="text-muted fs-6 mb-3">Agora você já tem acesso completo ao Informa Saúde!</p>
          <button type="button" className="is-btn is-btn--orange is-auth-access-action w-100 fs-6 py-2" onClick={handleIrParaPerfil}>
            Acessar minha conta
          </button>
        </div>
      </AuthModalLayout>
    );
  }

  if (feedback === 'alerta') {
    return (
      <AuthModalLayout onClose={onClose} centralizarConteudo>
        <div className="py-3 text-center d-flex flex-column align-items-center justify-content-center h-100">
          <AlertTriangle size={56} className="is-alert-icon mb-2" />
          <h4 className="fw-bold text-dark fs-4 mb-1">Dados já cadastrados</h4>
          <p className="text-muted fs-6 mb-1">E-mail ou telefone já cadastrados em nosso banco de dados.</p>
          <p className="text-muted fs-6 mb-3">Confira os dados digitados e tente novamente.</p>
          <div className="d-flex flex-column gap-2 w-100">
            <button type="button" className="is-btn is-btn--orange is-auth-access-action w-100 fs-6 py-2" onClick={onAbrirLogin}>
              Acessar minha conta
            </button>
            <button type="button" className="is-btn is-btn--outline-green w-100 fs-6 py-2" onClick={() => setFeedback(null)}>
              Tentar novamente
            </button>
          </div>
        </div>
      </AuthModalLayout>
    );
  }

  const botaoVoltar = etapaCadastro === 2 ? (
    <button
      type="button"
      className="btn p-0 border-0 text-secondary d-inline-flex align-items-center gap-1 fs-6 mb-1"
      onClick={() => setEtapaCadastro(1)}
      aria-label="Voltar para a etapa 1"
    >
      <ArrowLeft size={16} /> Voltar
    </button>
  ) : null;

  const requisitos = validarRequisitosSenha(dadosCadastro.senha);

  return (
    <AuthModalLayout
      onClose={onClose}
      titulo="Criar sua conta"
      centralizarConteudo={etapaCadastro === 1}
      conteudoAntesDoTitulo={botaoVoltar}
    >
      {etapaCadastro === 1 ? (
        <form onSubmit={handleAvancarCadastroEtapa1}>
          {erroEtapa1 && (
            <div className="alert alert-danger py-2 px-3 fs-6 mb-3" role="alert">
              {erroEtapa1}
            </div>
          )}

          <FormInput
            id="modal-nome"
            label="Nome Completo"
            type="text"
            placeholder="Digite seu nome completo"
            value={dadosCadastro.nome}
            onChange={(e) => atualizarCampo('nome', e.target.value)}
            required
          />

          <FormInput
            id="modal-data-nascimento"
            label="Data de aniversário"
            type="text"
            placeholder="dd/mm/aaaa"
            maxLength={10}
            value={dadosCadastro.dataNascimento}
            onChange={(e) => {
              setErroEtapa1('');
              atualizarCampo('dataNascimento', formatarDataNascimento(e.target.value));
            }}
            required
          />

          <fieldset className="is-form-group border-0 p-0">
            <legend className="form-label is-form-label mb-2">Sexo</legend>
            <div className="d-flex flex-column gap-2 ms-1">
              {OPCOES_SEXO.map(({ id, valor }) => (
                <div className="form-check" key={id}>
                  <input className="form-check-input" type="radio" name="sexoRadio" id={id} value={valor} checked={dadosCadastro.sexo === valor} onChange={(e) => atualizarCampo('sexo', e.target.value)} required />
                  <label className="form-check-label text-dark fs-6" htmlFor={id}>{valor}</label>
                </div>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="is-btn is-btn--orange w-100 fs-6 py-2 mt-3">Avançar</button>
        </form>
      ) : (
        <form onSubmit={handleFinalizarCadastro}>
          {erroEtapa2 && (
            <div className="alert alert-danger py-2 px-3 fs-6 mb-3" role="alert">
              {erroEtapa2}
            </div>
          )}

          <FormInput
            id="modal-email"
            label="E-mail"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={dadosCadastro.email}
            onChange={(e) => atualizarCampo('email', e.target.value)}
            required
          />

          <FormInput
            id="modal-telefone"
            label="Telefone"
            type="tel"
            placeholder="(51) 9 9999-9999"
            maxLength={15}
            value={dadosCadastro.telefone}
            onChange={(e) => atualizarCampo('telefone', formatarTelefone(e.target.value))}
            required
          />

          <FormInput
            id="modal-senha-cadastro"
            label="Senha"
            type="password"
            isPasswordToggle
            placeholder="••••••••"
            value={dadosCadastro.senha}
            onChange={(e) => {
              setErroEtapa2('');
              atualizarCampo('senha', e.target.value);
            }}
            required
          />

          <FormInput
            id="modal-confirmar-senha"
            label="Confirmar Senha"
            type="password"
            isPasswordToggle
            placeholder="••••••••"
            value={dadosCadastro.confirmarSenha}
            onChange={(e) => {
              setErroEtapa2('');
              atualizarCampo('confirmarSenha', e.target.value);
            }}
            required
          />

          <div className="is-password-checklist my-2">
            <strong className="d-block mb-1 text-dark fs-6">Requisitos da senha:</strong>
            <ul className="mb-0 ps-3">
              <li className={requisitos.minCaracteres && requisitos.temSimbolo ? 'text-success fw-bold' : ''}>
                Mínimo 8 caracteres | 1 símbolo (@#%*)
              </li>
              <li className={requisitos.temMaiuscula && requisitos.temMinuscula && requisitos.temNumero ? 'text-success fw-bold' : ''}>
                Uma letra maiúscula, uma minúscula e um número
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="is-btn is-btn--orange w-100 fs-6 py-2 mt-3"
            disabled={carregando}
          >
            {carregando ? 'Criando conta...' : 'Finalizar Cadastro'}
          </button>
        </form>
      )}

      <div className="text-center mt-3 pt-2 border-top">
        <span className="text-muted fs-6">Já tem uma conta? </span>
        <button type="button" className="is-link-button is-auth-access-link fs-6" onClick={onAbrirLogin}>
          Acessar conta
        </button>
      </div>
    </AuthModalLayout>
  );
}

export default ModalCriarConta;