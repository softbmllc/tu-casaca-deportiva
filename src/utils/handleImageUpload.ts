// src/utils/handleImageUpload.ts

export const uploadImageToImageKit = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("folder", "/"); // raíz del espacio muttergames
  formData.append("useUniqueFileName", "true");

  try {
    // 1. Obtener firma desde el backend
    const signatureRes = await fetch("/api/imagekit-signature");
    const signatureData = await signatureRes.json();

    if (!signatureRes.ok) {
      console.error("Error obteniendo firma:", signatureData);
      return null;
    }

    const { signature, expire, token, publicKey } = signatureData;

    // 2. Adjuntar datos de autenticación
    formData.append("signature", signature);
    formData.append("expire", expire.toString());
    formData.append("token", token);
    formData.append("publicKey", publicKey);

    // 3. Enviar a ImageKit
    const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: formData,
    });

    const data = await uploadRes.json();

    if (uploadRes.ok) {
      return data.url;
    } else {
      console.error("Error al subir imagen a ImageKit:", data);
      return null;
    }
  } catch (error) {
    console.error("Error de red al subir imagen:", error);
    return null;
  }
};

export const handleImageUpload = uploadImageToImageKit;