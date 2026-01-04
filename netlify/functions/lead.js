// netlify/functions/lead.js
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, phone, car, comment, page } = JSON.parse(event.body || "{}");

    if (!name || !phone) {
      return { statusCode: 400, body: "Name and phone are required" };
    }

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return { statusCode: 500, body: "Server is not configured" };
    }

    const text =
      `Нова заявка з сайту Auto GBP\n\n` +
      `Ім’я: ${name}\n` +
      `Телефон: ${phone}\n` +
      `Авто / бюджет: ${car || "-"}\n` +
      `Коментар: ${comment || "-"}\n` +
      `Сторінка: ${page || "-"}`;

    const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: 502, body: `Telegram error: ${errText}` };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: "Server error" };
  }
};
