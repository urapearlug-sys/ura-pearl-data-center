// app/api/admin/tasks/[id]/route.ts

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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const authError = getAdminAuthError(req);
    if (authError) return NextResponse.json(authError.body, { status: authError.status });

    try {
        const taskData = await req.json();

        // Remove the id from the taskData
        const { id, ...updateData } = taskData;

        const task = await prisma.task.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Update task error:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const authError = getAdminAuthError(req);
    if (authError) return NextResponse.json(authError.body, { status: authError.status });

    try {
        await prisma.task.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete task error:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}