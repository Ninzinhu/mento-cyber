const baseUrl = process.env.APP_URL || "http://127.0.0.1:3000";

async function expectStatus(path, options, expected) {
  const response = await fetch(`${baseUrl}${path}`, options);
  if (response.status !== expected) {
    throw new Error(`${path}: esperado ${expected}, recebido ${response.status}`);
  }
}

await expectStatus(
  "/api/community",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "operations.dashboard" }),
  },
  401,
);

await expectStatus(
  "/api/community",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "moderation.queue" }),
  },
  401,
);

console.log("Security boundary checks passed.");
