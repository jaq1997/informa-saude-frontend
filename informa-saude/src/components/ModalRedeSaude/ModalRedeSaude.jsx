import { useState } from 'react';
import { MapPin, Search, Navigation, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { ModalSistema } from '../ModalSistema/ModalSistema';
import { API_BASE_URL } from '../../config/api';

export function ModalRedeSaude({ aberto, aoFechar }) {
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [erro, setErro] = useState('');
  const [cep, setCep] = useState('');
  const [precisaoLocalizacao, setPrecisaoLocalizacao] = useState(null);

  const obterHeadersComToken = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const buscarPorGPS = () => {
    setCarregando(true);
    setErro('');
    setEstabelecimentos([]);
    setBuscaRealizada(false);
    setPrecisaoLocalizacao(null);

    if (!window.isSecureContext) {
      setErro(
        'Seu navegador só permite compartilhar a localização em uma página segura (HTTPS). ' +
          'Abra o aplicativo por um endereço HTTPS ou informe seu CEP.'
      );
      setCarregando(false);
      return;
    }

    if (!navigator.geolocation) {
      setErro('Seu navegador não suporta geolocalização. Por favor, busque pelo CEP.');
      setCarregando(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (posicao) => {
        const { latitude, longitude } = posicao.coords;
        setPrecisaoLocalizacao(posicao.coords.accuracy);
        if (posicao.coords.accuracy > 1000) {
          setErro(
            `A localização do navegador está imprecisa (±${formatarDistancia(posicao.coords.accuracy)} m). ` +
              'Para evitar distâncias incorretas, informe seu CEP ou tente novamente em um local com melhor sinal.'
          );
          setCarregando(false);
          return;
        }

        try {
          const url = `${API_BASE_URL}/api/estabelecimentos/proximos?lat=${latitude}&lng=${longitude}&raio=20`;

          const res = await fetch(url, {
            headers: obterHeadersComToken(),
          });
          if (res.status === 401) {
            throw new Error('Você precisa estar logado para acessar a rede de saúde.');
          }
          if (!res.ok) throw new Error('Erro ao buscar estabelecimentos próximos.');
          const dados = await res.json();
          setEstabelecimentos(dados);
          setBuscaRealizada(true);
        } catch (err) {
          setErro(err.message || 'Não foi possível conectar ao backend ou carregar estabelecimentos.');
        } finally {
          setCarregando(false);
        }
      },
      (err) => {
        const mensagem = err.code === 1
          ? 'A permissão de localização foi bloqueada. Verifique a permissão deste site nas configurações do navegador ou informe seu CEP.'
          : 'Não foi possível obter sua localização. Digite seu CEP abaixo para buscar.';
        setErro(mensagem);
        setCarregando(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  };

  const buscarPorCep = async (e) => {
    e?.preventDefault();
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setErro('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setCarregando(true);
    setErro('');
    setEstabelecimentos([]);
    setBuscaRealizada(false);
    setPrecisaoLocalizacao(null);

    try {
      const url = `${API_BASE_URL}/api/estabelecimentos/por-cep?cep=${cepLimpo}&raio=20`;

      const res = await fetch(url, {
        headers: obterHeadersComToken(),
      });
      if (res.status === 401) {
        throw new Error('Você precisa estar logado para acessar a rede de saúde.');
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'CEP não encontrado ou fora da cobertura.');
      }
      const dados = await res.json();
      setEstabelecimentos(dados);
      setBuscaRealizada(true);
    } catch (e) {
      setErro(e.message || 'Erro ao buscar pelo CEP.');
    } finally {
      setCarregando(false);
    }
  };

  const unidadesOrdenadas = [...estabelecimentos].sort(
    (a, b) => (a.distancia_km ?? Infinity) - (b.distancia_km ?? Infinity)
  );
  const unidadesMaisProximas = unidadesOrdenadas.slice(0, 5);
  const formatarDistancia = (distancia) => (
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(distancia)
  );

  return (
    <ModalSistema
      aberto={aberto}
      onClose={aoFechar}
      titulo="Rede de Saúde — Atendimentos e Hospitais"
      tamanho="md"
      className="is-modal-rede-saude"
    >
      <div className="is-modal-rede-saude-content p-3">
        <p className="text-muted small mb-3">
          Cobertura atual: somente Porto Alegre. A busca considera unidades cadastradas em um raio de até 20 km.
        </p>
        <p className="text-muted small mb-3" role="note">
          Os dados foram coletados do Google Maps e ainda não foram conferidos no CNES. Endereços,
          telefones e localizações podem conter divergências.
        </p>

        <div className="d-grid gap-2 mb-3">
          <button
            type="button"
            onClick={buscarPorGPS}
            disabled={carregando}
            className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
          >
            <Navigation size={18} /> Usar Minha Localização Atual
          </button>
        </div>

        <div className="is-location-search-divider my-3" aria-hidden="true">
          <span>ou digite seu CEP</span>
        </div>

        <form onSubmit={buscarPorCep} className="row g-2 mb-3">
          <div className="col-8">
            <input
              type="text"
              className="form-control"
              placeholder="Ex: 90040-192"
              value={cep}
              maxLength={9}
              onChange={(e) => setCep(e.target.value)}
            />
          </div>
          <div className="col-4">
            <button
              type="submit"
              disabled={carregando || !cep.trim()}
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-1"
              style={{ backgroundColor: 'var(--is-green)', borderColor: 'var(--is-green)' }}
            >
              <Search size={16} /> Buscar
            </button>
          </div>
        </form>

        {erro && (
          <div className="alert alert-warning py-2 small d-flex align-items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-warning flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {carregando && (
          <div className="text-center py-4">
            <Loader2 size={32} className="spin text-is-green mx-auto mb-2" />
            <p className="text-muted small mb-0">Calculando unidades mais próximas...</p>
          </div>
        )}

        {!carregando && estabelecimentos.length > 0 && (
          <div className="mt-3">
            <span className="small text-muted fw-bold d-block mb-2">
              As {unidadesMaisProximas.length} unidades mais próximas:
            </span>
            <p className="text-muted small mb-2" role="note">
              Mostrando até 5 unidades, ordenadas pela distância estimada por ruas (rota de carro, sem considerar o trânsito).
            </p>
            {precisaoLocalizacao !== null && (
              <p className="text-muted small mb-2" role="note">
                Precisão estimada da localização: ±{formatarDistancia(precisaoLocalizacao)} m.
                {precisaoLocalizacao > 1000 && ' A margem pode alterar a ordem e as distâncias exibidas.'}
              </p>
            )}
            <div className="d-flex flex-column gap-2">
              {unidadesMaisProximas.map((est, index) => (
                <article
                  key={est.id}
                  className={`is-card ${index === 0 ? 'is-card-green-light' : ''}`}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <div>
                      {index === 0 && (
                        <span className="small fw-semibold d-block mb-1">Mais próxima</span>
                      )}
                      <h3 className="fw-bold text-dark fs-6 mb-0">{est.nome}</h3>
                    </div>
                    {est.distancia_km !== null && est.distancia_km !== undefined && (
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                        {formatarDistancia(est.distancia_km)} km
                      </span>
                    )}
                  </div>
                  <span className="badge bg-secondary-subtle text-secondary w-auto align-self-start mb-2">
                    {est.tipo}
                  </span>
                  <div className="small text-muted d-flex align-items-center gap-1 mb-1">
                    <MapPin size={14} className="flex-shrink-0 text-is-green" aria-hidden="true" />
                    <span>{est.endereco} {est.bairro ? `— ${est.bairro}` : ''}</span>
                  </div>
                  {est.telefone && (
                    <div className="small text-muted d-flex align-items-center gap-1">
                      <Phone size={14} className="flex-shrink-0" aria-hidden="true" />
                      <span>{est.telefone}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
        {!carregando && !erro && estabelecimentos.length === 0 && (
          <p className="text-muted small text-center mb-0">
            {buscaRealizada
              ? 'Nenhuma unidade cadastrada foi encontrada a até 20 km. No momento, a cobertura inclui somente Porto Alegre.'
              : 'Use sua localização ou informe um CEP para encontrar estabelecimentos próximos.'}
          </p>
        )}
      </div>
    </ModalSistema>
  );
}

export default ModalRedeSaude;
