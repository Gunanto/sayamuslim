const BASE_URL = "https://api.myquran.com/v3";
const CACHE_PREFIX = "sm-cache:";
const DEFAULT_CACHE_SECONDS = 300;

const el = (id) => document.getElementById(id);
const setOutput = (id, data) => {
  const node = el(id);
  node.classList.remove("loading");
  node.textContent = data;
};

const setLoading = (id) => {
  const node = el(id);
  node.classList.add("loading");
  node.textContent = "Memuat...";
};

const setList = (id, html) => {
  const node = el(id);
  node.classList.remove("loading");
  node.innerHTML = html;
};

const setHtml = (id, html) => {
  const node = el(id);
  node.classList.remove("loading");
  node.innerHTML = html;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderKeyValue = (pairs) =>
  `<div class="kv">${pairs
    .map(
      ([label, value]) =>
        `<div class="label">${escapeHtml(label)}</div><div>${escapeHtml(value)}</div>`,
    )
    .join("")}</div>`;

const renderJadwal = (jadwalObj) => {
  const entries = Object.values(jadwalObj || {});
  if (!entries.length) return "<div>Jadwal tidak tersedia.</div>";
  return entries
    .map((item) => {
      return `<div class="card" style="margin-top:10px">
        <div class="title">${escapeHtml(item.tanggal || "")}</div>
        ${renderKeyValue([
          ["Imsak", item.imsak],
          ["Subuh", item.subuh],
          ["Terbit", item.terbit],
          ["Dhuha", item.dhuha],
          ["Dzuhur", item.dzuhur],
          ["Ashar", item.ashar],
          ["Maghrib", item.maghrib],
          ["Isya", item.isya],
        ])}
      </div>`;
    })
    .join("");
};

const renderQuranAyah = (data) => {
  if (!data) return "Data tidak tersedia.";
  return `
    <div class="title">QS ${escapeHtml(data.surah_number)}:${escapeHtml(
      data.ayah_number,
    )}</div>
    <div class="arab">${escapeHtml(data.arab)}</div>
    <div class="translation">${escapeHtml(data.translation)}</div>
    <div class="meta">
      <span class="pill-inline">Juz: ${escapeHtml(data.meta?.juz ?? "-")}</span>
      <span class="pill-inline">Page: ${escapeHtml(data.meta?.page ?? "-")}</span>
      <span class="pill-inline">Ruku: ${escapeHtml(data.meta?.ruku ?? "-")}</span>
    </div>
  `;
};

const renderHadisDetail = (data) => {
  if (!data) return "Data tidak tersedia.";
  return `
    <div class="title">Hadis #${escapeHtml(data.id)}</div>
    <div class="arab">${escapeHtml(data.text?.ar || "")}</div>
    <div class="translation">${escapeHtml(data.text?.id || "")}</div>
    <div class="meta">
      <span class="pill-inline">Grade: ${escapeHtml(data.grade ?? "-")}</span>
      <span class="pill-inline">Takhrij: ${escapeHtml(data.takhrij ?? "-")}</span>
    </div>
  `;
};

const getCache = (key, ttlSeconds) => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.at > ttlSeconds * 1000) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
};

const setCache = (key, data) => {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ at: Date.now(), data }),
    );
  } catch {
    // ignore storage errors
  }
};

