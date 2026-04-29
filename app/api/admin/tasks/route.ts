// app/api/admin/tasks/route.ts

/**
 * This project was developed by Nikandr Surkov.
 * You may not use this code if you purchased it from any source other than the official website https://nikandr.com.
 * If you purchased it from the official website, you may use it for your own projects,
 * but you may not resell it or publish it publicly.
 * 
 * Website: https://nikandr.com
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * Telegram: https://t.me/nikandr_s
 * Telegram channel for news/updates: https://t.me/clicker_game_news
 * GitHub: https://github.com/nikandr-surkov
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAdminAuthError } from '@/utils/admin-session';

export async function GET(req: NextRequest) {
    const authError = getAdminAuthError(req);
    if (authError) return NextResponse.json(authError.body, { status: authError.status });

    const tasks = await prisma.task.findMany();
    return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
    const authError = getAdminAuthError(req);
    if (authError) return NextResponse.json(authError.body, { status: authError.status });

    const taskData = await req.json();
    const task = await prisma.task.create({ data: taskData });
    return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
    const authError = getAdminAuthError(req);
    if (authError) return NextResponse.json(authError.body, { status: authError.status });

    try {
        const body = await req.json().catch(() => ({}));
        const { ids, randomCount } = body as { ids?: string[]; randomCount?: number };

        if (ids && Array.isArray(ids) && ids.length > 0) {
            await prisma.task.deleteMany({
                where: { id: { in: ids } },
            });
            return NextResponse.json({ success: true, deleted: ids.length });
        }

        if (typeof randomCount === 'number' && randomCount > 0) {
            const all = await prisma.task.findMany({ select: { id: true } });
            const toDelete = all
                .map((t) => t.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.min(randomCount, all.length));
            if (toDelete.length > 0) {
                await prisma.task.deleteMany({
                    where: { id: { in: toDelete } },
                });
            }
            return NextResponse.json({ success: true, deleted: toDelete.length });
        }

        return NextResponse.json(
            { error: 'Provide ids (string[]) or randomCount (number)' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Bulk delete tasks error:', error);
        return NextResponse.json({ error: 'Failed to delete tasks' }, { status: 500 });
    }
}