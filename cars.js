// cars.js
(function () {
  const $ = (id) => document.getElementById(id);

  const grid = $("grid");
  const counter = $("counter");
  const statTotal = $("statTotal");

  if (!grid) {
    console.warn("[cars.js] Не знайдено контейнер #grid");
    return;
  }

  const q = $("q");
  const brandSel = $("brand"); // може бути відсутній
  const yearMin = $("yearMin") || $("yearFrom"); // підтримка різних id
  const yearMax = $("yearMax") || $("yearTo");
  const priceMax = $("priceMax");

  const applyBtn = $("apply");
  const resetBtn = $("reset");

  // Контакти
  const TELEGRAM_USERNAME = "AutoGBPBot";
  const WHATSAPP_NUMBER = "380508232374";
  const PREFER = "telegram"; // "telegram" або "whatsapp"

  const writeLink = (text) => {
    if (PREFER === "whatsapp") {
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    }
    return `https://t.me/${TELEGRAM_USERNAME}?start=${encodeURIComponent("cars")}`;
  };

  const topWrite = $("writeTop");
  if (topWrite) topWrite.href = writeLink("Привіт! Хочу підібрати авто. Мій бюджет: ...");

  // ---- DATA ----
  const raw = Array.isArray(window.CARS) ? window.CARS : [];
  const cars = raw.map(normalizeCar).filter(Boolean);

  function normalizeCar(c) {
    if (!c) return null;

    // Підтримка різних форматів:
    const title = c.title || `${c.brand || ""} ${c.model || ""}`.trim() || "Авто";
    const photos = Array.isArray(c.photos) ? c.photos.filter(Boolean) : [];
    const img = (c.img && String(c.img).trim()) ? String(c.img).trim() : "";
    const thumb = photos[0] || img || "";

    // Спроба витягнути brand/model з title (не критично)
    let brand = c.brand || "";
    let model = c.model || "";
    if (!brand && title) {
      const parts = String(title).trim().split(/\s+/);
      brand = parts[0] || "";
      model = parts.slice(1).join(" ");
    }

    return {
      id: String(c.id || title).trim(),
      title,
      brand,
      model,
      year: c.year || "",
      price: c.price || 0,
      mileage: c.mileage || "",
      fuel: c.fuel || "",

      body: c.body || "",
      drive: c.drive || "",
      engine: c.engine || "",
      location: c.location || "",

      origin: c.origin || "",
      status: c.status || "",
      tags: Array.isArray(c.tags) ? c.tags : [],
      desc: c.desc || c.note || "",
      photos,
      img,
      thumb
    };
  }

  // Fill brand dropdown (якщо є)
  if (brandSel) {
    const brands = Array.from(new Set(cars.map((c) => c.brand).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    brands.forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b;
      opt.textContent = b;
      brandSel.appendChild(opt);
    });
  }

  const fmtMoney = (n) => `$${Number(n || 0).toLocaleString("en-US")}`;

  function statusLabel(s) {
    const v = String(s || "").toLowerCase();
    if (v === "in") return "В наявності";
    if (v === "order") return "В дорозі";
    if (v === "sold") return "Продано";
    return s || "—";
  }

  function placeholderImg() {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Crect width='100%25' height='100%25' fill='%230b0f14'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffd84a' font-family='Arial' font-size='48'%3EAuto%20GBP%3C/text%3E%3C/svg%3E";
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cardHTML(c) {
    const imgSrc = c.thumb || placeholderImg();

    const origin = c.origin ? `<span class="badge gold">${escapeHtml(c.origin)}</span>` : "";
    const st = c.status ? `<span class="badge">${escapeHtml(statusLabel(c.status))}</span>` : "";

    return `
      <div class="card" data-id="${escapeHtml(c.id)}">
        <div class="thumb">
          <img src="${imgSrc}" alt="${escapeHtml(c.title)}" loading="lazy">
          <div class="badges">
            ${origin}
            ${st}
          </div>
        </div>

        <div class="body">
          <div class="title">
            <h4>${escapeHtml(c.title)}${c.year ? ` • ${escapeHtml(String(c.year))}` : ""}</h4>
            <div class="price">${fmtMoney(c.price)}</div>
          </div>

          <div class="meta">
            <div><span>Кузов</span><b>${escapeHtml(c.body || "—")}</b></div>
            <div><span>Привід</span><b>${escapeHtml(c.drive || "—")}</b></div>
            <div><span>Двигун</span><b>${escapeHtml(c.engine || c.fuel || "—")}</b></div>
            <div><span>Локація</span><b>${escapeHtml(c.location || "—")}</b></div>
          </div>

          <div class="desc">${escapeHtml(c.desc || "")}</div>

          <div class="card-actions">
            <button class="small primary" data-open="${escapeHtml(c.id)}">🔍 Деталі</button>
            <a class="small" target="_blank" rel="noopener" href="${writeLink(
              `Хочу по авто: ${c.title} ${c.year}. Ціна: ${fmtMoney(c.price)}. Підкажіть деталі.`
            )}">✉️ Написати</a>
          </div>
        </div>
      </div>
    `;
  }

  function render(list) {
    grid.innerHTML = list.map(cardHTML).join("");

    const shown = list.length;
    const total = cars.length;

    if (counter) counter.textContent = `Показано: ${shown} з ${total}`;
    if (statTotal) statTotal.textContent = total;

    grid.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-open");
        const car = cars.find((x) => x.id === id);
        if (car) openModal(car);
      });
    });
  }

  function applyFilters() {
    const qq = (q && q.value ? q.value : "").trim().toLowerCase();
    const bb = brandSel ? brandSel.value : "";
    const yMin = yearMin && yearMin.value ? Number(yearMin.value) : 0;
    const yMax = yearMax && yearMax.value ? Number(yearMax.value) : 0;
    const pMax = priceMax && priceMax.value ? Number(priceMax.value) : 0;

    let list = cars.slice();

    if (qq) {
      list = list.filter((c) => {
        const hay =
          `${c.title} ${c.brand} ${c.model} ${(c.tags || []).join(" ")} ${c.desc}`.toLowerCase();
        return hay.includes(qq);
      });
    }

    if (bb) list = list.filter((c) => c.brand === bb);
    if (yMin) list = list.filter((c) => Number(c.year || 0) >= yMin);
    if (yMax) list = list.filter((c) => Number(c.year || 0) <= yMax);
    if (pMax) list = list.filter((c) => Number(c.price || 0) <= pMax);

    render(list);
  }

  // ---- MODAL ----
  const modal = $("modal");
  const close = $("close");
  const mImg = $("mImg");
  const mTitle = $("mTitle");
  const mPrice = $("mPrice");
  const mYear = $("mYear");
  const mMileage = $("mMileage");
  const mFuel = $("mFuel");
  const mDrive = $("mDrive");
  const mStatus = $("mStatus");
  const mDesc = $("mDesc");
  const mWrite = $("mWrite");
  const mCopy = $("mCopy");

  function openModal(c) {
    if (!modal) return;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    const list = (c.photos && c.photos.length ? c.photos : (c.img ? [c.img] : []));
    modal.dataset.photos = JSON.stringify(list);
    modal.dataset.idx = "0";

    if (mImg) {
      mImg.src = (list[0] || c.thumb || placeholderImg());
      mImg.alt = c.title;

      // тап по фото = наступне
      mImg.onclick = () => {
        try {
          const arr = JSON.parse(modal.dataset.photos || "[]");
          if (!arr.length) return;
          let idx = Number(modal.dataset.idx || 0);
          idx = (idx + 1) % arr.length;
          modal.dataset.idx = String(idx);
          mImg.src = arr[idx];
        } catch (e) {}
      };
    }

    if (mTitle) mTitle.textContent = c.title;
    if (mPrice) mPrice.textContent = fmtMoney(c.price || 0);
    if (mYear) mYear.textContent = c.year || "—";
    if (mMileage) mMileage.textContent = c.mileage || "—";
    if (mFuel) mFuel.textContent = c.engine || c.fuel || "—";
    if (mDrive) mDrive.textContent = c.drive || "—";
    if (mStatus) mStatus.textContent = statusLabel(c.status);
    if (mDesc) mDesc.textContent = c.desc || "";

    if (mWrite) {
      mWrite.href = writeLink(`Хочу по авто: ${c.title} ${c.year}. Ціна: ${fmtMoney(c.price)}. Підкажіть деталі.`);
    }

    if (mCopy) {
      mCopy.onclick = async () => {
        const txt =
`Auto GBP — Авто
${c.title}
Рік: ${c.year || "—"}
Ціна: ${fmtMoney(c.price)}
Пробіг: ${c.mileage || "—"}
Кузов: ${c.body || "—"}
Привід: ${c.drive || "—"}
Двигун: ${c.engine || c.fuel || "—"}
Локація: ${c.location || "—"}
Статус: ${statusLabel(c.status)}`;
        try {
          await navigator.clipboard.writeText(txt);
          mCopy.textContent = "✅ Скопійовано";
          setTimeout(() => (mCopy.textContent = "📋 Скопіювати дані"), 1200);
        } catch (e) {
          alert("Не вдалося скопіювати. Спробуй вручну.");
        }
      };
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  if (close) close.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  if (applyBtn) applyBtn.addEventListener("click", applyFilters);
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (q) q.value = "";
      if (brandSel) brandSel.value = "";
      if (yearMin) yearMin.value = "";
      if (yearMax) yearMax.value = "";
      if (priceMax) priceMax.value = "";
      applyFilters();
    });
  }

  // Enter -> apply
  [q, yearMin, yearMax, priceMax].filter(Boolean).forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });
  });
  if (brandSel) brandSel.addEventListener("change", applyFilters);

  // init
  render(cars);
})();
