/* ===========================================================
   Aniversário da Clarice — interações
   =========================================================== */

// Data/hora da festa (horário de Brasília, UTC-3): 20/06/2026 às 15h
const PARTY_DATE = new Date("2026-06-20T15:00:00-03:00");

/* ---------- Patinhas flutuantes ---------- */
(function spawnPaws() {
  const layer = document.getElementById("paws");
  if (!layer) return;
  const total = window.innerWidth < 600 ? 7 : 12;
  for (let i = 0; i < total; i++) {
    const p = document.createElement("span");
    p.className = "paw";
    p.textContent = "🐾";
    p.style.left = Math.random() * 100 + "vw";
    p.style.fontSize = 18 + Math.random() * 22 + "px";
    p.style.animationDuration = 12 + Math.random() * 16 + "s";
    p.style.animationDelay = -Math.random() * 20 + "s";
    layer.appendChild(p);
  }
})();

/* ---------- Revelação ao rolar ---------- */
(function revealOnScroll() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("show"));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("show");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => obs.observe(el));
})();

/* ---------- Contagem regressiva ---------- */
(function countdown() {
  const dEl = document.getElementById("cd-d");
  const hEl = document.getElementById("cd-h");
  const mEl = document.getElementById("cd-m");
  const sEl = document.getElementById("cd-s");
  const doneEl = document.getElementById("cd-done");
  const grid = document.getElementById("countdown");
  if (!dEl) return;

  const last = { d: "", h: "", m: "", s: "" };

  function set(el, key, val) {
    const str = String(val).padStart(2, "0");
    if (last[key] !== str) {
      el.textContent = str;
      el.classList.remove("flip");
      void el.offsetWidth; // reinicia animação
      el.classList.add("flip");
      last[key] = str;
    }
  }

  function tick() {
    const diff = PARTY_DATE - new Date();
    if (diff <= 0) {
      if (grid) grid.hidden = true;
      if (doneEl) doneEl.hidden = false;
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    set(dEl, "d", d);
    set(hEl, "h", h);
    set(mEl, "m", m);
    set(sEl, "s", s);
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------- Contador de confirmados ---------- */
async function carregarContagem() {
  const el = document.getElementById("counter");
  if (!el) return;
  try {
    const r = await fetch("/api/contagem");
    const data = await r.json();
    const n = data.total || 0;
    el.innerHTML =
      n === 0
        ? "Seja o primeiro a confirmar! 🎈"
        : `Já temos <b>${n}</b> ${n === 1 ? "presença confirmada" : "presenças confirmadas"}! 🎉`;
  } catch {
    el.textContent = "";
  }
}
carregarContagem();

/* ---------- Confete ---------- */
function dispararConfete() {
  const canvas = document.getElementById("confetti");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const cores = ["#5aa9e6", "#1f3d7a", "#e8853a", "#f4799e", "#ffd84d", "#8fd18a", "#ffffff"];
  const pecas = [];
  for (let i = 0; i < 160; i++) {
    pecas.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height,
      r: 6 + Math.random() * 8,
      c: cores[(Math.random() * cores.length) | 0],
      vy: 2 + Math.random() * 4,
      vx: -2 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
    });
  }

  let frames = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pecas.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    });
    frames++;
    if (frames < 220) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  draw();
}

/* ---------- Modal ---------- */
const modal = document.getElementById("modal");
document.getElementById("modalClose")?.addEventListener("click", () => {
  modal.hidden = true;
});
modal?.addEventListener("click", (e) => {
  if (e.target === modal) modal.hidden = true;
});

/* ---------- Acompanhantes ---------- */
(function setupCompanions() {
  const btnAdd   = document.getElementById("btnAddComp");
  const container = document.getElementById("companions");
  if (!btnAdd || !container) return;

  const MAX = 8;
  let count = 0;

  btnAdd.addEventListener("click", () => {
    if (count >= MAX) return;
    count++;

    const uid = `comp-${count}`;
    const row = document.createElement("div");
    row.className = "comp-row";
    row.innerHTML = `
      <div class="field">
        <input type="text" id="${uid}" maxlength="80" placeholder=" " />
        <label for="${uid}">Nome do acompanhante</label>
      </div>
      <button type="button" class="btn-rm-comp" aria-label="Remover">×</button>`;

    row.querySelector(".btn-rm-comp").addEventListener("click", () => {
      row.remove();
      count--;
      btnAdd.disabled = false;
      btnAdd.textContent = "🐾 Adicionar acompanhante";
    });

    container.appendChild(row);
    row.querySelector("input").focus();

    if (count >= MAX) {
      btnAdd.disabled = true;
      btnAdd.textContent = "Máximo de acompanhantes atingido";
    }
  });
})();

