// src/utils/getCityAndStateFromZip.ts

export const getCityAndStateFromZip = async (zipCode: string) => {
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      if (!response.ok) {
        throw new Error("ZIP no encontrado");
      }
  
      const data = await response.json();
      const place = data.places[0];
  
      const city = place["place name"];
      const state = place["state"];
  
      return { city, state };
    } catch (error) {
      console.error("Error al obtener ciudad y estado desde ZIP:", error);
      return { city: "", state: "" };
    }
  };