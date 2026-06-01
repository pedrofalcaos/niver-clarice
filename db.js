const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

let pool, init;

if (!connectionString) {
  // Modo local sem banco: armazenamento em memória para testar o site
  console.warn(
    "[db] DATABASE_URL nao definida — modo local ativado (dados em memoria, nao persistem)."
  );

  let nextId = 1;
  const store = [];

  pool = {
    query(sql, params = []) {
      const s = sql.replace(/\s+/g, " ").trim().toUpperCase();
      if (s.startsWith("CREATE TABLE")) {
        return Promise.resolve({ rows: [] });
      }
      if (s.startsWith("INSERT INTO CONFIRMACOES")) {
        const row = { id: nextId++, nome: params[0], criado_em: new Date().toISOString() };
        store.push(row);
        return Promise.resolve({ rows: [row] });
      }
      if (s.includes("COUNT(*)")) {
        return Promise.resolve({ rows: [{ total: store.length }] });
      }
      if (s.startsWith("SELECT") && s.includes("ORDER BY CRIADO_EM DESC")) {
        const rows = [...store].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
        return Promise.resolve({ rows });
      }
      if (s.startsWith("DELETE")) {
        const id = Number(params[0]);
        const i = store.findIndex((c) => c.id === id);
        if (i !== -1) store.splice(i, 1);
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    },
    on() {},
  };

  init = () => {
    console.log("[db] Armazenamento em memoria pronto.");
    return Promise.resolve();
  };
} else {
  // Produção: PostgreSQL real (Railway injeta DATABASE_URL automaticamente)
  const useSSL =
    process.env.PGSSL === "true" ||
    /[?&]sslmode=require/.test(connectionString) ||
    process.env.NODE_ENV === "production";

  pool = new Pool({
    connectionString,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
  });

  pool.on("error", (err) => {
    console.error("[db] Erro inesperado no pool do PostgreSQL:", err.message);
  });

  init = async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS confirmacoes (
        id        SERIAL PRIMARY KEY,
        nome      TEXT NOT NULL,
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("[db] Tabela 'confirmacoes' pronta.");
  };
}

module.exports = { pool, init };
