import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeReceipts } from '../services/geminiService.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("Body recibido:", req.body);
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { files } = req.body; // files: [{ data: base64, mimeType }]
    const result = await analyzeReceipts(files);
    res.status(200).json(result);
    console.log("Receip correct :)")
  } catch (error: any) {
    console.error(error);
    console.error("ERROR en analyzeReceipts:", error);
    res.status(500).json({ error: error.message });
    console.log("Receip incorrect :(")

  }
}
