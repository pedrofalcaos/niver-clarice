const path = require("path");
const express = require("express");
const { pool, init } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Senha do painel administrativo (defina ADMIN_PASSWORD no Railway).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "clarice2026";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Limite simples de tamanho de nome para evitar abusos.
const MAX_NOME = 80;

// ---- API publica: registrar confirmacao (aceita nome ou array nomes) ------
app.post("/api/confirmar", async (req, res) => {
  try {
    // Suporta { nomes: [...] } (grupo) ou { nome: "..." } (legado)
    let nomes = [];
    if (Array.isArray(req.body?.nomes)) {
      nomes = req.body.nomes.map((n) => String(n).trim()).filter(Boolean);
    } else if (req.body?.nome) {
      nomes = [String(req.body.nome).trim()];
    }

    if (nomes.length === 0) {
      return res.status(400).json({ ok: false, erro: "Informe pelo menos um nome." });
    }

    nomes = nomes.map((n) => n.slice(0, MAX_NOME));

    const inseridos = [];
    for (const nome of nomes) {
      const { rows } = await pool.query(
        "INSERT INTO confirmacoes (nome) VALUES ($1) RETURNING id, nome, criado_em",
        [nome]
      );
      inseridos.push(rows[0]);
    }

    return res.status(201).json({ ok: true, confirmacoes: inseridos, total: inseridos.length });
  } catch (err) {
    console.error("[api] Erro ao confirmar:", err.message);
    return res.status(500).json({ ok: false, erro: "Nao foi possivel registrar. Tente de novo." });
  }
});

// ---- API publica: total de confirmados (para mostrar no site) --------------
app.get("/api/contagem", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT COUNT(*)::int AS total FROM confirmacoes");
    return res.json({ ok: true, total: rows[0].total });
  } catch (err) {
    console.error("[api] Erro na contagem:", err.message);
    return res.status(500).json({ ok: false, total: 0 });
  }
});

// ---- Middleware de autenticacao do admin -----------------------------------
function checkAdmin(req, res, next) {
  const senha =
    req.headers["x-admin-password"] ||
    (req.query && req.query.senha) ||
    "";
  if (senha === ADMIN_PASSWORD) return next();
  return res.status(401).json({ ok: false, erro: "Senha incorreta." });
}

// ---- API admin: lista completa de confirmados ------------------------------
app.get("/api/admin/confirmacoes", checkAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nome, criado_em FROM confirmacoes ORDER BY criado_em DESC"
    );
    return res.json({ ok: true, total: rows.length, confirmacoes: rows });
  } catch (err) {
    console.error("[api] Erro ao listar:", err.message);
    return res.status(500).json({ ok: false, erro: "Erro ao carregar a lista." });
  }
});

// ---- API admin: remover uma confirmacao (caso duplicada) -------------------
app.delete("/api/admin/confirmacoes/:id", checkAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, erro: "ID invalido." });
    }
    await pool.query("DELETE FROM confirmacoes WHERE id = $1", [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("[api] Erro ao remover:", err.message);
    return res.status(500).json({ ok: false, erro: "Erro ao remover." });
  }
});

// ---- Inicializacao ---------------------------------------------------------
init()
  .catch((err) => {
    // Mesmo que a criacao da tabela falhe na largada, sobe o servidor: o
    // Railway pode demorar a disponibilizar o banco nas primeiras tentativas.
    console.error("[db] Falha ao inicializar tabela:", err.message);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`[server] Site da Clarice rodando na porta ${PORT}`);
    });
  });
