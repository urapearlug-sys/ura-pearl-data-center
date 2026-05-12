import type { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAdminAuthError } from '@/utils/admin-session';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = getAdminAuthError(req);
  if (err) return NextResponse.json(err.body, { status: err.status });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const body = await req.json();
    const data: Prisma.UraFcMatchUpdateInput = {};

    if (typeof body.homeTeam === 'string') data.homeTeam = body.homeTeam.trim();
    if (typeof body.awayTeam === 'string') data.awayTeam = body.awayTeam.trim();
    if ('homeLogoUrl' in body) {
      data.homeLogoUrl =
        typeof body.homeLogoUrl === 'string' && body.homeLogoUrl.trim() ? body.homeLogoUrl.trim() : null;
    }
    if ('awayLogoUrl' in body) {
      data.awayLogoUrl =
        typeof body.awayLogoUrl === 'string' && body.awayLogoUrl.trim() ? body.awayLogoUrl.trim() : null;
    }
    if (typeof body.kickoffAt === 'string' && body.kickoffAt.trim()) {
      const d = new Date(body.kickoffAt);
      if (!Number.isNaN(d.getTime())) data.kickoffAt = d;
    }
    if ('venue' in body) {
      data.venue =
        typeof body.venue === 'string' && body.venue.trim() ? body.venue.trim() : null;
    }
    if ('competition' in body) {
      data.competition =
        typeof body.competition === 'string' && body.competition.trim() ? body.competition.trim() : null;
    }
    if (typeof body.status === 'string' && ['upcoming', 'completed', 'cancelled'].includes(body.status)) {
      data.status = body.status;
    }
    if ('homeScore' in body) {
      data.homeScore =
        typeof body.homeScore === 'number' ? Math.floor(body.homeScore) : body.homeScore === null ? null : undefined;
    }
    if ('awayScore' in body) {
      data.awayScore =
        typeof body.awayScore === 'number' ? Math.floor(body.awayScore) : body.awayScore === null ? null : undefined;
    }
    if ('highlightUrl' in body) {
      data.highlightUrl =
        typeof body.highlightUrl === 'string' && body.highlightUrl.trim()
          ? body.highlightUrl.trim()
          : null;
    }
    if (typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)) {
      data.sortOrder = Math.floor(body.sortOrder);
    }
    if (typeof body.isPublished === 'boolean') data.isPublished = body.isPublished;

    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    ) as Prisma.UraFcMatchUpdateInput;

    if (Object.keys(cleaned).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const row = await prisma.uraFcMatch.update({
      where: { id },
      data: cleaned,
    });
    return NextResponse.json(row);
  } catch (e) {
    console.error('[admin/ura-fc/matches PATCH]', e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = getAdminAuthError(req);
  if (err) return NextResponse.json(err.body, { status: err.status });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    await prisma.uraFcMatch.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/ura-fc/matches DELETE]', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