const fetchJson = async (path, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const cacheSeconds = options.cacheSeconds ?? DEFAULT_CACHE_SECONDS;
  const cacheKey = `${method}:${path}`;

  if (method === "GET" && cacheSeconds > 0) {
    const cached = getCache(cacheKey, cacheSeconds);
    if (cached) return cached;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const data = await res.json();
  if (method === "GET" && cacheSeconds > 0) {
    setCache(cacheKey, data);
  }
  return data;
};

const state = {
  sholatLocations: [],
};

// Mode baca toggles
el("quran-read-mode").addEventListener("click", () => {
  el("quran-ayah-output").classList.toggle("reading-mode");
});

el("hadis-read-mode").addEventListener("click", () => {
  el("hadis-output").classList.toggle("reading-mode");
});

// Night reading mode toggle (global)
const nightToggle = el("night-reading-toggle");
const NIGHT_KEY = "sm-night-reading";
const applyNight = (enabled) => {
  document.body.classList.toggle("night-reading", enabled);
  nightToggle.textContent = enabled ? "Day Mode" : "Night Reading";
};

const savedNight = localStorage.getItem(NIGHT_KEY) === "1";
applyNight(savedNight);

nightToggle.addEventListener("click", () => {
  const next = !document.body.classList.contains("night-reading");
  applyNight(next);
  localStorage.setItem(NIGHT_KEY, next ? "1" : "0");
});

// Sholat
el("sholat-search").addEventListener("click", async () => {
  const keyword = el("sholat-keyword").value.trim();
  if (!keyword) return;
  setLoading("sholat-results");
  try {
    const data = await fetchJson(
      `/sholat/kabkota/cari/${encodeURIComponent(keyword)}`,
    );
    state.sholatLocations = data.data || [];
    if (!state.sholatLocations.length) {
      setOutput("sholat-results", "Tidak ada hasil.");
      return;
    }
    const list = state.sholatLocations
      .map(
        (loc) =>
          `<div class="list-item"><span>${loc.lokasi}</span><button data-id="${loc.id}">Pilih</button></div>`,
      )
      .join("");
    setList("sholat-results", list);
    el("sholat-results")
      .querySelectorAll("button[data-id]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          el("sholat-results").dataset.selectedId = btn.dataset.id;
          el("sholat-results").dataset.selectedName =
            btn.parentElement.querySelector("span").textContent;
        });
      });
  } catch (err) {
    setOutput("sholat-results", `Error: ${err.message}`);
  }
});

el("sholat-load").addEventListener("click", async () => {
  const period = el("sholat-period").value;
  const id = el("sholat-results").dataset.selectedId;
  const name = el("sholat-results").dataset.selectedName || "";
  if (!id) {
    setOutput("sholat-output", "Pilih lokasi dulu.");
    return;
  }
  setLoading("sholat-output");
  try {
    const path =
      period === "today"
        ? `/sholat/jadwal/${id}/today`
        : `/sholat/jadwal/${id}/${period}`;
    const data = await fetchJson(path);
    const header = `<div class="title">${escapeHtml(name)}</div>`;
    const jadwal = data.data?.jadwal || data.data?.data?.jadwal || data.jadwal;
    const body = renderJadwal(jadwal);
    setHtml("sholat-output", `${header}${body}`);
  } catch (err) {
    setOutput("sholat-output", `Error: ${err.message}`);
  }
});

// Kalender
el("cal-today").addEventListener("click", async () => {
  setLoading("cal-today-output");
  try {
    const data = await fetchJson("/cal/today", { cacheSeconds: 600 });
    const d = data.data || data;
    const html = `
      <div class="title">${escapeHtml(d.hijr?.today || "")}</div>
      <div class="meta">${escapeHtml(d.ce?.today || "")}</div>
      ${renderKeyValue([
        ["Metode", d.method],
        ["Adjustment", d.adjustment],
      ])}
    `;
    setHtml("cal-today-output", html);
  } catch (err) {
    setOutput("cal-today-output", `Error: ${err.message}`);
  }
});

el("cal-ce").addEventListener("click", async () => {
  const date = el("cal-ce-date").value.trim();
  if (!date) return;
  setLoading("cal-ce-output");
  try {
    const data = await fetchJson(`/cal/ce/${encodeURIComponent(date)}`);
    const d = data.data || data;
    const html = `
      <div class="title">${escapeHtml(d.ce?.today || "")}</div>
      <div class="meta">${escapeHtml(d.hijr?.today || "")}</div>
      ${renderKeyValue([
        ["Metode", d.method],
        ["Adjustment", d.adjustment],
      ])}
    `;
    setHtml("cal-ce-output", html);
  } catch (err) {
    setOutput("cal-ce-output", `Error: ${err.message}`);
  }
});

