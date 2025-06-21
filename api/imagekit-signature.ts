// /api/imagekit-signature.ts
import { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing private key' }));
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(timestamp)
    .digest('hex');

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ signature, timestamp }));
}