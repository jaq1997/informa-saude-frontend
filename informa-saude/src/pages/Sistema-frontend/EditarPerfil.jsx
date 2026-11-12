import { useEffect, useState } from 'react';
import { SystemNavbar, ToastFeedback, FormInput, TituloPaginaSistema, CardPerfilSidebar } from '../../components';
import { useUser } from '../../context/UserContext';
import { obterNomeUsuario, obterEmailUsuario, resolverFoto } from '../../utils/usuario';
import { buscarPerfil, atualizarPerfil, enviarFoto, removerFoto } from '../../api/api';

const formatarTelefone = (valor) => {
  const d = (valor || '').replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const isoParaBr = (iso) => (iso ? iso.split('-').reverse().join('/') : '');

export function EditarPerfil() {
  const { usuario, atualizarUsuario } = useUser();

  const nomeAtual = usuario?.nome || obterNomeUsuario();
  const emailAtual = usuario?.email || obterEmailUsuario();
  const foto = resolverFoto(usuario?.avatar_url);

  const [salvos, setSalvos] = useState({
    nome: nomeAtual,
    email: emailAtual,
    telefone: '',
    dataNascimento: '',
  });

  const [nome, setNome] = useState(nomeAtual);
  const [email, setEmail] = useState(emailAtual);
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [provider, setProvider] = useState('LOCAL');
  const [modoEdicao, setModoEdicao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [toastSucesso, setToastSucesso] = useState(false);
  const [toastErro, setToastErro] = useState(null);
  const [toastFotoMsg, setToastFotoMsg] = useState(null);

  useEffect(() => {
    let ativo = true;

    buscarPerfil()
      .then((perfil) => {
        if (!ativo) return;
        const carregados = {
          nome: perfil.nome || '',
          email: perfil.email || '',
          telefone: formatarTelefone(perfil.telefone),
          dataNascimento: isoParaBr(perfil.data_nascimento),
        };
        setSalvos(carregados);
        setNome(carregados.nome);
        setEmail(carregados.email);
        setTelefone(carregados.telefone);
        setDataNascimento(carregados.dataNascimento);
        setProvider(perfil.provider || 'LOCAL');
        atualizarUsuario({
          nome: perfil.nome,
          email: perfil.email,
          avatar_url: perfil.avatar_url,
        });
      })
      .catch(() => {
        if (ativo) setToastErro('Não foi possível carregar seus dados.');
      });

    return () => {
      ativo = false;
    };
  }, []);

  const handleAlterarFoto = async (urlTemporaria, arquivo) => {
    try {
      const atualizado = await enviarFoto(arquivo);
      atualizarUsuario({ avatar_url: atualizado.avatar_url });
      setToastFotoMsg('Foto de perfil atualizada!');
    } catch (erro) {
      setToastErro(erro.message || 'Não foi possível atualizar a foto.');
    } finally {
      URL.revokeObjectURL(urlTemporaria);
    }
  };

  const handleRemoverFoto = async () => {
    try {
      const atualizado = await removerFoto();
      atualizarUsuario({ avatar_url: atualizado.avatar_url });
      setToastFotoMsg('Foto removida com sucesso!');
    } catch (erro) {
      setToastErro(erro.message || 'Não foi possível remover a foto.');
    }
  };

  const formatarDataNascimento = (valor) => {
    let valorFormatado = valor.replace(/\D/g, '');
    if (valorFormatado.length > 2) valorFormatado = valorFormatado.replace(/^(\d{2})/, '$1/');
    if (valorFormatado.length > 5) valorFormatado = valorFormatado.replace(/^(\d{2})\/(\d{2})/, '$1/$2/');
    return valorFormatado;
  };

  const handleSalvar = async (e) => {
    e.preventDefault();

    if (dataNascimento.length !== 10) {
      setToastErro('Informe a data de nascimento completa (dd/mm/aaaa).');
      return;
    }

    setSalvando(true);
    try {
      const atualizado = await atualizarPerfil({
        nome,
        email,
        telefone,
        data_nascimento: dataNascimento,
      });

      const novosDados = {
        nome: atualizado.nome,
        email: atualizado.email,
        telefone: formatarTelefone(atualizado.telefone),
        dataNascimento: isoParaBr(atualizado.data_nascimento),
      };

      setSalvos(novosDados);
      setNome(novosDados.nome);
      setEmail(novosDados.email);
      setTelefone(novosDados.telefone);
      setDataNascimento(novosDados.dataNascimento);

      atualizarUsuario({ nome: atualizado.nome, email: atualizado.email });

      setModoEdicao(false);
      setToastSucesso(true);
    } catch (erro) {
      setToastErro(erro.message || 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelarEdicao = () => {
    setNome(salvos.nome);
    setEmail(salvos.email);
    setTelefone(salvos.telefone);
    setDataNascimento(salvos.dataNascimento);
    setModoEdicao(false);
  };

  useEffect(() => {
    if (!toastSucesso) return undefined;

    const timeoutId = setTimeout(() => setToastSucesso(false), 5000);
    return () => clearTimeout(timeoutId);
  }, [toastSucesso]);

  useEffect(() => {
    if (!toastErro) return undefined;

    const timeoutId = setTimeout(() => setToastErro(null), 5000);
    return () => clearTimeout(timeoutId);
  }, [toastErro]);

  return (
    <div className="bg-light min-vh-100 pb-5">
      <SystemNavbar />

      <main className="is-container py-4">
        <TituloPaginaSistema
          titulo="Editar Perfil"
          subtitulo="Mantenha seus dados de contato e informações cadastrais atualizados"
          linkVoltar={{ to: '/meu-perfil', texto: 'Voltar para Meu Perfil' }}
        />

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <CardPerfilSidebar
              nome={nome}
              email={email}
              foto={foto}
              podeEditar
              onAlterarFoto={handleAlterarFoto}
              onRemoverFoto={handleRemoverFoto}
            />
          </div>

          <div className="col-12 col-lg-8">
            <div className="bg-white rounded-4 shadow-sm p-4 border-0">
              <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                <h2 className="fw-bold text-dark fs-4 mb-0">Dados pessoais</h2>
                {!modoEdicao && (
                  <button
                    type="button"
                    className="is-btn is-btn--profile is-btn--outline-green fs-6"
                    onClick={() => setModoEdicao(true)}
                  >
                    Editar
                  </button>
                )}
              </div>

              <form onSubmit={handleSalvar}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <FormInput
                      id="nome-completo"
                      label="Nome Completo"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      disabled={!modoEdicao}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <FormInput
                      id="email"
                      label="E-mail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!modoEdicao || provider === 'GOOGLE'}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <FormInput
                      id="telefone"
                      label="Telefone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={telefone}
                      onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                      disabled={!modoEdicao}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <FormInput
                      id="data-nascimento"
                      label="Data de nascimento"
                      type="text"
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(formatarDataNascimento(e.target.value))}
                      disabled={!modoEdicao}
                      required
                    />
                  </div>
                </div>

                {modoEdicao && (
                  <div className="is-modal-actions mt-4">
                    <button
                      type="submit"
                      className="is-btn is-btn--profile is-btn--orange fs-6"
                      disabled={salvando}
                    >
                      {salvando ? 'Salvando...' : 'Atualizar cadastro'}
                    </button>
                    <button
                      type="button"
                      className="is-btn is-btn--profile is-btn--outline-green fs-6"
                      onClick={handleCancelarEdicao}
                      disabled={salvando}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      <ToastFeedback
        visivel={toastSucesso}
        onClose={() => setToastSucesso(false)}
        titulo="Perfil atualizado"
        mensagem="Seus dados foram atualizados com sucesso no sistema."
        tipo="sucesso"
      />

      <ToastFeedback
        visivel={!!toastErro}
        onClose={() => setToastErro(null)}
        titulo="Não foi possível salvar"
        mensagem={toastErro}
        tipo="erro"
      />

      <ToastFeedback
        visivel={!!toastFotoMsg}
        onClose={() => setToastFotoMsg(null)}
        titulo="Foto de perfil"
        mensagem={toastFotoMsg}
        tipo="sucesso"
      />
    </div>
  );
}

export default EditarPerfil;