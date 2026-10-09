import { ContentDetail } from "../../components/content/content-detail";
import type { Metadata } from "next";
import { contentMetadata } from "../../lib/content-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return contentMetadata(slug, "radar");
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentDetail newsOnly slug={slug} />;
}
