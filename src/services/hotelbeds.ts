import axios from 'axios';
import crypto from 'crypto';

// generate a signature for the Hotelbeds API, X-Signature：SHA256(apikey + secret + unixTime)
function makeSignature(apiKey: string, secret: string) {
  const ts = Math.floor(Date.now() / 1000);
  const str = apiKey + secret + ts;
  return crypto.createHash('sha256').update(str).digest('hex');
}

// Content hotel API
export async function fetchHotels(from = 1, to = 10, language = 'ENG') {
  const apiKey  = process.env.HOTELBEDS_KEY as string;
  const secret  = process.env.HOTELBEDS_SECRET as string;
  const sig     = makeSignature(apiKey, secret);

  const url =
    `https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels` +
    `?fields=name,category,cityCode&language=${language}&from=${from}&to=${to}`;

  const res = await axios.get(url, {
    headers: {
      'Api-key': apiKey,
      'X-Signature': sig,
      Accept: 'application/json',
    },
    timeout: 10000, // 10s
  });

  return res.data;
}