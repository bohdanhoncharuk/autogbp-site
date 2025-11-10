// netlify/functions/telegram.js
exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors };

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const defaultChat = process.env.TELEGRAM_DEFAULT_CHAT_ID;
    if (!token) return { statusCode: 500, headers: cors, body: 'Missing TELEGRAM_BOT_TOKEN' };

    const { chat_id, text } = JSON.parse(event.body || '{}');
    const cid = chat_id || defaultChat;
    if (!cid || !text) return { statusCode: 400, headers: cors, body: 'chat_id/default and text required' };

    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: cid, text }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      return { statusCode: 502, headers: cors, body: JSON.stringify(data) };
    }
    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, headers: cors, body: e.message };
  }
};
