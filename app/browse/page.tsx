import { redirect } from 'next/navigation';

export default function BrowsePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') {
      query.set(key, value);
    }
  }
  const queryString = query.toString();
  redirect(queryString ? `/search?${queryString}` : '/search');
}
