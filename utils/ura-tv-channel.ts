/**
 * Fetch recent videos from the official URA TV YouTube channel
 * (@uratvofficial → UC8Grt_f2CUo6EyGzYxGdtrg) via the public Atom feed.
 */

import { youtubeEmbedUrlFromInput } from '@/utils/youtube-embed';

export const URA_TV_CHANNEL_ID = 'UC8Grt_f2CUo6EyGzYxGdtrg';
export const URA_TV_CHANNEL_HANDLE = '@uratvofficial';
export const URA_TV_CHANNEL_URL = `https://www.youtube.com/${URA_TV_CHANNEL_HANDLE}/videos`;
export const URA_TV_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${URA_TV_CHANNEL_ID}`;

export type UraTvChannelVideo = {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  source: 'channel';
  sortOrder: number;
  createdAt: string;
};

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function tagText(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = block.match(re);
  if (!m?.[1]) return null;
  return decodeXml(m[1].trim());
}

function attr(block: string, tag: string, name: string): string | null {
  const re = new RegExp(`<${tag}[^>]*\\s${name}="([^"]*)"`, 'i');
  const m = block.match(re);
  return m?.[1] ? decodeXml(m[1]) : null;
}

/** Parse YouTube Atom feed entries into library-ready video rows. */
export function parseUraTvChannelFeed(xml: string): UraTvChannelVideo[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];
  const out: UraTvChannelVideo[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    const videoId =
      tagText(entry, 'yt:videoId') ??
      tagText(entry, 'id')?.replace(/^yt:video:/, '') ??
      null;
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) continue;

    const title = tagText(entry, 'title') || `URA TV · ${videoId}`;
    const description = tagText(entry, 'media:description') || null;
    const published = tagText(entry, 'published');
    const thumb =
      attr(entry, 'media:thumbnail', 'url') ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const embedUrl = youtubeEmbedUrlFromInput(youtubeUrl);

    out.push({
      id: `yt:${videoId}`,
      title,
      description: description ? description.slice(0, 480) : null,
      youtubeUrl,
      embedUrl,
      thumbnailUrl: thumb,
      scheduledAt: published,
      publishedAt: published,
      source: 'channel',
      sortOrder: i,
      createdAt: published ?? new Date().toISOString(),
    });
  }

  return out;
}

export async function fetchUraTvChannelVideos(opts?: {
  signal?: AbortSignal;
}): Promise<UraTvChannelVideo[]> {
  const res = await fetch(URA_TV_FEED_URL, {
    signal: opts?.signal,
    headers: {
      Accept: 'application/atom+xml, application/xml, text/xml, */*',
      'User-Agent': 'URAPearls-URA-TV/1.0',
    },
    // Cache briefly on the edge/runtime when supported
    next: { revalidate: 900 },
  } as RequestInit);

  if (!res.ok) {
    throw new Error(`URA TV feed failed (${res.status})`);
  }

  const xml = await res.text();
  return parseUraTvChannelFeed(xml);
}

export function isUraTvChannelVideoId(id: string): boolean {
  return id.startsWith('yt:');
}
