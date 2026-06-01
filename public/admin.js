/* ===========================================================
   Painel da Família — lista de confirmados
   =========================================================== */
let SENHA = sessionStorage.getItem("clarice_admin") || "";

const loginBox = document.getElementById("loginBox");
const panel = document.getElementById("panel");
const loginMsg = document.getElementById("loginMsg");

function fmtData(iso) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

async function carregar() {
  const r = await fetch("/api/admin/confirmacoes", {
    headers: { "x-admin-password": SENHA },
  });
  if (r.status === 401) {
    throw new Error("nao-autorizado");
  }
  return r.json();
}

function render(data) {
  document.getElementById("statTotal").textContent = data.total;
  const wrap = document.getElementById("tableWrap");

  if (!data.confirmacoes.length) {
    wrap.innerHTML = '<p class="empty">Ainda não há confirmações. 🐾</p>';
    return;
  }

  const linhas = data.confirmacoes
    .map(
      (c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(c.nome)}</td>
        <td>${fmtData(c.criado_em)}</td>
        <td><button class="del" data-id="${c.id}">remover</button></td>
      </tr>`
    )
    .join("");

  wrap.innerHTML = `
    <table>
      <thead><tr><th>#</th><th>Nome</th><th>Confirmado em</th><th></th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>`;

  wrap.querySelectorAll(".del").forEach((b) => {
    b.addEventListener("click", () => remover(b.dataset.id));
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

async function remover(id) {
  if (!confirm("Remover esta confirmação?")) return;
  const r = await fetch("/api/admin/confirmacoes/" + id, {
    method: "DELETE",
    headers: { "x-admin-password": SENHA },
  });
  if (r.ok) atualizar();
}

async function atualizar() {
  try {
    const data = await carregar();
    render(data);
  } catch (e) {
    if (e.message === "nao-autorizado") {
      sessionStorage.removeItem("clarice_admin");
      mostrarLogin();
    }
  }
}

function mostrarPainel() {
  loginBox.hidden = true;
  panel.hidden = false;
  atualizar();
}
function mostrarLogin() {
  panel.hidden = true;
  loginBox.hidden = false;
}

/* Login */
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  SENHA = document.getElementById("senha").value;
  loginMsg.textContent = "";
  try {
    const data = await carregar();
    sessionStorage.setItem("clarice_admin", SENHA);
    mostrarPainel();
    render(data);
  } catch {
    loginMsg.textContent = "Senha incorreta. Tente novamente.";
  }
});

document.getElementById("refresh").addEventListener("click", atualizar);
document.getElementById("logout").addEventListener("click", () => {
  sessionStorage.removeItem("clarice_admin");
  SENHA = "";
  mostrarLogin();
});
document.getElementById("copy").addEventListener("click", async () => {
  try {
    const data = await carregar();
    const txt = data.confirmacoes.map((c, i) => `${i + 1}. ${c.nome}`).join("\n");
    await navigator.clipboard.writeText(
      `Confirmados (${data.total}):\n${txt}`
    );
    alert("Lista copiada! 📋");
  } catch {
    alert("Não foi possível copiar.");
  }
});

/* Tenta entrar direto se já há senha salva na sessão */
if (SENHA) {
  carregar().then(mostrarPainel).catch(mostrarLogin);
}
