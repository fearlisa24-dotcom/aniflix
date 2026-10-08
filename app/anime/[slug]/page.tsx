import { getAnimeBySlug } from '@/lib/anilist';
import { AnimeDetailContent } from './AnimeDetailContent';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { slug: string };
  searchParams: { id?: string };
}

export default async function AnimeDetailPage({ params, searchParams }: PageProps) {
  let anime;

  if (searchParams.id) {
    const { getAnimeById } = await import('@/lib/anilist');
    anime = await getAnimeById(Number(searchParams.id));
  } else {
    anime = await getAnimeBySlug(params.slug);
  }

  if (!anime) {
    notFound();
  }

  return <AnimeDetailContent anime={anime} slug={params.slug} />;
}
