import { ContentDetail } from "../../components/content/content-detail";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentDetail newsOnly slug={slug} />;
}
