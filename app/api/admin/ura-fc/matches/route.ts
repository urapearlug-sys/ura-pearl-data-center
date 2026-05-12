import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAdminAuthError } from '@/utils/admin-session';

export async function GET(req: NextRequest) {
  const err = getAdminAuthError(req);
  if (err) return NextResponse.json(err.body, { status: err.status });
  try {
    const rows = await prisma.uraFcMatch.findMany({
      orderBy: [{ sortOrder: 'asc' }, { kickoffAt: 'desc' }],
    });
    return NextResponse.json(rows);
  } catch (e) {
    console.error('[admin/ura-fc/matches GET]', e);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const err = getAdminAuthError(req);
  if (err) return NextResponse.json(err.body, { status: err.status });
  try {
    const body = await req.json();
    const homeTeam = typeof body.homeTeam === 'string' ? body.homeTeam.trim() : '';
    const awayTeam = typeof body.awayTeam === 'string' ? body.awayTeam.trim() : '';
    const kickoffRaw = typeof body.kickoffAt === 'string' ? body.kickoffAt.trim() : '';

    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: 'Home and away team names are required' }, { status: 400 });
    }
    if (!kickoffRaw) return NextResponse.json({ error: 'Kick-off date/time is required' }, { status: 400 });

    const kickoffAt = new Date(kickoffRaw);
    if (Number.isNaN(kickoffAt.getTime())) {
      return NextResponse.json({ error: 'Invalid kickoff date' }, { status: 400 });
    }

    const status =
      typeof body.status === 'string' && ['upcoming', 'completed', 'cancelled'].includes(body.status)
        ? body.status
        : 'upcoming';

    const row = await prisma.uraFcMatch.create({
      data: {
        homeTeam,
        awayTeam,
        homeLogoUrl:
          typeof body.homeLogoUrl === 'string' && body.homeLogoUrl.trim() ? body.homeLogoUrl.trim() : null,
        awayLogoUrl:
          typeof body.awayLogoUrl === 'string' && body.awayLogoUrl.trim() ? body.awayLogoUrl.trim() : null,
        kickoffAt,
        venue: typeof body.venue === 'string' && body.venue.trim() ? body.venue.trim() : null,
        competition:
          typeof body.competition === 'string' && body.competition.trim() ? body.competition.trim() : null,
        status,
        homeScore: typeof body.homeScore === 'number' ? Math.floor(body.homeScore) : null,
        awayScore: typeof body.awayScore === 'number' ? Math.floor(body.awayScore) : null,
        highlightUrl:
          typeof body.highlightUrl === 'string' && body.highlightUrl.trim() ? body.highlightUrl.trim() : null,
        sortOrder:
          typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)
            ? Math.floor(body.sortOrder)
            : 0,
        isPublished: body.isPublished !== false,
      },
    });
    return NextResponse.json(row);
  } catch (e) {
    console.error('[admin/ura-fc/matches POST]', e);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