el("cal-hijr").addEventListener("click", async () => {
  const date = el("cal-hijr-date").value.trim();
  if (!date) return;
  setLoading("cal-hijr-output");
  try {
    const data = await fetchJson(`/cal/hijr/${encodeURIComponent(date)}`);
    const d = data.data || data;
    const html = `
      <div class="title">${escapeHtml(d.hijr?.today || "")}</div>
      <div class="meta">${escapeHtml(d.ce?.today || "")}</div>
      ${renderKeyValue([
        ["Metode", d.method],
        ["Adjustment", d.adjustment],
      ])}
    `;
    setHtml("cal-hijr-output", html);
  } catch (err) {
    setOutput("cal-hijr-output", `Error: ${err.message}`);
  }
});

// Quran
el("quran-load").addEventListener("click", async () => {
  setLoading("quran-list");
  try {
    const data = await fetchJson("/quran", { cacheSeconds: 3600 });
    const list = (data.data || [])
      .map(
        (s) =>
          `<div class="list-item"><span>${s.number}. ${s.name_latin}</span><button data-surah="${s.number}">Buka</button></div>`,
      )
      .join("");
    setList("quran-list", list || "Data kosong.");
    el("quran-list")
      .querySelectorAll("button[data-surah]")
      .forEach((btn) => {
        btn.addEventListener("click", async () => {
          const surah = btn.dataset.surah;
          el("quran-surah").value = surah;
          setOutput("quran-ayah-output", "Memuat detail surah...");
          const detail = await fetchJson(`/quran/${surah}`);
          const d = detail.data || detail;
          const html = `
            <div class="title">${escapeHtml(d.name_latin || "")}</div>
            <div class="meta">${escapeHtml(d.translation || "")} • ${escapeHtml(
              d.revelation || "",
            )}</div>
            ${renderKeyValue([
              ["Jumlah Ayat", d.number_of_ayahs],
              ["Audio Surah", d.audio_url ? "Tersedia" : "Tidak"],
            ])}
          `;
          setHtml("quran-ayah-output", html);
        });
      });
  } catch (err) {
    setOutput("quran-list", `Error: ${err.message}`);
  }
});

el("quran-search").addEventListener("input", () => {
  const query = el("quran-search").value.toLowerCase();
  const items = el("quran-list").querySelectorAll(".list-item");
  if (!items) return;
  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query) ? "flex" : "none";
  });
});

el("quran-ayah-load").addEventListener("click", async () => {
  const surah = el("quran-surah").value.trim();
  const ayah = el("quran-ayah").value.trim();
  if (!surah || !ayah) return;
  setLoading("quran-ayah-output");
  try {
    const data = await fetchJson(`/quran/${surah}/${ayah}`);
    setHtml("quran-ayah-output", renderQuranAyah(data.data || data));
    const audio = data.data?.audio_url;
    const audioEl = el("quran-audio");
    if (audio) {
      audioEl.src = audio;
      audioEl.style.display = "block";
    } else {
      audioEl.removeAttribute("src");
      audioEl.style.display = "none";
    }
  } catch (err) {
    setOutput("quran-ayah-output", `Error: ${err.message}`);
  }
});

// Hadis
const renderHadisList = (items) => {
  if (!items || !items.length) {
    setOutput("hadis-list", "Tidak ada hasil.");
    return;
  }
  setList(
    "hadis-list",
    items
      .map(
        (h) =>
          `<div class="list-item"><span>${h.id} - ${h.text?.id || h.text}</span><button data-id="${h.id}">Detail</button></div>`,
      )
      .join(""),
  );
  el("hadis-list")
    .querySelectorAll("button[data-id]")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        el("hadis-id").value = btn.dataset.id;
        el("hadis-detail").click();
      });
    });
};

el("hadis-random").addEventListener("click", async () => {
  setLoading("hadis-output");
  try {
    const data = await fetchJson("/hadis/enc/random");
    setHtml("hadis-output", renderHadisDetail(data.data || data));
  } catch (err) {
    setOutput("hadis-output", `Error: ${err.message}`);
  }
});

