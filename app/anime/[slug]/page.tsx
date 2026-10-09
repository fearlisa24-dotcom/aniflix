export const revalidate = 0;

import { getAnimeById, getAnimeBySlug, getFranchiseSeasons } from '@/lib/anilist';
import { AnimeDetailContent } from './AnimeDetailContent';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { slug: string };
  searchParams: { id?: string };
}

export default async function AnimeDetailPage({ params, searchParams }: PageProps) {
  const isNumeric = /^\d+$/.test(params.slug);
  const id = isNumeric
    ? parseInt(params.slug, 10)
    : (searchParams.id ? parseInt(searchParams.id, 10) : null);

  console.log("[Aniflix] rendering anime detail page for id:", id ?? params.slug);

  let anime;

  if (id) {
    anime = await getAnimeById(id);
  } else {
    anime = await getAnimeBySlug(params.slug);
  }

  if (!anime) {
    notFound();
  }

  const franchiseSeasons = await getFranchiseSeasons(anime.id);

  return (
    <AnimeDetailContent
      key={anime.id}
      anime={anime}
      slug={params.slug}
      seasons={franchiseSeasons}
    />
  );
}

