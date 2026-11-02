import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, KeyRound, LogOut } from 'lucide-react';
import { obterFotoPerfil, salvarFotoPerfil } from '../../utils/fotoPerfil';
import {
  SystemNavbar,
  ItemMeuPerfil,
  ToastFeedback,
  TituloPaginaSistema,
  CardPerfilSidebar,
  ModalAlterarSenha,
  ModalConfirmacao
} from '../../components';
import { obterNomeUsuario, obterEmailUsuario } from '../../utils/usuario';

export function MeuPerfil() {
  const navigate = useNavigate();
  const nomeUsuario = obterNomeUsuario();
  const emailUsuario = obterEmailUsuario();
  const [modalSair, setModalSair] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);
  const [foto, setFoto] = useState(obterFotoPerfil);
  const [toastMsg, setToastMsg] = useState(null);

  const atualizarFotoPerfil = (novaFoto) => {
    setFoto(novaFoto);
    salvarFotoPerfil(novaFoto);
    window.dispatchEvent(new Event('foto-perfil-atualizada'));
  };

  const handleConfirmarSair = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('informa-saude-usuario-ativo');
    localStorage.removeItem('informa-saude-jornada-destaque');
    setModalSair(false);
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
              onAlterarFoto={(novaUrl) => {
                atualizarFotoPerfil(novaUrl);
                setToastMsg('Foto de perfil atualizada!');
              }}
              onRemoverFoto={() => {
                atualizarFotoPerfil(null);
                setToastMsg('Foto removida com sucesso!');
              }}
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
    </div>
  );
}

export default MeuPerfil;