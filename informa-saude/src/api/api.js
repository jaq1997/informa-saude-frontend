const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function chamar(rota, corpo, { auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    headers.Authorization = "Bearer " + localStorage.getItem("token");
  }

  const resp = await fetch(`${API}${rota}`, {
    method: "POST",
    headers,
    body: JSON.stringify(corpo),
  });

  const dados = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg = Array.isArray(dados.detail)
      ? dados.detail.map((e) => e.msg).join(", ")
      : dados.detail || "Erro inesperado";

    const erro = new Error(msg);
    erro.status = resp.status;
    throw erro;
  }

  return dados;
}

export const cadastrar = (dados) => chamar("/register", dados);

export const verificarEmail = (email, codigo) =>
  chamar("/register/verificar", { email, codigo });

export const reenviarCodigoCadastro = (email) =>
  chamar("/register/reenviar", { email });

export async function entrar(email, senha) {
  const dados = await chamar("/login", { email, senha });

  localStorage.setItem("token", dados.access_token);
  localStorage.setItem("access_token", dados.access_token);

  return dados;
}

export async function entrarComGoogle(credential) {
  const dados = await chamar("/auth/google", { credential });

  localStorage.setItem("token", dados.access_token);
  localStorage.setItem("access_token", dados.access_token);

  return dados;
}

export async function buscarPerfil() {
  const resp = await fetch(`${API}/me`, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  if (!resp.ok) {
    throw new Error("Sessão inválida");
  }

  return resp.json();
}

export async function atualizarPerfil(dados) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  const resp = await fetch(`${API}/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(dados),
  });

  const resposta = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg = Array.isArray(resposta.detail)
      ? resposta.detail.map((e) => e.msg).join(", ")
      : resposta.detail ||
        "Não foi possível atualizar os dados do perfil.";

    const erro = new Error(msg);
    erro.status = resp.status;
    throw erro;
  }

  if (resposta.access_token) {
    localStorage.setItem("token", resposta.access_token);
    localStorage.setItem("access_token", resposta.access_token);
  }

  return resposta;
}

export async function enviarFotoPerfil(arquivo) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  const formData = new FormData();
  formData.append("foto", arquivo);

  const resp = await fetch(`${API}/me/foto`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const dados = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg = Array.isArray(dados.detail)
      ? dados.detail.map((e) => e.msg).join(", ")
      : dados.detail || "Erro ao enviar foto de perfil.";

    const erro = new Error(msg);
    erro.status = resp.status;
    throw erro;
  }

  return dados;
}

export async function removerFotoPerfil() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  const resp = await fetch(`${API}/me/foto`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const dados = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg = Array.isArray(dados.detail)
      ? dados.detail.map((e) => e.msg).join(", ")
      : dados.detail || "Erro ao remover foto de perfil.";

    const erro = new Error(msg);
    erro.status = resp.status;
    throw erro;
  }

  return dados;
}

export const pedirCodigo = (email) =>
  chamar("/auth/recuperar/pedir", { email });

export const verificarCodigo = (email, codigo) =>
  chamar("/auth/recuperar/verificar", { email, codigo });

export const definirNovaSenha = (reset_token, nova_senha) =>
  chamar("/auth/recuperar/nova-senha", {
    reset_token,
    nova_senha,
  });

export const alterarSenha = (senha_atual, nova_senha) =>
  chamar(
    "/me/senha",
    { senha_atual, nova_senha },
    { auth: true }
  );

export async function excluirConta() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  const resp = await fetch(`${API}/me`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const dados = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg = Array.isArray(dados.detail)
      ? dados.detail.map((e) => e.msg).join(", ")
      : dados.detail || "Erro ao excluir conta.";

    const erro = new Error(msg);
    erro.status = resp.status;
    throw erro;
  }

  return dados;
}

export async function buscarDashboard() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  const resp = await fetch(`${API}/dashboard`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const dados = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const mensagem =
      typeof dados.detail === "string"
        ? dados.detail
        : "Não foi possível carregar os dados do Dashboard.";

    const erro = new Error(mensagem);
    erro.status = resp.status;
    throw erro;
  }

  return dados;
}

async function requisicaoAutenticada(
  rota,
  { metodo = "GET", corpo } = {}
) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  if (corpo !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const resposta = await fetch(`${API}${rota}`, {
    method: metodo,
    headers,
    ...(corpo !== undefined
      ? { body: JSON.stringify(corpo) }
      : {}),
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const mensagem = Array.isArray(dados.detail)
      ? dados.detail
          .map((erro) => erro.msg || "Dados inválidos")
          .join(", ")
      : typeof dados.detail === "string"
        ? dados.detail
        : "Não foi possível concluir a operação.";

    const erro = new Error(mensagem);
    erro.status = resposta.status;

    throw erro;
  }

  return dados;
}

export function iniciarJornada(codigo, nome) {
  return requisicaoAutenticada("/dashboard/jornadas", {
    metodo: "POST",
    corpo: {
      codigo,
      nome,
    },
  });
}

export function buscarJornadas() {
  return requisicaoAutenticada("/dashboard/jornadas");
}

export function buscarAtividadesJornada(jornadaId) {
  return requisicaoAutenticada(
    `/dashboard/jornadas/${encodeURIComponent(jornadaId)}/atividades`
  );
}

export function registrarAtividade(
  jornadaId,
  codigoJornada,
  episodioId
) {
  const referencia = `${codigoJornada}:${episodioId}`;

  return requisicaoAutenticada("/dashboard/atividades", {
    metodo: "POST",
    corpo: {
      jornada_id: jornadaId,
      referencia,
      xp: 0,
      minutos: 0,
    },
  });
}

export function concluirJornada(jornadaId) {
  return requisicaoAutenticada(
    `/dashboard/jornadas/${encodeURIComponent(jornadaId)}/concluir`,
    {
      metodo: "PATCH",
    }
  );
}
