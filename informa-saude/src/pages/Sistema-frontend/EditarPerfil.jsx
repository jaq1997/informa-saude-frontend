import { useEffect, useState } from 'react';

import {
  SystemNavbar,
  ToastFeedback,
  FormInput,
  TituloPaginaSistema,
  CardPerfilSidebar,
  BotaoSistema,
} from '../../components';

import { useUser } from '../../context/userContextStore';
import { atualizarPerfil, enviarFotoPerfil, removerFotoPerfil } from '../../api/api';
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

const formatarTelefone = (valor) => {
  const limpo = String(valor ?? '').replace(/\D/g, '').slice(0, 11);
  if (limpo.length > 10) {
    return limpo.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (limpo.length > 6) {
    return limpo.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  if (limpo.length > 2) {
    return limpo.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  }
  return limpo;
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
  const { usuario, atualizarUsuario } = useUser();

  const nomeAtual = usuario?.nome ?? '';
  const emailAtual = usuario?.email ?? '';
  const telefoneAtual = usuario?.telefone ?? '';
  const dataNascimentoAtual = obterDataNascimento(usuario);

  const [nome, setNome] = useState(nomeAtual);
  const [telefone, setTelefone] = useState(telefoneAtual);
  const [dataNascimento, setDataNascimento] = useState(dataNascimentoAtual);

  const [modoEdicao, setModoEdicao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [toastFotoMsg, setToastFotoMsg] = useState(null);
  const [toastFeedback, setToastFeedback] = useState({
    visivel: false,
    titulo: '',
    mensagem: '',
    tipo: 'sucesso',
  });

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
    window.addEventListener('foto-perfil-atualizada', atualizarFoto);

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

    setFoto(novaFoto ?? resolverFoto(usuario?.avatar_url));

    window.dispatchEvent(new Event('foto-perfil-atualizada'));
  };

  const handleIniciarEdicao = () => {
    setNome(nomeAtual);
    setTelefone(telefoneAtual);
    setDataNascimento(dataNascimentoAtual);
    setModoEdicao(true);
  };

  const handleCancelarEdicao = () => {
    setNome(nomeAtual);
    setTelefone(telefoneAtual);
    setDataNascimento(dataNascimentoAtual);
    setModoEdicao(false);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();

    const nomeTratado = nome.trim();
    if (!nomeTratado) {
      setToastFeedback({
        visivel: true,
        titulo: 'Nome obrigatório',
        mensagem: 'Por favor, informe seu nome completo.',
        tipo: 'erro',
      });
      return;
    }

    const dataTratada = dataNascimento.trim();
    if (dataTratada && dataTratada.length > 0 && dataTratada.length < 10) {
      setToastFeedback({
        visivel: true,
        titulo: 'Data incompleta',
        mensagem: 'Por favor, informe a data de nascimento completa no formato DD/MM/AAAA.',
        tipo: 'erro',
      });
      return;
    }

    setSalvando(true);
    try {
      const resposta = await atualizarPerfil({
        nome: nomeTratado,
        telefone: telefone.trim() || null,
        data_nascimento: dataTratada || null,
      });

      atualizarUsuario({
        nome: resposta.nome,
        telefone: resposta.telefone ?? '',
        data_nascimento: resposta.data_nascimento ?? '',
        sexo: resposta.sexo ?? '',
      });

      setToastFeedback({
        visivel: true,
        titulo: 'Perfil atualizado',
        mensagem: 'Seus dados foram salvos com sucesso!',
        tipo: 'sucesso',
      });

      setModoEdicao(false);
    } catch (erro) {
      setToastFeedback({
        visivel: true,
        titulo: 'Não foi possível salvar',
        mensagem: erro.message || 'Ocorreu um erro ao atualizar o perfil. Tente novamente.',
        tipo: 'erro',
      });
    } finally {
      setSalvando(false);
    }
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
              email={emailAtual}
              foto={foto}
              podeEditar
              onAlterarFoto={async (novaUrl, arquivo) => {
                if (arquivo) {
                  try {
                    const resp = await enviarFotoPerfil(arquivo);
                    atualizarUsuario({ avatar_url: resp.avatar_url });
                    setFoto(resp.avatar_url);
                    salvarFotoPerfil(null);
                    setToastFotoMsg(
                      'Foto de perfil salva com sucesso no Cloudflare!'
                    );
                  } catch (e) {
                    setToastFeedback({
                      visivel: true,
                      titulo: 'Erro ao enviar foto',
                      mensagem:
                        e.message || 'Não foi possível salvar a foto no servidor.',
                      tipo: 'erro',
                    });
                  }
                } else {
                  atualizarFotoPerfil(novaUrl);
                }
              }}
              onRemoverFoto={async () => {
                try {
                  await removerFotoPerfil();
                  atualizarUsuario({ avatar_url: null });
                  atualizarFotoPerfil(null);
                  setToastFotoMsg(
                    'Foto de perfil removida com sucesso!'
                  );
                } catch (e) {
                  setToastFeedback({
                    visivel: true,
                    titulo: 'Erro ao remover foto',
                    mensagem: e.message || 'Não foi possível remover a foto.',
                    tipo: 'erro',
                  });
                }
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
                  <BotaoSistema
                    tipo="button"
                    variante="outline-green"
                    onClick={handleIniciarEdicao}
                  >
                    Editar
                  </BotaoSistema>
                )}
              </div>

              {!modoEdicao && (
                <p className="text-muted small mb-3">
                  Seus dados estão em modo de leitura. Selecione{' '}
                  <strong>Editar</strong> para alterar seu nome, telefone ou data de nascimento.
                </p>
              )}

              <form onSubmit={handleSalvar}>
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
                      value={emailAtual}
                      readOnly={true}
                      inputClassName="is-profile-input-readonly"
                      disabled={true}
                    />
                    <small className="text-muted d-block mt-1">
                      O e-mail é a chave de acesso à conta e não pode ser alterado.
                    </small>
                  </div>

                  <div className="col-12 col-md-6">
                    <FormInput
                      id="telefone"
                      label="Telefone"
                      type="tel"
                      placeholder="(99) 99999-9999"
                      value={modoEdicao ? telefone : telefoneAtual}
                      onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
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
                  <div className="is-modal-actions mt-4 d-flex align-items-center gap-3">
                    <BotaoSistema
                      tipo="submit"
                      variante="orange"
                      desabilitado={salvando}
                    >
                      {salvando ? 'Salvando...' : 'Salvar alterações'}
                    </BotaoSistema>

                    <BotaoSistema
                      tipo="button"
                      variante="outline-green"
                      onClick={handleCancelarEdicao}
                      desabilitado={salvando}
                    >
                      Cancelar
                    </BotaoSistema>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      <ToastFeedback
        visivel={toastFeedback.visivel}
        onClose={() => setToastFeedback((prev) => ({ ...prev, visivel: false }))}
        titulo={toastFeedback.titulo}
        mensagem={toastFeedback.mensagem}
        tipo={toastFeedback.tipo}
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
