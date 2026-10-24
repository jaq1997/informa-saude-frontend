const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function chamar(rota, corpo, { auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
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
  return dados;
}

export async function entrarComGoogle(credential) {
  const dados = await chamar("/auth/google", { credential });
  localStorage.setItem("token", dados.access_token);
  return dados;
}

export async function buscarPerfil() {
  const resp = await fetch(`${API}/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!resp.ok) throw new Error("Sessão inválida");
  return resp.json();
}

export const pedirCodigo = (email) =>
  chamar("/auth/recuperar/pedir", { email });

export const verificarCodigo = (email, codigo) =>
  chamar("/auth/recuperar/verificar", { email, codigo });

export const definirNovaSenha = (reset_token, nova_senha) =>
  chamar("/auth/recuperar/nova-senha", { reset_token, nova_senha });

export const alterarSenha = (senha_atual, nova_senha) =>
  chamar("/me/senha", { senha_atual, nova_senha }, { auth: true });