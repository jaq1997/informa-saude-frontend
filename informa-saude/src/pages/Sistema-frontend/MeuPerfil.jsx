import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { User, Settings, KeyRound, LogOut } from 'lucide-react';
import {
  SystemNavbar,
  ItemMeuPerfil,
  ToastFeedback,
  TituloPaginaSistema,
  CardPerfilSidebar,
  ModalAlterarSenha,
  ModalConfirmacao
} from '../../components';
import { resolverFoto } from '../../utils/usuario';
import { enviarFoto, removerFoto } from '../../api/api';

export function MeuPerfil() {
  const navigate = useNavigate();
  const { usuario, atualizarUsuario, sair } = useUser();
  const nomeUsuario = usuario.nome;
  const emailUsuario = usuario.email;
  const foto = resolverFoto(usuario?.avatar_url);
  const [modalSair, setModalSair] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastErro, setToastErro] = useState(null);

  const handleAlterarFoto = async (urlTemporaria, arquivo) => {
    try {
      const atualizado = await enviarFoto(arquivo);
      atualizarUsuario({ avatar_url: atualizado.avatar_url });
      setToastMsg('Foto de perfil atualizada!');
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
      setToastMsg('Foto removida com sucesso!');
    } catch (erro) {
      setToastErro(erro.message || 'Não foi possível remover a foto.');
    }
  };

  const handleConfirmarSair = () => {
    setModalSair(false);
    sair();
    navigate('/');
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <SystemNavbar />

      <main className="is-container py-4">
        <TituloPaginaSistema
          titulo="Meu Perfil"
          subtitulo="Gerencie seus dados pessoais, senha e preferências do sistema"
        />

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <CardPerfilSidebar
              nome={nomeUsuario}
              email={emailUsuario}
              foto={foto}
              podeEditar
              onAlterarFoto={handleAlterarFoto}
              onRemoverFoto={handleRemoverFoto}
            />
          </div>

          <div className="col-12 col-lg-8">
            <div className="bg-white rounded-4 shadow-sm p-4 border-0">
              <h4 className="fw-bold text-dark fs-4 mb-4">Opções da Conta</h4>

              <div className="d-flex flex-column gap-3">
                <ItemMeuPerfil
                  icone={<User size={22} />}
                  titulo="Editar Perfil"
                  descricao="Atualizar nome, e-mail, telefone e data de nascimento"
                  to="/editar-perfil"
                />

                <ItemMeuPerfil
                  icone={<Settings size={22} />}
                  titulo="Configurações"
                  descricao="Gerenciar notificações e opções da conta"
                  to="/configuracoes"
                />

                <ItemMeuPerfil
                  icone={<KeyRound size={22} />}
                  titulo="Alterar Senha"
                  descricao="Atualizar sua senha de acesso ao sistema"
                  onClick={() => setModalSenha(true)}
                />

                <ItemMeuPerfil
                  icone={<LogOut size={22} className="text-danger" />}
                  titulo="Sair da Conta"
                  descricao="Encerrar a sessão atual com segurança"
                  onClick={() => setModalSair(true)}
                  perigo
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ModalAlterarSenha
        aberto={modalSenha}
        onClose={() => setModalSenha(false)}
        onSalvo={() => setToastMsg('Senha alterada com sucesso!')}
      />

      <ModalConfirmacao
        aberto={modalSair}
        onClose={() => setModalSair(false)}
        onConfirmar={handleConfirmarSair}
        titulo="Sair do aplicativo?"
        mensagem="Você precisará preencher suas credenciais ao acessar novamente."
        textoConfirmar="Sim, sair"
        textoCancelar="Cancelar"
      />

      <ToastFeedback
        visivel={!!toastMsg}
        onClose={() => setToastMsg(null)}
        titulo="Atualização"
        mensagem={toastMsg}
        tipo="sucesso"
      />

      <ToastFeedback
        visivel={!!toastErro}
        onClose={() => setToastErro(null)}
        titulo="Não foi possível salvar"
        mensagem={toastErro}
        tipo="erro"
      />
    </div>
  );
}

export default MeuPerfil;