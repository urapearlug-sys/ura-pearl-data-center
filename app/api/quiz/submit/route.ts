/**
 * POST: Submit Quiz answers. Body: { initData, answers: number[] }.
 * One attempt per user per day (UTC); users can take the quiz again each new day.
 */

import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { validateTelegramWebAppData } from '@/utils/server-checks';
import { MITROLABS_QUIZ_REWARD_POINTS } from '@/utils/consts';

export const dynamic = 'force-dynamic';

/** Legacy DB may have 10 instead of 10k; use 10k PEARLS per question when stored value is under 1000. */
function effectivePointsPerQuestion(storedPoints: number | null | undefined): number {
  const p = storedPoints ?? 0;
  return p >= 1000 ? p : MITROLABS_QUIZ_REWARD_POINTS;
}

function getStartOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { initData, answers } = body;

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
    }

    const { validatedData, user: telegramUser } = validateTelegramWebAppData(initData);
    if (!validatedData) {
      return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 });
    }

    const telegramId = telegramUser?.id?.toString();
    if (!telegramId) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { telegramId },
      select: { id: true },
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const startOfTodayUTC = getStartOfDayUTC(now);
    const startOfTomorrowUTC = new Date(startOfTodayUTC);
    startOfTomorrowUTC.setUTCDate(startOfTomorrowUTC.getUTCDate() + 1);
    const existingAttempt = await prisma.userQuizAttempt.findFirst({
      where: {
        userId: dbUser.id,
        completedAt: { gte: startOfTodayUTC, lt: startOfTomorrowUTC },
      },
    });
    if (existingAttempt) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        correctCount: existingAttempt.correctCount,
        totalCount: existingAttempt.totalCount,
        pointsAwarded: existingAttempt.pointsAwarded,
      });
    }

    const questions = await prisma.quizQuestion.findMany({
      where: { isActive: true },
      orderBy: [{ branch: { order: 'asc' } }, { order: 'asc' }],
      select: { id: true, correctIndex: true, points: true },
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No quiz questions available' }, { status: 400 });
    }

    const answerArray = Array.isArray(answers) ? answers : [];
    let correctCount = 0;
    let pointsFromQuestions = 0;
    questions.forEach((q, i) => {
      const correct = typeof answerArray[i] === 'number' && answerArray[i] === q.correctIndex;
      if (correct) {
        correctCount += 1;
        pointsFromQuestions += effectivePointsPerQuestion(q.points);
      }
    });

    const totalCount = questions.length;
    const allCorrect = correctCount === totalCount;
    const settings = await prisma.quizSettings.findFirst();
    const completionBonus = allCorrect ? (settings?.completionBonusPoints ?? 0) : 0;
    const pointsToAward = pointsFromQuestions + completionBonus;

    await prisma.$transaction([
      prisma.userQuizAttempt.create({
        data: {
          userId: dbUser.id,
          correctCount,
          totalCount,
          pointsAwarded: pointsToAward,
        },
      }),
      prisma.user.update({
        where: { id: dbUser.id },
        data: {
          points: { increment: pointsToAward },
          pointsBalance: { increment: pointsToAward },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      correctCount,
      totalCount,
      pointsAwarded: pointsToAward,
      pointsFromQuestions,
      completionBonus: allCorrect ? completionBonus : 0,
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}
