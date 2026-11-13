import { useEffect, useState } from 'react';

import {
  SystemNavbar,
  ToastFeedback,
  FormInput,
  TituloPaginaSistema,
  CardPerfilSidebar,
} from '../../components';

import { useUser } from '../../context/userContextStore';
import { obterFotoPerfil, salvarFotoPerfil } from '../../utils/fotoPerfil';
import { resolverFoto } from '../../utils/usuario';

const formatarDataNascimento = (valor) => {
  let valorFormatado = String(valor ?? '')
    .replace(/\D/g, '')
    .slice(0, 8);

  if (valorFormatado.length > 2) {
    valorFormatado = valorFormatado.replace(/^(\d{2})/, '$1/');
  }

  if (valorFormatado.length > 5) {
    valorFormatado = valorFormatado.replace(
      /^(\d{2})\/(\d{2})/,
      '$1/$2/'
    );
  }

  return valorFormatado;
};

const obterDataNascimento = (usuario) => {
  const data =
    usuario?.dataNascimento ||
    usuario?.data_nascimento ||
    '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  return data;
};

export function EditarPerfil() {
  const { usuario } = useUser();

  const nomeAtual = usuario?.nome ?? '';
  const emailAtual = usuario?.email ?? '';
  const telefoneAtual = usuario?.telefone ?? '';
  const dataNascimentoAtual = obterDataNascimento(usuario);

  const [nome, setNome] = useState(nomeAtual);
  const [email, setEmail] = useState(emailAtual);
  const [telefone, setTelefone] = useState(telefoneAtual);
  const [dataNascimento, setDataNascimento] = useState(
    dataNascimentoAtual
  );

  const [modoEdicao, setModoEdicao] = useState(false);
  const [toastFotoMsg, setToastFotoMsg] = useState(null);

  const [foto, setFoto] = useState(
    () => obterFotoPerfil() ?? resolverFoto(usuario?.avatar_url)
  );

  useEffect(() => {
    const atualizarFoto = () => {
      setFoto(
        obterFotoPerfil() ?? resolverFoto(usuario?.avatar_url)
      );
    };

    window.addEventListener('storage', atualizarFoto);
    window.addEventListener(
      'foto-perfil-atualizada',
      atualizarFoto
    );

    return () => {
      window.removeEventListener('storage', atualizarFoto);
      window.removeEventListener(
        'foto-perfil-atualizada',
        atualizarFoto
      );
    };
  }, [usuario?.avatar_url, usuario?.email, usuario?.usuario_id]);

  const atualizarFotoPerfil = (novaFoto) => {
    salvarFotoPerfil(novaFoto);

    setFoto(
      novaFoto ?? resolverFoto(usuario?.avatar_url)
    );

    window.dispatchEvent(
      new Event('foto-perfil-atualizada')
    );
  };

  const handleIniciarEdicao = () => {
    setNome(nomeAtual);
    setEmail(emailAtual);
    setTelefone(telefoneAtual);
    setDataNascimento(dataNascimentoAtual);
    setModoEdicao(true);
  };

  const handleCancelarEdicao = () => {
    setNome(nomeAtual);
    setEmail(emailAtual);
    setTelefone(telefoneAtual);
    setDataNascimento(dataNascimentoAtual);
    setModoEdicao(false);
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <SystemNavbar />

      <main className="is-container py-4">
        <TituloPaginaSistema
          titulo="Editar Perfil"
          subtitulo="Consulte seus dados pessoais e informações cadastrais"
          linkVoltar={{
            to: '/meu-perfil',
            texto: 'Voltar para Meu Perfil',
          }}
        />

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <CardPerfilSidebar
              nome={modoEdicao ? nome : nomeAtual}
              email={modoEdicao ? email : emailAtual}
              foto={foto}
              podeEditar
              onAlterarFoto={(novaUrl) => {
                atualizarFotoPerfil(novaUrl);

                setToastFotoMsg(
                  'Foto de perfil atualizada neste dispositivo!'
                );
              }}
              onRemoverFoto={() => {
                atualizarFotoPerfil(null);

                setToastFotoMsg(
                  'Foto local removida com sucesso!'
                );
              }}
            />
          </div>

          <div className="col-12 col-lg-8">
            <div className="bg-white rounded-4 shadow-sm p-4 border-0">
              <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                <h2 className="fw-bold text-dark fs-4 mb-0">
                  Dados pessoais
                </h2>

                {!modoEdicao && (
                  <button
                    type="button"
                    className="is-btn is-btn--profile is-btn--outline-green fs-6"
                    onClick={handleIniciarEdicao}
                  >
                    Editar
                  </button>
                )}
              </div>

              {!modoEdicao && (
                <p className="text-muted small mb-3">
                  Seus dados estão em modo de leitura. Selecione{' '}
                  <strong>Editar</strong> para visualizar o formulário.
                </p>
              )}

              {modoEdicao && (
                <div
                  className="alert alert-warning py-2 px-3 fs-6 mb-3"
                  role="status"
                >
                  A atualização dos dados cadastrais ainda não está
                  integrada ao servidor. Nenhuma alteração será salva.
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <FormInput
                      id="nome-completo"
                      label="Nome Completo"
                      type="text"
                      value={modoEdicao ? nome : nomeAtual}
                      onChange={(e) => setNome(e.target.value)}
                      readOnly={!modoEdicao}
                      inputClassName={
                        !modoEdicao
                          ? 'is-profile-input-readonly'
                          : ''
                      }
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <FormInput
                      id="email"
                      label="E-mail"
                      type="email"
                      value={modoEdicao ? email : emailAtual}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={!modoEdicao}
                      inputClassName={
                        !modoEdicao
                          ? 'is-profile-input-readonly'
                          : ''
                      }
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <FormInput
                      id="telefone"
                      label="Telefone"
                      type="tel"
                      value={modoEdicao ? telefone : telefoneAtual}
                      onChange={(e) => setTelefone(e.target.value)}
                      readOnly={!modoEdicao}
                      inputClassName={
                        !modoEdicao
                          ? 'is-profile-input-readonly'
                          : ''
                      }
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <FormInput
                      id="data-nascimento"
                      label="Data de nascimento"
                      type="text"
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      value={
                        modoEdicao
                          ? dataNascimento
                          : dataNascimentoAtual
                      }
                      onChange={(e) =>
                        setDataNascimento(
                          formatarDataNascimento(e.target.value)
                        )
                      }
                      readOnly={!modoEdicao}
                      inputClassName={
                        !modoEdicao
                          ? 'is-profile-input-readonly'
                          : ''
                      }
                    />
                  </div>
                </div>

                {modoEdicao && (
                  <div className="is-modal-actions mt-4">
                    <button
                      type="button"
                      className="is-btn is-btn--profile is-btn--outline-green fs-6"
                      onClick={handleCancelarEdicao}
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
