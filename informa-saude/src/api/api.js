export const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

function lancarErro(resp, dados) {
  const msg = Array.isArray(dados.detail)
    ? dados.detail.map((e) => e.msg).join(", ")
    : dados.detail || "Erro inesperado";
  const erro = new Error(msg);
  erro.status = resp.status;
  throw erro;
}

async function chamar(rota, corpo, { auth = false, metodo = "POST" } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  }

  const resp = await fetch(`${API}${rota}`, {
    method: metodo,
    headers,
    body: JSON.stringify(corpo),
  });

  const dados = await resp.json().catch(() => ({}));

  if (!resp.ok) lancarErro(resp, dados);
  return dados;
}

function dataParaIso(valor) {
  if (!valor) return null;
  if (valor.includes("/")) {
    const [dia, mes, ano] = valor.split("/");
    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }
  return valor;
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

export async function atualizarPerfil({ nome, email, telefone, data_nascimento }) {
  const dados = await chamar(
    "/me",
    {
      nome,
      email,
      telefone: telefone || null,
      data_nascimento: dataParaIso(data_nascimento),
    },
    { auth: true, metodo: "PUT" }
  );
  if (dados.access_token) {
    localStorage.setItem("token", dados.access_token);
  }
  return dados;
}

export async function enviarFoto(arquivo) {
  const form = new FormData();
  form.append("arquivo", arquivo, "foto");

  const resp = await fetch(`${API}/me/foto`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: form,
  });

  const dados = await resp.json().catch(() => ({}));

  if (!resp.ok) lancarErro(resp, dados);
  return dados;
}

export const removerFoto = () =>
  chamar("/me/foto", undefined, { auth: true, metodo: "DELETE" });

export const pedirCodigo = (email) =>
  chamar("/auth/recuperar/pedir", { email });

export const verificarCodigo = (email, codigo) =>
  chamar("/auth/recuperar/verificar", { email, codigo });

export const definirNovaSenha = (reset_token, nova_senha) =>
  chamar("/auth/recuperar/nova-senha", { reset_token, nova_senha });

export const alterarSenha = (senha_atual, nova_senha) =>
  chamar("/me/senha", { senha_atual, nova_senha }, { auth: true });