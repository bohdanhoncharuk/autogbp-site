// cars.js
(function(){
  const grid = document.getElementById("grid");
  const counter = document.getElementById("counter");
  const statTotal = document.getElementById("statTotal");

  const q = document.getElementById("q");
  const brandSel = document.getElementById("brand");
  const yearMin = document.getElementById("yearMin");
  const priceMax = document.getElementById("priceMax");

  const applyBtn = document.getElementById("apply");
  const resetBtn = document.getElementById("reset");

  // Куди веде "Написати". Варіант 1: Telegram username (без @)
  const TELEGRAM_USERNAME = "AutoGBPBot"; // зміни якщо треба
  // Варіант 2: WhatsApp номер (у міжнародному форматі без + і пробілів)
  const WHATSAPP_NUMBER = "380508232374"; // зміни якщо треба

  // Вибери що відкривати:
  const PREFER = "telegram"; // "telegram" або "whatsapp"

  const writeLink = (text) => {
    if (PREFER === "whatsapp"){
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      return url;
    }
    // telegram
    const url = `https://t.me/${TELEGRAM_USERNAME}?start=${encodeURIComponent("cars")}`;
    // Якщо хочеш прямо з текстом (не завжди працює у всіх клієнтах Telegram):
    // const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;
    return url;
  };

  const topWrite = document.getElementById("writeTop");
  if (topWrite) topWrite.href = writeLink("Привіт! Хочу підібрати авто. Мій бюджет: ...");

  const cars = (window.CARS || []).slice();

  // Fill brand dropdown
  const brands = Array.from(new Set(cars.map(c => c.brand))).sort((a,b)=>a.localeCompare(b));
  for (const b of brands){
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    brandSel.appendChild(opt);
  }

  const fmtMoney = (n) => `$${Number(n).toLocaleString("en-US")}`;
  const fmtMileage = (n) => `${Number(n).toLocaleString("uk-UA")} км`;

  function cardHTML(c){
    const img = c.img && c.img.trim() ? `<img src="${c.img}" alt="${c.brand} ${c.model}">` : "";
    const badge = c.badge ? `<span class="badge gold">${escapeHtml(c.badge)}</span>` : "";
    const status = c.status ? `<span class="badge">${escapeHtml(c.status)}</span>` : "";

    return `
      <div class="card" data-id="${c.id}">
        <div class="thumb">
          ${img}
          <div class="badges">
            ${badge}
            ${status}
          </div>
        </div>

        <div class="body">
          <div class="title">
            <h4>${escapeHtml(c.brand)} ${escapeHtml(c.model)}</h4>
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
            <button class="small primary" data-open="${c.id}">🔍 Деталі</button>
            <a class="small" target="_blank" rel="noopener" href="${writeLink(`Хочу по авто: ${c.brand} ${c.model} ${c.year}. Ціна: ${fmtMoney(c.price)}. Підкажіть деталі.`)}">✉️ Написати</a>
          </div>
        </div>
      </div>
    `;
  }

  function render(list){
    grid.innerHTML = list.map(cardHTML).join("");
    const shown = list.length;
    const total = cars.length;
    counter.textContent = `Показано: ${shown} з ${total}`;
    statTotal.textContent = total;

    // bind modal buttons
    grid.querySelectorAll("[data-open]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.getAttribute("data-open");
        const car = cars.find(x=>x.id===id);
        if (car) openModal(car);
      });
    });
  }

  function applyFilters(){
    const qq = (q.value || "").trim().toLowerCase();
    const bb = brandSel.value || "";
    const yMin = Number(yearMin.value || 0);
    const pMax = Number(priceMax.value || 0);

    let list = cars.slice();

    if (qq){
      list = list.filter(c =>
        `${c.brand} ${c.model}`.toLowerCase().includes(qq)
      );
    }
    if (bb){
      list = list.filter(c => c.brand === bb);
    }
    if (yMin){
      list = list.filter(c => Number(c.year || 0) >= yMin);
    }
    if (pMax){
      list = list.filter(c => Number(c.price || 0) <= pMax);
    }

    render(list);
  }

  // Modal
  const modal = document.getElementById("modal");
  const close = document.getElementById("close");
  const mImg = document.getElementById("mImg");
  const mTitle = document.getElementById("mTitle");
  const mPrice = document.getElementById("mPrice");
  const mYear = document.getElementById("mYear");
  const mMileage = document.getElementById("mMileage");
  const mFuel = document.getElementById("mFuel");
  const mDrive = document.getElementById("mDrive");
  const mStatus = document.getElementById("mStatus");
  const mDesc = document.getElementById("mDesc");
  const mWrite = document.getElementById("mWrite");
  const mCopy = document.getElementById("mCopy");

  function openModal(c){
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");

    const imgSrc = c.img && c.img.trim() ? c.img : "";
    mImg.src = imgSrc || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Crect width='100%25' height='100%25' fill='%230b0f14'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffd84a' font-family='Arial' font-size='48'%3EAuto%20GBP%3C/text%3E%3C/svg%3E";
    mImg.alt = `${c.brand} ${c.model}`;

    mTitle.textContent = `${c.brand} ${c.model}`;
    mPrice.textContent = fmtMoney(c.price || 0);
    mYear.textContent = c.year || "—";
    mMileage.textContent = c.mileage ? fmtMileage(c.mileage) : "—";
    mFuel.textContent = c.fuel || "—";
    mDrive.textContent = c.drive || "—";
    mStatus.textContent = c.status || "—";
    mDesc.textContent = c.desc || "";

    mWrite.href = writeLink(`Хочу по авто: ${c.brand} ${c.model} ${c.year}. Ціна: ${fmtMoney(c.price)}. Підкажіть деталі.`);
    mCopy.onclick = async () => {
      const txt =
`Auto GBP — Авто
${c.brand} ${c.model}
Рік: ${c.year}
Ціна: ${fmtMoney(c.price)}
Пробіг: ${c.mileage ? fmtMileage(c.mileage) : "—"}
Паливо: ${c.fuel || "—"}
Привід: ${c.drive || "—"}
Статус: ${c.status || "—"}`;
      try{
        await navigator.clipboard.writeText(txt);
        mCopy.textContent = "✅ Скопійовано";
        setTimeout(()=> mCopy.textContent = "📋 Скопіювати дані", 1200);
      }catch(e){
        alert("Не вдалося скопіювати. Спробуй вручну.");
      }
    };
  }

  function closeModal(){
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  }

  close.addEventListener("click", closeModal);
  modal.addEventListener("click", (e)=>{
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e)=>{
    if (e.key === "Escape") closeModal();
  });

  // Helpers
  function escapeHtml(str){
    return String(str ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  // Events
  applyBtn.addEventListener("click", applyFilters);
  resetBtn.addEventListener("click", ()=>{
    q.value = "";
    brandSel.value = "";
    yearMin.value = "";
    priceMax.value = "";
    applyFilters();
  });

  // Apply on enter
  [q, yearMin, priceMax].forEach(el=>{
    el.addEventListener("keydown", (e)=>{ if(e.key==="Enter") applyFilters(); });
  });
  brandSel.addEventListener("change", applyFilters);

  // init
  render(cars);
})();
