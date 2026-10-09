type Translation = { title: string; excerpt: string };

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export function targetLanguage(value: unknown) {
  const language = typeof value === "string" ? value.toLowerCase().trim() : "";
  if (!/^[a-z]{2,3}$/.test(language)) throw new Error("Idioma de tradução inválido.");
  return language;
}

export async function translateNewsMetadata(
  input: Translation,
  language: string,
): Promise<Translation> {
  const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (googleApiKey) {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(googleApiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: [input.title, input.excerpt],
          target: language,
          format: "text",
        }),
        signal: AbortSignal.timeout(12_000),
      },
    );
    const payload = (await response.json().catch(() => ({}))) as {
      data?: { translations?: Array<{ translatedText?: string }> };
    };
    const translations = payload.data?.translations;
    if (
      !response.ok ||
      !translations?.[0]?.translatedText ||
      !translations[1]?.translatedText
    )
      throw new Error("O provedor de tradução não respondeu corretamente.");
    return {
      title: decodeHtml(translations[0].translatedText),
      excerpt: decodeHtml(translations[1].translatedText),
    };
  }

  const libreUrl = process.env.LIBRETRANSLATE_URL;
  if (libreUrl) {
    const response = await fetch(
      new URL("translate", `${libreUrl.replace(/\/$/, "")}/`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.LIBRETRANSLATE_API_KEY
            ? { Authorization: `Bearer ${process.env.LIBRETRANSLATE_API_KEY}` }
            : {}),
        },
        body: JSON.stringify({
          q: [input.title, input.excerpt],
          source: "auto",
          target: language,
          format: "text",
          ...(process.env.LIBRETRANSLATE_API_KEY
            ? { api_key: process.env.LIBRETRANSLATE_API_KEY }
            : {}),
        }),
        signal: AbortSignal.timeout(12_000),
      },
    );
    const payload = (await response.json().catch(() => ({}))) as {
      translatedText?: string | string[];
    };
    const translations = Array.isArray(payload.translatedText)
      ? payload.translatedText
      : [payload.translatedText];
    if (!response.ok || !translations[0] || !translations[1])
      throw new Error("O provedor de tradução não respondeu corretamente.");
    return { title: translations[0], excerpt: translations[1] };
  }

  throw new Error(
    "A tradução ainda não está configurada. Defina GOOGLE_TRANSLATE_API_KEY ou LIBRETRANSLATE_URL no servidor.",
  );
}
