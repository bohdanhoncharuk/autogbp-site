document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lead-form');
  const status = document.getElementById('form-status');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const payload = {
      name: (formData.get('name') || '').toString().trim(),
      phone: (formData.get('phone') || '').toString().trim(),
      car: (formData.get('car') || '').toString().trim(),
      comment: (formData.get('comment') || '').toString().trim(),
      page: window.location.href
    };

    if (!payload.name || !payload.phone) {
      if (status) {
        status.style.color = '#ff7070';
        status.textContent = 'Заповніть імʼя та телефон.';
      }
      return;
    }

    if (status) {
      status.style.color = '#ccc';
      status.textContent = 'Надсилаємо заявку...';
    }

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (status) {
          status.style.color = '#65d96b';
          status.textContent = 'Заявку надіслано ✅ Ми звʼяжемося з вами.';
        }
        form.reset();
      } else {
        if (status) {
          status.style.color = '#ff7070';
          status.textContent = 'Помилка при надсиланні. Спробуйте ще раз або зателефонуйте.';
        }
      }
    } catch (err) {
      if (status) {
        status.style.color = '#ff7070';
        status.textContent = 'Помилка мережі. Перевірте інтернет або зателефонуйте.';
      }
    }
  });
});
