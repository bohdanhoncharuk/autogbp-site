exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return { statusCode: 500, body: "Missing TELEGRAM_BOT_TOKEN" };

    const { chat_id, text } = JSON.parse(event.body || "{}");
    if (!chat_id || !text) return { statusCode: 400, body: "chat_id and text are required" };

    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, text, parse_mode: "HTML" })
    });
    const data = await resp.json();
    if (!data.ok) return { statusCode: 502, body: JSON.stringify(data) };
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: e.message || "Server error" };
  }
};
