import type { Metadata } from "next";
import { PublicProfile } from "../../components/community/public-profile";

export async function generateMetadata({
  params,
}: PageProps<"/perfil/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const name = `@${handle}`;
  return {
    title: `${name} — MentoCyber`,
    description: `Perfil público de ${name} na comunidade de prática MentoCyber.`,
    openGraph: {
      title: `${name} — MentoCyber`,
      description: `Perfil público de ${name} na comunidade de prática MentoCyber.`,
    },
  };
}

export default async function PublicProfilePage({
  params,
}: PageProps<"/perfil/[handle]">) {
  const { handle } = await params;
  return <PublicProfile handle={handle} />;
}
