import { Suspense } from 'react';
import {
  getTrending,
  getAllTimePopular,
  getPopularThisSeason,
  getSimulcast,
  getShortAndComplete,
  getUnderratedThisSeason,
  getHiddenGems,
  getMovieFavorites,
  getTimelessClassics,
  getComingSoon,
} from '@/lib/anilist';
import { HomeContent } from './HomeContent';
import { Skeleton } from '@/components/ui/skeleton';
import { HomeSplash } from '@/components/unlock/HomeSplash';

function HomeLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="h-[60vh] md:h-[85vh] bg-[#141414] animate-pulse" />
      {/* Row skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="py-4 px-[8vw]">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <Skeleton key={j} className="w-[190px] aspect-[2/3] rounded-card shrink-0" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

async function AsyncHomeData() {
  const [
    trending,
    allTimePopular,
    popularThisSeason,
    simulcast,
    shortAndComplete,
    underrated,
    hiddenGems,
    movies,
    classics,
    comingSoon,
  ] = await Promise.all([
    getTrending(1, 10),
    getAllTimePopular(25),
    getPopularThisSeason(20),
    getSimulcast(20),
    getShortAndComplete(20),
    getUnderratedThisSeason(20),
    getHiddenGems(20),
    getMovieFavorites(20),
    getTimelessClassics(20),
    getComingSoon(10),
  ]);

  return (
    <HomeContent
      trending={trending}
      allTimePopular={allTimePopular}
      popularThisSeason={popularThisSeason}
      simulcast={simulcast}
      shortAndComplete={shortAndComplete}
      underrated={underrated}
      hiddenGems={hiddenGems}
      movies={movies}
      classics={classics}
      comingSoon={comingSoon}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HomeLoading />}>
        <AsyncHomeData />
      </Suspense>
      <HomeSplash />
    </>
  );
}
