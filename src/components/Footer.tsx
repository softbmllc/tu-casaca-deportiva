// src/components/Footer.tsx

type FooterProps = {
  variant?: "light" | "dark";
};

export default function Footer({ variant = "dark" }: FooterProps) {
  const isDark = variant === "dark";

  return (
    <footer
      className={`border-t py-4 mt-12 text-center text-xs leading-tight flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 ${
        isDark
          ? "bg-black border-gray-800 text-gray-400"
          : "bg-white border-gray-200 text-gray-600"
      }`}
    >
      <span>© 2025 Tu Casaca Deportiva UY</span>
      <span>
        Made with 💻 by{" "}
        <a
          href="https://www.devrodri.com"
          target="_blank"
          rel="noopener noreferrer"
          className={`font-medium transition ${
            isDark ? "text-white/80 hover:text-white" : "text-gray-800 hover:text-black"
          }`}
        >
          Rodrigo Opalo
        </a>
      </span>
    </footer>
  );
}