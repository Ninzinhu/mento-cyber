import { ContentDetail } from "../../components/content/content-detail";

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentDetail discussionOnly slug={slug} />;
}
