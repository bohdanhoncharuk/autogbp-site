// cars.js
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  const grid = $("#grid");
  const counter = $("#counter");
  const statTotal = $("#statTotal");

  const q = $("#q");
  const brandSel = $("#brand");
  const yearMin = $("#yearMin");
  const priceMax = $("#priceMax");

  const applyBtn = $("#apply");
  const resetBtn = $("#reset");

  // Куди веде "Написати"
  const TELEGRAM_USERNAME = "AutoGBPBot";     // без @
  const WHATSAPP_NUMBER = "380508232374";     // без + і пробілів
  const PREFER = "telegram";                 // "telegram" або "whatsapp"

  const writeLink = (text) => {
    if (PREFER === "whatsapp") {
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    }
    return `https://t.me/${TELEGRAM_USERNAME}?start=${encodeURIComponent("cars")}`;
    // якщо хочеш прямо з текстом (не завжди стабільно у всіх клієнтах):
    // return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;
  };

  const topWrite = $("#writeTop");
  if (topWrite) topWrite.href = writeLink("Привіт! Хочу підібрати авто. Мій бюджет: ...");

  const cars = (window.CARS || []).slice();

  // ---------- helpers ----------
  const fmtMoney = (n) => `$${Number(n || 0).toLocaleString("en-US")}`;
  const fmtMileage = (n) => `${Number(n).toLocaleString("uk-UA")} км`;

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getPhotos(car) {
    const list = [];
    if (car && typeof car.img === "string" && car.img.trim()) list.push(car.img.trim());
    if (Array.isArray(car?.photos)) {
      for (const p of car.photos) {
        if (typeof p === "string" && p.trim()) list.push(p.trim());
      }
    }
    // прибрати дублікати
    return Array.from(new Set(list));
  }

  function firstPhoto(car) {
    const list = getPhotos(car);
    return list[0] || "";
  }

  function safeText(s, fallback = "—") {
    const t = String(s ?? "").trim();
    return t ? t : fallback;
  }

  // ---------- fill brand dropdown ----------
  if (brandSel) {
    const brands = Array.from(new Set(cars.map((c) => c.brand).filter(Boolean))).sort((a, b) =>
      String(a).localeCompare(String(b))
    );
    for (const b of brands) {
      const opt = document.createElement("option");
      opt.value = b;
      opt.textContent = b;
      brandSel.appendChild(opt);
    }
  }

  // ---------- card template ----------
  function cardHTML(c) {
    const imgSrc = firstPhoto(c);
    const img = imgSrc ? `<img src="${imgSrc}" alt="${escapeHtml(c.brand)} ${escapeHtml(c.model)}" loading="lazy">` : "";

    const badge = c.badge ? `<span class="badge gold">${escapeHtml(c.badge)}</span>` : "";
    const status = c.status ? `<span class="badge">${escapeHtml(c.status)}</span>` : "";

    return `
      <div class="card" data-id="${escapeHtml(c.id)}">
        <div class="thumb">
          ${img}
          <div class="badges">
            ${badge}
            ${status}
          </div>
        </div>

        <div class="body">
          <div class="title">
            <h4>${escapeHtml(c.brand)} ${escapeHtml(c.model)}${c.year ? ` • ${escapeHtml(String(c.year))}` : ""}</h4>
            <div class="price">${fmtMoney(c.price || 0)}</div>
          </div>

          <div class="meta">
            <div><span>Рік</span><b>${escapeHtml(String(c.year || "—"))}</b></div>
            <div><span>Пробіг</span><b>${c.mileage ? fmtMileage(c.mileage) : "—"}</b></div>
            <div><span>Паливо</span><b>${escapeHtml(c.fuel || "—")}</b></div>
            <div><span>Привід</span><b>${escapeHtml(c.drive || "—")}</b></div>
          </div>

          <div class="desc">${escapeHtml(c.desc || "")}</div>

          <div class="card-actions">
            <button class="small primary" data-open="${escapeHtml(c.id)}" type="button">🔍 Деталі</button>
            <a class="small" target="_blank" rel="noopener" href="${writeLink(
              `Хочу по авто: ${c.brand} ${c.model} ${c.year || ""}. Ціна: ${fmtMoney(c.price)}. Підкажіть деталі.`
            )}">✉️ Написати</a>
          </div>
        </div>
      </div>
    `;
  }

  function render(list) {
    if (!grid) return;

    grid.innerHTML = list.map(cardHTML).join("");

    const shown = list.length;
    const total = cars.length;

    if (counter) counter.textContent = `Показано: ${shown} з ${total}`;
    if (statTotal) statTotal.textContent = String(total);

    grid.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-open");
        const car = cars.find((x) => x.id === id);
        if (car) openModal(car);
      });
    });
  }

  function applyFilters() {
    let list = cars.slice();

    const qq = (q?.value || "").trim().toLowerCase();
    const bb = brandSel?.value || "";
    const yMin = Number(yearMin?.value || 0);
    const pMax = Number(priceMax?.value || 0);

    if (qq) {
      list = list.filter((c) => `${c.brand || ""} ${c.model || ""}`.toLowerCase().includes(qq));
    }
    if (bb) {
      list = list.filter((c) => c.brand === bb);
    }
    if (yMin) {
      list = list.filter((c) => Number(c.year || 0) >= yMin);
    }
    if (pMax) {
      list = list.filter((c) => Number(c.price || 0) <= pMax);
    }

    render(list);
  }

  // ---------- modal + gallery ----------
  const modal = $("#modal");
  const closeBtn = $("#close");

  const mImg = $("#mImg");
  const mTitle = $("#mTitle");
  const mPrice = $("#mPrice");
  const mYear = $("#mYear");
  const mMileage = $("#mMileage");
  const mFuel = $("#mFuel");
  const mDrive = $("#mDrive");
  const mStatus = $("#mStatus");
  const mDesc = $("#mDesc");
  const mWrite = $("#mWrite");
  const mCopy = $("#mCopy");

  let currentCar = null;
  let gallery = { photos: [], index: 0 };

  function ensureGalleryUI() {
    if (!modal) return null;

    let wrap = $("#mGallery", modal);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "mGallery";
      wrap.style.position = "relative";
      wrap.style.marginBottom = "12px";

      // img may already be in HTML, keep it, but ensure it sits inside wrap
      if (mImg && mImg.parentElement) {
        const parent = mImg.parentElement;
        parent.insertBefore(wrap, mImg);
        wrap.appendChild(mImg);
      } else {
        // if mImg not found, create it
        const img = document.createElement("img");
        img.id = "mImg";
        img.style.width = "100%";
        img.style.display = "block";
        img.style.borderRadius = "16px";
        wrap.appendChild(img);
      }

      // prev/next buttons
      const mkBtn = (id, txt, side) => {
        const b = document.createElement("button");
        b.type = "button";
        b.id = id;
        b.textContent = txt;
        b.style.position = "absolute";
        b.style.top = "50%";
        b.style.transform = "translateY(-50%)";
        b.style[side] = "10px";
        b.style.width = "44px";
        b.style.height = "44px";
        b.style.borderRadius = "14px";
        b.style.border = "1px solid rgba(255,255,255,.14)";
        b.style.background = "rgba(0,0,0,.35)";
        b.style.color = "#fff";
        b.style.fontWeight = "900";
        b.style.backdropFilter = "blur(8px)";
        b.style.cursor = "pointer";
        return b;
      };

      const prev = mkBtn("mPrev", "‹", "left");
      const next = mkBtn("mNext", "›", "right");

      // counter
      const cnt = document.createElement("div");
      cnt.id = "mCount";
      cnt.style.position = "absolute";
      cnt.style.bottom = "10px";
      cnt.style.left = "10px";
      cnt.style.padding = "6px 10px";
      cnt.style.borderRadius = "999px";
      cnt.style.border = "1px solid rgba(255,255,255,.14)";
      cnt.style.background = "rgba(0,0,0,.35)";
      cnt.style.color = "#fff";
      cnt.style.fontWeight = "800";
      cnt.style.fontSize = "12px";
      cnt.style.backdropFilter = "blur(8px)";

      // thumbs
      const thumbs = document.createElement("div");
      thumbs.id = "mThumbs";
      thumbs.style.display = "flex";
      thumbs.style.gap = "8px";
      thumbs.style.flexWrap = "wrap";
      thumbs.style.marginTop = "10px";

      wrap.appendChild(prev);
      wrap.appendChild(next);
      wrap.appendChild(cnt);

      // Put thumbs after image block (inside same parent as wrap)
      wrap.insertAdjacentElement("afterend", thumbs);

      // events
      prev.addEventListener("click", () => showPhoto(gallery.index - 1));
      next.addEventListener("click", () => showPhoto(gallery.index + 1));

      // swipe (mobile)
      let sx = 0;
      let sy = 0;
      wrap.addEventListener("touchstart", (e) => {
        const t = e.touches?.[0];
        if (!t) return;
        sx = t.clientX;
        sy = t.clientY;
      }, { passive: true });

      wrap.addEventListener("touchend", (e) => {
        const t = e.changedTouches?.[0];
        if (!t) return;
        const dx = t.clientX - sx;
        const dy = t.clientY - sy;
        if (Math.abs(dx) > 45 && Math.abs(dy) < 60) {
          if (dx < 0) showPhoto(gallery.index + 1);
          else showPhoto(gallery.index - 1);
        }
      }, { passive: true });
    }

    return wrap;
  }

  function renderThumbs() {
    const thumbs = $("#mThumbs", modal);
    if (!thumbs) return;

    thumbs.innerHTML = "";
    if (!gallery.photos.length) return;

    gallery.photos.forEach((src, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.style.width = "74px";
      b.style.height = "54px";
      b.style.padding = "0";
      b.style.borderRadius = "12px";
      b.style.overflow = "hidden";
      b.style.cursor = "pointer";
      b.style.border = i === gallery.index
        ? "2px solid rgba(214,177,94,.9)"
        : "1px solid rgba(255,255,255,.12)";
      b.style.background = "rgba(0,0,0,.25)";

      const im = document.createElement("img");
      im.src = src;
      im.alt = "photo";
      im.loading = "lazy";
      im.style.width = "100%";
      im.style.height = "100%";
      im.style.objectFit = "cover";
      im.style.display = "block";

      b.appendChild(im);
      b.addEventListener("click", () => showPhoto(i));
      thumbs.appendChild(b);
    });
  }

  function updateCount() {
    const cnt = $("#mCount", modal);
    if (!cnt) return;
    if (!gallery.photos.length) {
      cnt.textContent = "";
      cnt.style.display = "none";
      return;
    }
    cnt.style.display = "inline-flex";
    cnt.textContent = `${gallery.index + 1}/${gallery.photos.length}`;
  }

  function showPhoto(nextIndex) {
    if (!modal) return;
    if (!gallery.photos.length) return;

    const total = gallery.photos.length;
    let i = nextIndex;

    if (i < 0) i = total - 1;
    if (i >= total) i = 0;

    gallery.index = i;

    const src = gallery.photos[i];
    if (mImg) {
      mImg.src = src;
      mImg.alt = `${safeText(currentCar?.brand, "")} ${safeText(currentCar?.model, "")}`;
    }

    renderThumbs();
    updateCount();
  }

  function openModal(car) {
    if (!modal) return;

    currentCar = car;

    ensureGalleryUI();

    gallery.photos = getPhotos(car);
    gallery.index = 0;

    // fallback placeholder if no photos
    const fallback =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Crect width='100%25' height='100%25' fill='%230b0f14'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffd84a' font-family='Arial' font-size='48'%3EAuto%20GBP%3C/text%3E%3C/svg%3E";

    if (mImg) {
      mImg.src = gallery.photos[0] || fallback;
      mImg.alt = `${safeText(car.brand, "")} ${safeText(car.model, "")}`;
    }

    if (mTitle) mTitle.textContent = `${safeText(car.brand, "")} ${safeText(car.model, "")}`;
    if (mPrice) mPrice.textContent = fmtMoney(car.price || 0);
    if (mYear) mYear.textContent = safeText(car.year);
    if (mMileage) mMileage.textContent = car.mileage ? fmtMileage(car.mileage) : "—";
    if (mFuel) mFuel.textContent = safeText(car.fuel);
    if (mDrive) mDrive.textContent = safeText(car.drive);
    if (mStatus) mStatus.textContent = safeText(car.status);
    if (mDesc) mDesc.textContent = safeText(car.desc, "");

    if (mWrite) {
      mWrite.href = writeLink(
        `Хочу по авто: ${car.brand} ${car.model} ${car.year || ""}. Ціна: ${fmtMoney(car.price)}. Підкажіть деталі.`
      );
    }

    if (mCopy) {
      mCopy.onclick = async () => {
        const txt =
`Auto GBP — Авто
${car.brand} ${car.model}
Рік: ${car.year || "—"}
Ціна: ${fmtMoney(car.price)}
Пробіг: ${car.mileage ? fmtMileage(car.mileage) : "—"}
Паливо: ${car.fuel || "—"}
Привід: ${car.drive || "—"}
Статус: ${car.status || "—"}`;
        try {
          await navigator.clipboard.writeText(txt);
          const old = mCopy.textContent;
          mCopy.textContent = "✅ Скопійовано";
          setTimeout(() => (mCopy.textContent = old || "📋 Скопіювати дані"), 1200);
        } catch (e) {
          alert("Не вдалося скопіювати. Спробуй вручну.");
        }
      };
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    renderThumbs();
    updateCount();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
    if (!modal || !modal.classList.contains("open")) return;
    if (e.key === "ArrowLeft") showPhoto(gallery.index - 1);
    if (e.key === "ArrowRight") showPhoto(gallery.index + 1);
  });

  // ---------- events ----------
  if (applyBtn) applyBtn.addEventListener("click", applyFilters);

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (q) q.value = "";
      if (brandSel) brandSel.value = "";
      if (yearMin) yearMin.value = "";
      if (priceMax) priceMax.value = "";
      applyFilters();
    });
  }

  [q, yearMin, priceMax].forEach((el) => {
    if (!el) return;
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });
  });

  if (brandSel) brandSel.addEventListener("change", applyFilters);

  // ---------- init ----------
  render(cars);
})();
