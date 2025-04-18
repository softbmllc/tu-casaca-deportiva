//src/pages/FailurePage.tsx
export default function FailurePage() {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Pago rechazado</h1>
        <p className="text-gray-700 mb-6">
          Algo salió mal con tu pago. Podés intentar nuevamente o contactarnos por WhatsApp.
        </p>
        <div className="flex gap-4">
          <a
            href="/carrito"
            className="bg-black text-white px-6 py-3 rounded-full hover:bg-black/90 transition"
          >
            Volver al carrito
          </a>
          <a
            href="https://wa.me/59899123456"
            className="text-sm underline text-blue-600 mt-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </section>
    );
  }