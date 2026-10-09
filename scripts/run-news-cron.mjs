const baseEndpoint = process.env.NEWS_CRON_URL ?? "http://localhost:3000/api/cron/news";
const endpoint =
  process.env.NEWS_CRON_REFRESH_IMAGES === "true"
    ? `${baseEndpoint}${baseEndpoint.includes("?") ? "&" : "?"}refreshImages=1`
    : baseEndpoint;
const secret = process.env.CRON_SECRET;

const headers = secret ? { Authorization: `Bearer ${secret}` } : {};

try {
  const response = await fetch(endpoint, { headers });
  const body = await response.text();

  if (!response.ok) {
    console.error(`Falha ao sincronizar o Radar (${response.status}).`);
    console.error(body);
    process.exitCode = 1;
  } else {
    console.log("Radar sincronizado com sucesso.");
    console.log(body);
  }
} catch (error) {
  console.error(`Não foi possível alcançar ${endpoint}.`);
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
