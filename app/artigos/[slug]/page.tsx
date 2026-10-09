import { ContentDetail } from "../../components/content/content-detail";
import type { Metadata } from "next";
import { contentMetadata } from "../../lib/content-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return contentMetadata(slug, "article");
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentDetail slug={slug} />;
}
