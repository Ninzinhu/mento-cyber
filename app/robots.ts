import type { MetadataRoute } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://mentocyber.com").replace(
  /\/$/,
  "",
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/perfil/configuracoes", "/perfil/convites"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
