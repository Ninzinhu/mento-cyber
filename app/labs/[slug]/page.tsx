import { notFound } from "next/navigation";
import { LabWorkspace } from "../../components/labs/lab-workspace";
import { getLab } from "../../features/labs/catalog";

export default async function LabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = getLab(slug);
  if (!lab) notFound();
  return <LabWorkspace lab={lab} />;
}
