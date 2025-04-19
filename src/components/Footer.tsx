// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-12 text-center text-xs text-gray-500">
      <p className="leading-tight">
        © 2025 Tu Casaca Deportiva UY · Made with 💻 by{" "}
        <a
          href="https://www.devrodri.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-black transition"
        >
          Rodrigo Opalo
        </a>
      </p>
    </footer>
  );
}