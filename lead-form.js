document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lead-form");
  const status = document.getElementById("form-status");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const payload = {
      name: fd.get("name")?.trim(),
      phone: fd.get("phone")?.trim(),
      car: fd.get("car")?.trim(),
      comment: fd.get("comment")?.trim(),
      page: window.location.pathname,
    };

    if (status) {
      status.style.color = "#ccc";
      status.textContent = "Надсилаємо заявку...";
    }

    try {
      const res = await fetch("/.netlify/functions/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (status) {
          status.style.color = "#65d96b";
          status.textContent = "Заявку надіслано ✅ Ми звʼяжемося з вами.";
        }
        form.reset();
      } else {
        const txt = await res.text();
        if (status) {
          status.style.color = "#ff7070";
          status.textContent = "Помилка при надсиланні. Спробуйте ще раз.";
        }
        console.log("Server error:", txt);
      }
    } catch (err) {
      if (status) {
        status.style.color = "#ff7070";
        status.textContent = "Помилка мережі. Перевірте інтернет.";
      }
      console.log(err);
    }
  });
});
