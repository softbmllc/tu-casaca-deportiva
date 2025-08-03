// backened/api/getImagekitAuth-express.ts

import dotenv from "dotenv";
dotenv.config();

import { Request, Response } from "express";
import ImageKit from "imagekit";

if (
  !process.env.IMAGEKIT_PUBLIC_KEY ||
  !process.env.IMAGEKIT_PRIVATE_KEY ||
  !process.env.IMAGEKIT_URL_ENDPOINT
) {
  throw new Error("❌ Faltan variables de entorno para ImageKit. Verificá tu archivo .env");
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

const getImagekitAuth = (req: Request, res: Response) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error generating ImageKit auth:", error);
    res.status(500).json({ error: error.message });
  }
};

export default getImagekitAuth;
