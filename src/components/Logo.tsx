// src/components/Logo.tsx
import { Link } from "react-router-dom";
import { SITE_CONFIG } from "@/config/siteConfig";

export default function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2"
      aria-label={SITE_CONFIG.brandName}
    >
      <img
        src={SITE_CONFIG.logoPath}
        alt={SITE_CONFIG.brandName}
        className={className}
      />
      <span className="sr-only">{SITE_CONFIG.brandName}</span>
    </Link>
  );
}