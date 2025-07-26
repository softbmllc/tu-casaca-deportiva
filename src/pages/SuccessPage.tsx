import React from 'react';
import { Link } from 'react-router-dom';

const SuccessPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl md:text-5xl font-bold mb-4 text-green-600">
        ¡Gracias por tu compra!
      </h1>
      <p className="text-lg md:text-xl mb-6 text-gray-700">
        Tu pedido ha sido procesado exitosamente.
      </p>
      <Link
        to="/shop"
        className="px-6 py-2 bg-[#FF2D55] text-white rounded hover:bg-[#e0264c] transition"
      >
        Volver a la tienda
      </Link>
    </div>
  );
};

export default SuccessPage;