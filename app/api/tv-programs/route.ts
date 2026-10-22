import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { youtubeEmbedUrlFromInput } from '@/utils/youtube-embed';
import {
  fetchUraTvChannelVideos,
  type UraTvChannelVideo,
} from '@/utils/ura-tv-channel';
import { filterUraTvPastLibrary, filterUraTvUpcoming } from '@/utils/ura-tv-library';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SerializedProgram = {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  scheduledAt: string | null;
  sortOrder: number;
  createdAt: string;
  source?: 'admin' | 'channel';
};

function serializeProgram(p: {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  scheduledAt: Date | null;
  sortOrder: number;
  createdAt: Date;
}): SerializedProgram {
  const embedUrl = youtubeEmbedUrlFromInput(p.youtubeUrl);
  const videoId = embedUrl?.match(/embed\/([\w-]{11})/)?.[1] ?? null;
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    youtubeUrl: p.youtubeUrl,
    embedUrl,
    thumbnailUrl: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null,
    scheduledAt: p.scheduledAt?.toISOString() ?? null,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt.toISOString(),
    source: 'admin',
  };
}

function channelToSerialized(v: UraTvChannelVideo): SerializedProgram {
  return {
    id: v.id,
    title: v.title,
    description: v.description,
    youtubeUrl: v.youtubeUrl,
    embedUrl: v.embedUrl,
    thumbnailUrl: v.thumbnailUrl,
    scheduledAt: v.scheduledAt,
    sortOrder: v.sortOrder,
    createdAt: v.createdAt,
    source: 'channel',
  };
}

function youtubeKey(url: string): string | null {
  const embed = youtubeEmbedUrlFromInput(url);
  return embed?.match(/embed\/([\w-]{11})/)?.[1] ?? null;
}

export async function GET() {
  try {
    const [rows, channelVideos] = await Promise.all([
      prisma.tvProgram.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: 'asc' }, { scheduledAt: 'desc' }],
      }),
      fetchUraTvChannelVideos().catch((err) => {
        console.warn('[tv-programs] channel feed unavailable', err);
        return [] as UraTvChannelVideo[];
      }),
    ]);

    const now = Date.now();
    const upcoming = rows
      .filter((r) => {
        if (!r.scheduledAt) return false;
        return new Date(r.scheduledAt).getTime() >= now;
      })
      .sort((a, b) => {
        const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        return ta - tb;
      })
      .map(serializeProgram);

    const adminPast = rows
      .filter((r) => !r.scheduledAt || new Date(r.scheduledAt).getTime() < now)
      .map(serializeProgram);

    const seen = new Set<string>();
    for (const p of [...upcoming, ...adminPast]) {
      const key = youtubeKey(p.youtubeUrl);
      if (key) seen.add(key);
    }

    const channelPast = channelVideos
      .map(channelToSerialized)
      .filter((v) => {
        const key = youtubeKey(v.youtubeUrl);
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    const pastSorted = [...channelPast, ...adminPast].sort((a, b) => {
      const ta = new Date(a.scheduledAt ?? a.createdAt).getTime();
      const tb = new Date(b.scheduledAt ?? b.createdAt).getTime();
      return tb - ta;
    });
    const past = filterUraTvPastLibrary(pastSorted);
    const upcomingFiltered = filterUraTvUpcoming(upcoming);

    return NextResponse.json({
      upcoming: upcomingFiltered,
      past,
      channel: {
        handle: '@uratvofficial',
        url: 'https://www.youtube.com/@uratvofficial/videos',
        count: channelPast.length,
      },
    });
  } catch (e) {
    console.error('[tv-programs GET]', e);
    return NextResponse.json({ error: 'Failed to load programs' }, { status: 500 });
  }
}
