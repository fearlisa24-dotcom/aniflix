import { searchAnime, getByGenre, getPopularThisSeason, getTopRated, getNewlyAdded } from '@/lib/anilist';
import { SearchContent } from './SearchContent';

interface PageProps {
  searchParams: { q?: string; genre?: string; sort?: string };
}

export default async function SearchPage({ searchParams }: PageProps) {
  let results;

  if (searchParams.q) {
    results = await searchAnime(searchParams.q, 30);
  } else if (searchParams.genre) {
    results = await getByGenre(searchParams.genre, 30);
  } else if (searchParams.sort === 'popular') {
    results = await getPopularThisSeason(30);
  } else if (searchParams.sort === 'new') {
    results = await getNewlyAdded(30);
  } else {
    results = await getTopRated(30);
  }

  const title = searchParams.q
    ? `Search: "${searchParams.q}"`
    : searchParams.genre
    ? `Genre: ${searchParams.genre}`
    : searchParams.sort === 'popular'
    ? 'Popular This Season'
    : searchParams.sort === 'new'
    ? 'Newly Added'
    : 'Browse Anime';

  return <SearchContent results={results} title={title} />;
}