/* ---------- Envio do formulário ---------- */
const form = document.getElementById("rsvpForm");
const msg  = document.getElementById("formMsg");
const btn  = document.getElementById("btnConfirm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  msg.className  = "form-msg";
  msg.textContent = "";

  if (!nome) {
    msg.classList.add("err");
    msg.textContent = "Por favor, escreva o seu nome. 🙂";
    return;
  }

  // Coleta acompanhantes preenchidos
  const extras = Array.from(
    document.querySelectorAll("#companions input")
  ).map((el) => el.value.trim()).filter(Boolean);

  const nomes = [nome, ...extras];

  btn.disabled = true;
  btn.classList.add("loading");

  try {
    const r = await fetch("/api/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomes }),
    });
    const data = await r.json();

    if (!r.ok || !data.ok) throw new Error(data.erro || "Erro ao confirmar.");

    form.reset();
    document.getElementById("companions").innerHTML = "";

    const primeiroNome = nome.split(" ")[0];
    const total = nomes.length;
    dispararConfete();
    document.getElementById("modalTitle").textContent = "Oba! Presença confirmada! 🎉";
    document.getElementById("modalText").textContent =
      total === 1
        ? `Que alegria, ${primeiroNome}! Te esperamos na festa da Clarice. 💙`
        : `Que alegria! ${primeiroNome} e mais ${total - 1} acompanhante${total > 2 ? "s" : ""} confirmados! 💙🐾`;

    modal.hidden = false;
    carregarContagem();
  } catch (err) {
    msg.classList.add("err");
    msg.textContent = err.message || "Ops! Tente novamente.";
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
  }
});

/* Redimensiona o canvas de confete se a janela mudar */
window.addEventListener("resize", () => {
  const canvas = document.getElementById("confetti");
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

/* ---------- Lembrete no calendário ---------- */
(function setupLembrete() {
  const btn = document.getElementById("reminderBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    // 20/06/2026 às 15h (Brasília = UTC-3) → 18h UTC
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Aniversario Clarice//PT-BR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "DTSTART:20260620T180000Z",
      "DTEND:20260620T220000Z",
      "SUMMARY:🎂 Aniversário da Clarice",
      "DESCRIPTION:Festa de aniversário da Clarice! Tema Bluey 🐾\\nVenha se divertir com a gente!",
      "LOCATION:Salão de Festa do Edifício Laura Caula\\, Rua Neto Campelo n°70",
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      "DESCRIPTION:Lembrete: Aniversário da Clarice amanhã! 🎉",
      "END:VALARM",
      "BEGIN:VALARM",
      "TRIGGER:-PT1H",
      "ACTION:DISPLAY",
      "DESCRIPTION:Falta 1 hora para o aniversário da Clarice! 🎂",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "niver-clarice.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    btn.textContent = "✅ Lembrete criado!";
    btn.classList.add("ok");
    setTimeout(() => {
      btn.textContent = "📅 Salvar lembrete no celular";
      btn.classList.remove("ok");
    }, 3000);
  });
})();

/* ---------- Música de fundo ---------- */
(function setupMusic() {
  const audio = document.getElementById("bgMusic");
  const btn   = document.getElementById("musicBtn");
  if (!audio || !btn) return;

  audio.volume = 0.35;
  let started = false;

  function setPlaying(playing) {
    btn.textContent = playing ? "♫" : "♪";
    btn.title       = playing ? "Pausar música" : "Tocar música";
    btn.setAttribute("aria-label", playing ? "Pausar música" : "Tocar música");
    btn.classList.toggle("playing", playing);
  }

  function tryPlay() {
    if (started) return;
    started = true;
    audio.play().then(() => setPlaying(true)).catch(() => { started = false; });
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (audio.paused) {
      audio.play().then(() => { started = true; setPlaying(true); }).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  });

  // Inicia automaticamente no primeiro toque/clique do usuário na página
  document.addEventListener("click",      tryPlay, { once: true });
  document.addEventListener("touchstart", tryPlay, { once: true });
})();
