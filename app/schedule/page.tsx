import React from 'react';
import type { Metadata } from 'next';
import { getAiringSchedule } from '@/lib/anilist';
import { ScheduleClient } from '@/components/schedule/ScheduleClient';

export const metadata: Metadata = {
  title: 'Anime Release Schedule — Aniflix',
  description: 'Track upcoming anime episodes and broadcast times for the entire week on Aniflix.',
};

export const revalidate = 600; // revalidate every 10 minutes for fresh schedule

export default async function SchedulePage() {
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - 86400;
  const sevenDaysLater = now + 7 * 86400;

  const schedules = await getAiringSchedule(oneDayAgo, sevenDaysLater, 50);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <ScheduleClient initialSchedules={schedules} />
    </main>
  );
}