el("hadis-search").addEventListener("click", async () => {
  const keyword = el("hadis-keyword").value.trim();
  if (!keyword) return;
  setLoading("hadis-list");
  try {
    const data = await fetchJson(
      `/hadis/enc/cari/${encodeURIComponent(keyword)}`,
    );
    renderHadisList(data.data?.hadis || data.data || []);
  } catch (err) {
    setOutput("hadis-list", `Error: ${err.message}`);
  }
});

el("hadis-explore").addEventListener("click", async () => {
  const page = el("hadis-page").value.trim() || "1";
  const limit = el("hadis-limit").value.trim() || "10";
  setLoading("hadis-list");
  try {
    const data = await fetchJson(
      `/hadis/enc/explore?page=${page}&limit=${limit}`,
    );
    renderHadisList(data.data?.hadis || []);
  } catch (err) {
    setOutput("hadis-list", `Error: ${err.message}`);
  }
});

el("hadis-detail").addEventListener("click", async () => {
  const id = el("hadis-id").value.trim();
  if (!id) return;
  setLoading("hadis-output");
  try {
    const data = await fetchJson(`/hadis/enc/show/${id}`);
    setHtml("hadis-output", renderHadisDetail(data.data || data));
  } catch (err) {
    setOutput("hadis-output", `Error: ${err.message}`);
  }
});

el("hadis-prev").addEventListener("click", async () => {
  const id = el("hadis-id").value.trim();
  if (!id) return;
  try {
    const data = await fetchJson(`/hadis/enc/prev/${id}`);
    el("hadis-id").value = data.data?.id || "";
    setHtml("hadis-output", renderHadisDetail(data.data || data));
  } catch (err) {
    setOutput("hadis-output", `Error: ${err.message}`);
  }
});

el("hadis-next").addEventListener("click", async () => {
  const id = el("hadis-id").value.trim();
  if (!id) return;
  try {
    const data = await fetchJson(`/hadis/enc/next/${id}`);
    el("hadis-id").value = data.data?.id || "";
    setHtml("hadis-output", renderHadisDetail(data.data || data));
  } catch (err) {
    setOutput("hadis-output", `Error: ${err.message}`);
  }
});

// Perawi
el("perawi-browse").addEventListener("click", async () => {
  const page = el("perawi-page").value.trim() || "1";
  const limit = el("perawi-limit").value.trim() || "10";
  setLoading("perawi-list");
  try {
    const data = await fetchJson(
      `/hadist/perawi/browse?page=${page}&limit=${limit}`,
    );
    const items = data.data?.rawi || [];
    setList(
      "perawi-list",
      items
        .map(
          (p) =>
            `<div class="list-item"><span>${p.id} - ${p.name || "Tanpa nama"}</span><button data-id="${p.id}">Detail</button></div>`,
        )
        .join(""),
    );
    el("perawi-list")
      .querySelectorAll("button[data-id]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          el("perawi-id").value = btn.dataset.id;
          el("perawi-detail").click();
        });
      });
  } catch (err) {
    setOutput("perawi-list", `Error: ${err.message}`);
  }
});

el("perawi-detail").addEventListener("click", async () => {
  const id = el("perawi-id").value.trim();
  if (!id) return;
  setLoading("perawi-output");
  try {
    const data = await fetchJson(`/hadist/perawi/id/${id}`);
    const d = data.data || data;
    const html = `
      <div class="title">${escapeHtml(d.name || "Perawi")}</div>
      ${renderKeyValue([
        ["ID", d.id],
        ["Grade", d.grade || "-"],
        ["Birth", d.birth_date_place || d.birth_date || "-"],
        ["Death", d.death_date_place || d.death_date || "-"],
        ["Teachers", d.teachers || "-"],
        ["Students", d.students || "-"],
      ])}
    `;
    setHtml("perawi-output", html);
  } catch (err) {
    setOutput("perawi-output", `Error: ${err.message}`);
  }
});
