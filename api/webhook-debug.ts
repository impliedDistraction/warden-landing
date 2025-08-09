import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed: Use POST to inspect webhook payload');
    return;
  }
  try {
    const headers = req.headers as Record<string, string | string[]>;
    let body: string;

    const raw = (req as any).rawBody;
    if (raw) {
      body = raw.toString();

    } else if (req.body) {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    } else {
      body = '';
    }
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      const testPayload = {
        embeds: [{
          title: '🔍 Webhook Debug Hit!',
          description: `Received ${req.method} request`,
          color: 0xff9900,
          fields: [
            {
              name: 'GitHub Event',
              value: (headers['x-github-event'] as string) || 'Unknown',
              inline: true
            },
            {
              name: 'Content Length',
              value: body.length.toString(),
              inline: true
            }
          ],
          timestamp: new Date().toISOString()
        }],
        username: 'Warden DevBot',
        avatar_url: 'https://warden-landing.vercel.app/favicon.svg'
      };
      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
    }
    res.status(200).json({ headers, body });
  } catch {
    res.status(500).send('Error');
  }
}
