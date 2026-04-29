// app/api/rankings/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Region code to country name mapping
const REGION_NAMES: Record<string, string> = {
  en: 'English',
  ru: 'Russia',
  uk: 'Ukraine',
  uz: 'Uzbekistan',
  tr: 'Turkey',
  de: 'Germany',
  fr: 'France',
  es: 'Spain',
  it: 'Italy',
  pt: 'Portugal',
  ar: 'Arabic',
  zh: 'China',
  ja: 'Japan',
  ko: 'Korea',
  id: 'Indonesia',
  hi: 'India',
  bn: 'Bangladesh',
  vi: 'Vietnam',
  th: 'Thailand',
  ms: 'Malaysia',
  pl: 'Poland',
  nl: 'Netherlands',
  fa: 'Iran',
  he: 'Israel',
  cs: 'Czech Republic',
  ro: 'Romania',
  hu: 'Hungary',
  el: 'Greece',
  sv: 'Sweden',
  da: 'Denmark',
  fi: 'Finland',
  no: 'Norway',
  be: 'Belarus',
  kk: 'Kazakhstan',
  az: 'Azerbaijan',
  ka: 'Georgia',
  hy: 'Armenia',
  sr: 'Serbia',
  hr: 'Croatia',
  bg: 'Bulgaria',
  sk: 'Slovakia',
  sl: 'Slovenia',
  lt: 'Lithuania',
  lv: 'Latvia',
  et: 'Estonia',
  tg: 'Tajikistan',
  ky: 'Kyrgyzstan',
  tk: 'Turkmenistan',
  mn: 'Mongolia',
  my: 'Myanmar',
  ne: 'Nepal',
  si: 'Sri Lanka',
  km: 'Cambodia',
  lo: 'Laos',
  fil: 'Philippines',
  am: 'Ethiopia',
  sw: 'Swahili',
  af: 'South Africa',
  zu: 'Zulu',
};

// Region groups (continents/areas) → list of region codes (countries) for "countries under region" view
const REGION_GROUPS: Record<string, string[]> = {
  Europe: ['de', 'fr', 'es', 'it', 'pt', 'pl', 'nl', 'uk', 'cs', 'ro', 'hu', 'el', 'sv', 'da', 'fi', 'no', 'be', 'sr', 'hr', 'bg', 'sk', 'sl', 'lt', 'lv', 'et', 'az', 'ka', 'hy'],
  Asia: ['ru', 'uz', 'zh', 'ja', 'ko', 'id', 'hi', 'bn', 'vi', 'th', 'ms', 'fa', 'he', 'kk', 'tg', 'ky', 'tk', 'mn', 'my', 'ne', 'si', 'km', 'lo', 'fil'],
  Africa: ['am', 'sw', 'af', 'zu'],
  'Middle East': ['ar', 'tr'],
  Other: ['en'],
};

function getRegionName(code: string | null): string {
  if (!code) return 'Unknown';
  const key = code.toLowerCase();
  if (key === 'unknown') return 'Unknown';
  return REGION_NAMES[key] || code.toUpperCase();
}

function getSearchParams(req: Request): URLSearchParams {
  try {
    const url = req.url;
    if (url.startsWith('http')) {
      return new URL(url).searchParams;
    }
    const idx = url.indexOf('?');
    return new URLSearchParams(idx >= 0 ? url.slice(idx) : '');
  } catch {
    return new URLSearchParams();
  }
}

export async function GET(req: Request) {
  try {
    const searchParams = getSearchParams(req);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const search = searchParams.get('search') || '';
    const regionFilter = searchParams.get('region') || '';
    const regionGroup = searchParams.get('regionGroup') || '';

    const skip = (page - 1) * limit;

    // Build where clause. Do NOT filter by isHidden so all users show (production MongoDB
    // may have users without the isHidden field, and { not: true } can exclude them).
    const whereClause: Record<string, unknown> = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { telegramId: { contains: search } },
      ];
    }

    if (regionGroup && REGION_GROUPS[regionGroup]) {
      whereClause.region = { in: REGION_GROUPS[regionGroup] };
    } else if (regionFilter) {
      whereClause.region = regionFilter;
    }

    // Get total count
    const totalUsers = await prisma.user.count({
      where: whereClause,
    });

    // Get users with their activity stats
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        telegramId: true,
        name: true,
        points: true,
        pointsBalance: true,
        region: true,
        isPremium: true,
        isFrozen: true,
        createdAt: true,
        referralPointsEarned: true,
        mineLevelIndex: true,
        multitapLevelIndex: true,
        energyLimitLevelIndex: true,
        totalDonatedPoints: true,
        _count: {
          select: {
            completedTasks: {
              where: { isCompleted: true },
            },
            referrals: true,
            dailyCipherAttempts: {
              where: { claimedAt: { not: null } },
            },
            dailyComboAttempts: {
              where: { claimedAt: { not: null } },
            },
            ownedCards: true,
            stakes: true,
          },
        },
      },
      orderBy: {
        points: 'desc',
      },
      skip,
      take: limit,
    });

    // Calculate ranks
    const rankedUsers = users.map((user, index) => ({
      rank: skip + index + 1,
      id: user.id,
      telegramId: user.telegramId,
      name: user.name || 'Anonymous',
      points: Math.floor(user.points),
      pointsBalance: Math.floor(user.pointsBalance),
      region: user.region,
      regionName: getRegionName(user.region),
      isPremium: user.isPremium,
      isFrozen: user.isFrozen,
      createdAt: user.createdAt,
      referralPointsEarned: Math.floor(user.referralPointsEarned),
      totalDonatedPoints: Math.floor(user.totalDonatedPoints ?? 0),
      mineLevelIndex: user.mineLevelIndex,
      multitapLevelIndex: user.multitapLevelIndex,
      energyLimitLevelIndex: user.energyLimitLevelIndex,
      activitiesCompleted: {
        tasks: user._count.completedTasks,
        referrals: user._count.referrals,
        dailyCiphers: user._count.dailyCipherAttempts,
        dailyCombos: user._count.dailyComboAttempts,
        cardsCollected: user._count.ownedCards,
        stakesCreated: user._count.stakes,
      },
    }));

    // Get unique regions for filtering (all users, no isHidden filter)
    const regions = await prisma.user.groupBy({
      by: ['region'],
      _count: { region: true },
      orderBy: { _count: { region: 'desc' } },
    });

    const regionStats = regions.map(r => ({
      code: r.region || 'unknown',
      name: getRegionName(r.region),
      count: r._count.region,
    }));

    const regionGroupsList = Object.keys(REGION_GROUPS).map((name) => ({ id: name, name }));

    const response = NextResponse.json({
      users: rankedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
      regions: regionStats,
      regionGroups: regionGroupsList,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return response;
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
  }
}
