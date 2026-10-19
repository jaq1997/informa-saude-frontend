import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Trash2 } from 'lucide-react';
import {
  SystemNavbar,
  TituloPaginaSistema,
  CardPerfilSidebar,
  ModalConfirmacao,
  ToastFeedback
} from '../../components';
import { useUser } from '../../context/UserContext';
import { obterNomeUsuario, obterEmailUsuario, resolverFoto } from '../../utils/usuario';

export function Configuracoes() {
  const navigate = useNavigate();
  const { usuario } = useUser();
  const [modalDeletar, setModalDeletar] = useState(false);
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [toastConfig, setToastConfig] = useState(null);
  const [foto, setFoto] = useState(() => resolverFoto(usuario?.avatar_url));

  useEffect(() => {
    const atualizarFoto = () => setFoto(resolverFoto(usuario?.avatar_url));

    window.addEventListener('storage', atualizarFoto);
    window.addEventListener('foto-perfil-atualizada', atualizarFoto);
    atualizarFoto();

    return () => {
      window.removeEventListener('storage', atualizarFoto);
      window.removeEventListener('foto-perfil-atualizada', atualizarFoto);
    };
  }, [usuario?.avatar_url]);

  const handleDeletarConta = () => {
    setModalDeletar(false);
    navigate('/');
  };

  const handleToggleNotificacoes = (e) => {
    const ativou = e.target.checked;
    setNotificacoesAtivas(ativou);
    setToastConfig({
      mensagem: ativou ? 'Notificações ativadas com sucesso!' : 'Notificações desativadas.',
      tipo: ativou ? 'sucesso' : 'neutro'
    });
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <SystemNavbar />

      <main className="is-container py-4">
        <TituloPaginaSistema
          titulo="Configurações"
          subtitulo="Gerencie preferências de notificação e segurança da conta"
          linkVoltar={{ to: '/meu-perfil', texto: 'Voltar para Meu Perfil' }}
        />

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <CardPerfilSidebar
              nome={usuario?.nome || obterNomeUsuario()}
              email={usuario?.email || obterEmailUsuario()}
              foto={foto}
              podeEditar={false}
            />
          </div>

          <div className="col-12 col-lg-8">
            <div className="bg-white rounded-4 shadow-sm p-4 border-0">
              <h4 className="fw-bold text-dark fs-4 mb-4">Preferências do Sistema</h4>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border">
                  <div className="d-flex align-items-center gap-3 me-3">
                    <div className="is-icon-chip mb-0 rounded-circle is-profile-icon flex-shrink-0">
                      <Bell size={22} />
                    </div>
                    <div>
                      <span className="fw-bold fs-5 d-block text-dark">Notificações</span>
                      <span className="text-muted fs-6">Receber alertas de novas jornadas e dicas de saúde</span>
                    </div>
                  </div>
                  <div className="form-check form-switch m-0 p-0 flex-shrink-0 fs-4">
                    <input
                      className="form-check-input ms-0 cursor-pointer"
                      type="checkbox"
                      checked={notificacoesAtivas}
                      onChange={handleToggleNotificacoes}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border w-100 text-start cursor-pointer"
                  onClick={() => setModalDeletar(true)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="is-icon-chip mb-0 rounded-circle is-profile-icon flex-shrink-0">
                      <Trash2 size={22} className="text-danger" />
                    </div>
                    <div>
                      <span className="fw-bold fs-5 text-danger d-block">Deletar Conta</span>
                      <span className="text-muted fs-6">Excluir permanentemente seus dados do sistema</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ModalConfirmacao
        aberto={modalDeletar}
        onClose={() => setModalDeletar(false)}
        onConfirmar={handleDeletarConta}
        titulo="Excluir Conta?"
        mensagem="Esta ação é irreversível. Todos os seus pontos e histórico de jornadas serão removidos."
        textoConfirmar="Sim, excluir minha conta"
        textoCancelar="Cancelar"
        perigo
      />

      <ToastFeedback
        visivel={!!toastConfig}
        onClose={() => setToastConfig(null)}
        titulo="Preferências"
        mensagem={toastConfig?.mensagem}
        tipo={toastConfig?.tipo || 'sucesso'}
      />
    </div>
  );
}

export default Configuracoes;