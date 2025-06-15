import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';
import credentials from '../../../credentials.json'; // เปลี่ยน path ตามที่คุณวางไฟล์

const spreadsheetId = '1TzZoUvhskBF8J_FNgoXWYgtyGoAwJ_2ATnsr1GX84Wo';
const sheetName = 'Sheet1'; // เปลี่ยนชื่อ sheet ถ้าไม่ใช่ Sheet1

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sheets = await getSheetsClient();

  if (req.method === 'GET') {
    // อ่านข้อมูล
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`,
    });
    res.status(200).json(result.data.values);
  } else if (req.method === 'POST') {
    // เพิ่มข้อมูล
    const { name, price } = req.body;
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[name, price]],
      },
    });
    res.status(201).json({ message: 'success' });
  } else {
    res.status(405).end();
  }
}
