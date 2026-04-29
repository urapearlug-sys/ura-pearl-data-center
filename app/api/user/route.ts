// app/api/user/route.ts

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

import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { MAX_ENERGY_REFILLS_PER_DAY, energyUpgradeBaseBenefit, REFERRAL_BONUS_BASE, REFERRAL_BONUS_PREMIUM, LEVELS, LEAGUE_POINTS } from '@/utils/consts';
import { addActivityPoints } from '@/utils/league-points';
import { validateTelegramWebAppData } from '@/utils/server-checks';
import { calculateEnergyLimit, calculateLevelIndex, calculateMinedPoints, calculateRestoredEnergy } from '@/utils/game-mechanics';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const MAX_RETRIES = 3;
const RETRY_DELAY = 100; // milliseconds

export async function POST(req: Request) {
  console.log("SERVER USER CALL!!!");

  const body = await req.json();
  const { telegramInitData, referrerTelegramId } = body;

  console.log("Request body:", body);
  console.log("Telegram Init Data:", telegramInitData);
  console.log("Referrer Telegram ID:", referrerTelegramId);

  if (!telegramInitData) {
    return NextResponse.json({ error: 'Invalid request', message: 'Missing telegram init data' }, { status: 400 });
  }

  const { validatedData, user: telegramUser, message: validationMessage } = validateTelegramWebAppData(telegramInitData);

  console.log("Validated data", validatedData);
  console.log("User", telegramUser);
  console.log("Validation message", validationMessage);

  if (!validatedData) {
    return NextResponse.json(
      {
        error: 'Invalid Telegram data',
        message: validationMessage || 'Please open the game from the Telegram app.',
      },
      { status: 403 }
    );
  }

  console.log("User: ", telegramUser);

  const telegramId = telegramUser.id?.toString();

  if (!telegramId) {
    return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
  }

  const USER_TRANSACTION_TIMEOUT_MS = 15_000; // avoid timeout for new users (create + referrer update + league checks)

  try {
    const dbUserUpdated = await prisma.$transaction(async (prisma) => {
      let dbUser = await prisma.user.findUnique({
        where: { telegramId },
        include: { referredBy: true },
      });

      const currentTime = new Date();

      if (dbUser) {
        // Existing user logic
        let retries = 0;
        while (retries < MAX_RETRIES) {
          try {
            if (!dbUser) {
              throw new Error('User data unexpectedly null');
            }
            const minedPoints = calculateMinedPoints(
              dbUser.mineLevelIndex,
              dbUser.lastPointsUpdateTimestamp.getTime(),
              currentTime.getTime()
            );

            const newPoints = dbUser.points + minedPoints;
            const newLevelIndex = calculateLevelIndex(newPoints);
            const oldLevelIndex = calculateLevelIndex(dbUser.points);

            const lastEnergy = dbUser.energy;
            const restoredEnergy = calculateRestoredEnergy(dbUser.multitapLevelIndex, dbUser.lastEnergyUpdateTimestamp.getTime(), currentTime.getTime());
            const maxEnergyLimit = calculateEnergyLimit(dbUser.energyLimitLevelIndex);

            const lastRefillDate = new Date(dbUser.lastEnergyRefillsTimestamp);
            const isNewDay = currentTime.getUTCDate() !== lastRefillDate.getUTCDate() ||
              currentTime.getUTCMonth() !== lastRefillDate.getUTCMonth() ||
              currentTime.getUTCFullYear() !== lastRefillDate.getUTCFullYear();

            const isPremium = telegramUser?.is_premium || false;

            // Calculate additional referral points if user leveled up
            let additionalReferralPoints = 0;
            if (newLevelIndex > oldLevelIndex) {
              for (let i = oldLevelIndex + 1; i <= newLevelIndex; i++) {
                additionalReferralPoints += isPremium ? LEVELS[i].friendBonusPremium : LEVELS[i].friendBonus;
              }
            }

            dbUser = await prisma.user.update({
              where: {
                telegramId,
                lastPointsUpdateTimestamp: dbUser.lastPointsUpdateTimestamp, // Optimistic lock
              },
              data: {
                name: telegramUser?.first_name || "",
                isPremium: isPremium,
                points: newPoints,
                pointsBalance: { increment: minedPoints },
                offlinePointsEarned: minedPoints,
                lastPointsUpdateTimestamp: currentTime,
                energy: Math.min(lastEnergy + restoredEnergy, maxEnergyLimit),
                energyRefillsLeft: isNewDay ? MAX_ENERGY_REFILLS_PER_DAY : dbUser.energyRefillsLeft,
                lastEnergyUpdateTimestamp: currentTime,
                lastEnergyRefillsTimestamp: isNewDay ? currentTime : dbUser.lastEnergyRefillsTimestamp,
                region: dbUser.region || telegramUser?.language_code || null,
                // Ensure totalTaps exists for docs created before we added the field (persist across deployments)
                ...(typeof dbUser.totalTaps !== 'number' && { totalTaps: 0 }),
              },
              include: { referredBy: true },
            });

            // Credit referrer when referred user levels up (points, balance, and referral bonus tracking)
            if (additionalReferralPoints > 0 && dbUser.referredBy) {
              await prisma.user.update({
                where: { id: dbUser.referredBy.id },
                data: {
                  points: { increment: additionalReferralPoints },
                  pointsBalance: { increment: additionalReferralPoints },
                  referralPointsEarned: { increment: additionalReferralPoints },
                },
              });
            }

            break; // Exit the retry loop if successful
          } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2034') {
              // Optimistic locking failed, retry
              retries++;
              if (retries >= MAX_RETRIES) {
                throw new Error('Max retries reached for optimistic locking');
              }
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retries))); // Exponential backoff

              // Refresh user data before retrying
              dbUser = await prisma.user.findUnique({
                where: { telegramId },
                include: { referredBy: true },
              });
            } else {
              throw error;
            }
          }
        }
      } else {
        // New user creation — only link referrer if it's a valid different user (invitee gets own account)
        let referredByUser = null;
        const referrerId = typeof referrerTelegramId === 'string' ? referrerTelegramId.trim() : '';
        if (referrerId && /^\d+$/.test(referrerId) && referrerId !== telegramId) {
          referredByUser = await prisma.user.findUnique({
            where: { telegramId: referrerId },
          });
        }

        const isPremium = telegramUser?.is_premium || false;
        // Referred users start with 0 points; only the referrer gets the sign-up bonus
        const referrerSignUpBonus = referredByUser ? (isPremium ? REFERRAL_BONUS_PREMIUM : REFERRAL_BONUS_BASE) : 0;

        dbUser = await prisma.user.create({
          data: {
            telegramId,
            name: telegramUser?.first_name || "",
            isPremium,
            points: 0,
            pointsBalance: 0,
            totalTaps: 0,
            offlinePointsEarned: 0,
            referralPointsEarned: 0,
            multitapLevelIndex: 0,
            energy: energyUpgradeBaseBenefit,
            energyRefillsLeft: MAX_ENERGY_REFILLS_PER_DAY,
            energyLimitLevelIndex: 0,
            mineLevelIndex: 0,
            lastPointsUpdateTimestamp: currentTime,
            lastEnergyUpdateTimestamp: currentTime,
            lastEnergyRefillsTimestamp: currentTime,
            region: telegramUser?.language_code || null,
            referredBy: referredByUser ? { connect: { id: referredByUser.id } } : undefined,
          },
          include: { referredBy: true },
        });

        if (referredByUser) {
          // Reward the referrer (sign-up bonus + record in referral bonus); level-up bonuses applied when referred user levels up
          await prisma.user.update({
            where: { id: referredByUser.id },
            data: {
              points: { increment: referrerSignUpBonus },
              pointsBalance: { increment: referrerSignUpBonus },
              referralPointsEarned: { increment: referrerSignUpBonus },
              referrals: { connect: { id: dbUser.id } },
            },
          });
          // Do not call addActivityPoints inside transaction — it does userLeagueWeek/userTeamWeek upserts and can exceed 5s
        }
      }

      return dbUser;
    }, { timeout: USER_TRANSACTION_TIMEOUT_MS });

    if (!dbUserUpdated) {
      return NextResponse.json({ error: 'User not found' }, { status: 500 });
    }

    // Award referrer league/team points outside the transaction (avoids transaction timeout for new users)
    if (dbUserUpdated.referredBy) {
      addActivityPoints(prisma, dbUserUpdated.referredBy.id, LEAGUE_POINTS.referral).catch((err) =>
        console.error('Referrer activity points (league/team) failed:', err)
      );
    }

    // Always return totalTaps as a number (old DB docs may lack field so persist across deployments)
    const payload = { ...dbUserUpdated, totalTaps: dbUserUpdated.totalTaps ?? 0 };
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        console.log('User already exists:', error);
        return NextResponse.json({ error: 'User already exists', message: 'User already exists' }, { status: 409 });
      }
    }
    console.error('Error fetching/creating user:', error);
    const rawMsg = error instanceof Error ? error.message : 'Database or server error';
    const isTimeout = /transaction.*timeout|Transaction already closed|expired transaction/i.test(rawMsg);
    const message = isTimeout
      ? 'The server is busy. Please try again in a moment.'
      : rawMsg;
    return NextResponse.json(
      { error: 'Failed to fetch/create user', message },
      { status: 500 }
    );
  }
}