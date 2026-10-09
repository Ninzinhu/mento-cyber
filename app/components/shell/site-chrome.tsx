import Link from "next/link";
import { SiteHeader as InteractiveSiteHeader } from "./site-header";

export function SiteHeader() {
  return <InteractiveSiteHeader />;
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-content">
        <span className="brand">
          MENTO<span>CYBER</span>
        </span>
        <span>Comunidade de prática em defesa digital.</span>
      </div>
    </footer>
  );
}
