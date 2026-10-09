const base = process.env.APP_URL || "http://localhost:3000";

const checks = ["/operacoes", "/sitemap.xml", "/robots.txt", "/api/content/posts"];
let failed = false;
for (const path of checks) {
  try {
    const response = await fetch(`${base}${path}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    console.log(`ok ${path}`);
  } catch (error) {
    failed = true;
    console.error(`falhou ${path}:`, error instanceof Error ? error.message : error);
  }
}
process.exitCode = failed ? 1 : 0;
