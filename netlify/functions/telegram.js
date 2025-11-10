const https = require('https');

function sendTelegram(token, chat_id, text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ chat_id, text });

    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            if (!data.ok) return reject(new Error(body));
            resolve(data);
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

exports.handler = async (event) => {
  try {
    const { chat_id, text } = JSON.parse(event.body || '{}');

    if (!chat_id || !text) {
      return { statusCode: 400, body: 'chat_id and text are required' };
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return { statusCode: 500, body: 'Missing TELEGRAM_BOT_TOKEN' };
    }

    const data = await sendTelegram(token, chat_id, text);
    return { statusCode: 200, body: JSON.stringify({ ok: true, data }) };
  } catch (e) {
    console.error('telegram function error:', e);
    return { statusCode: 500, body: e.message || 'Internal error' };
  }
};
