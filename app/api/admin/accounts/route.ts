// app/api/admin/accounts/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAdminAuthError } from '@/utils/admin-session';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Fetch all users with admin controls
export async function GET(req: Request) {
  const authError = getAdminAuthError(req);
  if (authError) {
    const res = NextResponse.json(authError.body, { status: authError.status });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res;
  }
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const search = url.searchParams.get('search') || '';
    const showHidden = url.searchParams.get('showHidden') === 'true';
    const showFrozen = url.searchParams.get('showFrozen') === 'true';

    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { telegramId: { contains: search } },
      ];
    }

    if (showFrozen) {
      whereClause.isFrozen = true;
    }

    if (showHidden) {
      whereClause.isHidden = true;
    }

    const totalUsers = await prisma.user.count({ where: whereClause });

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        telegramId: true,
        name: true,
        points: true,
        pointsBalance: true,
        whitePearls: true,
        bluePearlsPending: true,
        goldishPearls: true,
        region: true,
        isPremium: true,
        isFrozen: true,
        isHidden: true,
        createdAt: true,
        referralPointsEarned: true,
        mineLevelIndex: true,
        dailyRewardStreakDay: true,
        _count: {
          select: {
            completedTasks: { where: { isCompleted: true } },
            referrals: true,
            dailyCipherAttempts: { where: { claimedAt: { not: null } } },
            dailyComboAttempts: { where: { claimedAt: { not: null } } },
            ownedCards: true,
            stakes: true,
            miniGameAttempts: { where: { claimedAt: { not: null } } },
          },
        },
      },
      orderBy: { points: 'desc' },
      skip,
      take: limit,
    });

    const formattedUsers = users.map((user, index) => ({
      rank: skip + index + 1,
      id: user.id,
      telegramId: user.telegramId,
      name: user.name || 'Anonymous',
      points: Math.floor(user.points),
      pointsBalance: Math.floor(user.pointsBalance),
      whitePearls: Math.floor(user.whitePearls),
      bluePearls: Math.floor(user.bluePearlsPending),
      goldishPearls: Math.floor(user.goldishPearls),
      region: user.region,
      isPremium: user.isPremium,
      isFrozen: user.isFrozen,
      isHidden: user.isHidden,
      createdAt: user.createdAt,
      referralPointsEarned: Math.floor(user.referralPointsEarned),
      mineLevelIndex: user.mineLevelIndex,
      dailyRewardStreakDay: user.dailyRewardStreakDay,
      activities: {
        tasks: user._count.completedTasks,
        referrals: user._count.referrals,
        dailyCiphers: user._count.dailyCipherAttempts,
        dailyCombos: user._count.dailyComboAttempts,
        cards: user._count.ownedCards,
        stakes: user._count.stakes,
        miniGames: user._count.miniGameAttempts,
      },
    }));

    // Get summary stats
    const stats = await prisma.user.aggregate({
      _count: true,
      _sum: { points: true },
    });

    const frozenCount = await prisma.user.count({ where: { isFrozen: true } });
    const hiddenCount = await prisma.user.count({ where: { isHidden: true } });

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
      summary: {
        totalUsers: stats._count,
        totalPoints: Math.floor(stats._sum.points || 0),
        frozenCount,
        hiddenCount,
      },
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

// POST: Account management actions
export async function POST(req: Request) {
  const authError = getAdminAuthError(req);
  if (authError) return NextResponse.json(authError.body, { status: authError.status });
  try {
    const body = await req.json();
    const { action, userIds, allUsers } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    // Handle "all users" actions
    if (allUsers) {
      switch (action) {
        case 'reset_all': {
          // Reset all users: run each step sequentially (no transaction) so it works without a MongoDB replica set.
          try {
            await prisma.userTask.deleteMany({});
            await prisma.userDailyCipherAttempt.deleteMany({});
            await prisma.userDailyComboAttempt.deleteMany({});
            await prisma.userCard.deleteMany({});
            await prisma.userMiniGameAttempt.deleteMany({});
            await prisma.stake.deleteMany({});
            await prisma.userWeeklyProgress.deleteMany({});
            await prisma.onchainTaskCompletion.deleteMany({});
            await prisma.user.updateMany({
              data: {
                points: 0,
                pointsBalance: 0,
                referralPointsEarned: 0,
                offlinePointsEarned: 0,
                dailyRewardStreakDay: 0,
                lastDailyRewardClaimedAt: null,
                multitapLevelIndex: 0,
                energyLimitLevelIndex: 0,
                mineLevelIndex: 0,
                energy: 100,
                energyRefillsLeft: 6,
              },
            });
          } catch (err) {
            console.error('Reset all error:', err);
            const msg = err instanceof Error ? err.message : 'Reset failed';
            return NextResponse.json(
              { error: 'Failed to reset all. ' + msg },
              { status: 500 }
            );
          }
          return NextResponse.json({ success: true, message: 'All users reset successfully' });
        }

        case 'freeze_all':
          await prisma.user.updateMany({
            data: { isFrozen: true },
          });
          return NextResponse.json({ success: true, message: 'All users frozen' });

        case 'unfreeze_all':
          await prisma.user.updateMany({
            data: { isFrozen: false },
          });
          return NextResponse.json({ success: true, message: 'All users unfrozen' });

        case 'hide_all':
          await prisma.user.updateMany({
            data: { isHidden: true },
          });
          return NextResponse.json({ success: true, message: 'All users hidden' });

        case 'unhide_all':
          await prisma.user.updateMany({
            data: { isHidden: false },
          });
          return NextResponse.json({ success: true, message: 'All users unhidden' });

        default:
          return NextResponse.json({ error: 'Invalid action for all users' }, { status: 400 });
      }
    }

    // Handle individual/multiple user actions
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Missing userIds' }, { status: 400 });
    }

    switch (action) {
      case 'reset': {
        // Reset selected users (sequential, no transaction - works without MongoDB replica set)
        const userObjIds = userIds as string[];
        try {
          await prisma.userTask.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.userDailyCipherAttempt.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.userDailyComboAttempt.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.userCard.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.userMiniGameAttempt.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.stake.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.userWeeklyProgress.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.onchainTaskCompletion.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.user.updateMany({
            where: { id: { in: userObjIds } },
            data: {
              points: 0,
              pointsBalance: 0,
              referralPointsEarned: 0,
              offlinePointsEarned: 0,
              dailyRewardStreakDay: 0,
              lastDailyRewardClaimedAt: null,
              multitapLevelIndex: 0,
              energyLimitLevelIndex: 0,
              mineLevelIndex: 0,
              energy: 100,
              energyRefillsLeft: 6,
            },
          });
        } catch (err) {
          console.error('Reset users error:', err);
          const msg = err instanceof Error ? err.message : 'Reset failed';
          return NextResponse.json({ error: 'Failed to reset. ' + msg }, { status: 500 });
        }
        return NextResponse.json({ success: true, message: `${userIds.length} user(s) reset successfully` });
      }

      case 'freeze':
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isFrozen: true },
        });
        return NextResponse.json({ success: true, message: `${userIds.length} user(s) frozen` });

      case 'unfreeze':
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isFrozen: false },
        });
        return NextResponse.json({ success: true, message: `${userIds.length} user(s) unfrozen` });

      case 'hide':
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isHidden: true },
        });
        return NextResponse.json({ success: true, message: `${userIds.length} user(s) hidden` });

      case 'unhide':
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isHidden: false },
        });
        return NextResponse.json({ success: true, message: `${userIds.length} user(s) unhidden` });

      case 'delete': {
        const userObjIds = userIds as string[];
        try {
          // Unlink referrals (users who were referred by these users)
          await prisma.user.updateMany({
            where: { referredById: { in: userObjIds } },
            data: { referredById: null },
          });
          // UserTask has no onDelete Cascade — delete first
          await prisma.userTask.deleteMany({ where: { userId: { in: userObjIds } } });
          // Same order as reset + other user-linked data
          await prisma.userDailyCipherAttempt.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.userDailyComboAttempt.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.userCard.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.userMiniGameAttempt.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.stake.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.userWeeklyProgress.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.onchainTaskCompletion.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.treasuryTransaction.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.charityDonation.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.transfer.deleteMany({
            where: { OR: [{ senderId: { in: userObjIds } }, { recipientId: { in: userObjIds } }] },
          });
          await prisma.marketplaceListing.deleteMany({ where: { sellerId: { in: userObjIds } } });
          await prisma.marketplaceTrade.deleteMany({ where: { buyerId: { in: userObjIds } } });
          await prisma.userLeagueWeek.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.userTeamWeek.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.leagueJoinRequest.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.teamJoinRequest.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.teamMember.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.teamModeration.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.leagueChallengeStake.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.leagueChallengeContribution.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.userChallengeSnapshot.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.teamChallengeStake.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.teamChallengeContribution.deleteMany({ where: { userId: { in: userObjIds } } });
          await prisma.userTeamChallengeSnapshot.deleteMany({ where: { userId: { in: userObjIds } } });
          // Leagues created by these users: delete challenges then leagues
          const leaguesByCreator = await prisma.userCreatedLeague.findMany({
            where: { creatorId: { in: userObjIds } },
            select: { id: true },
          });
          const leagueIds = leaguesByCreator.map((l) => l.id);
          if (leagueIds.length > 0) {
            const leagueChallenges = await prisma.leagueChallenge.findMany({
              where: { creatorLeagueId: { in: leagueIds } },
              select: { id: true },
            });
            const lcIds = leagueChallenges.map((c) => c.id);
            if (lcIds.length > 0) {
              await prisma.leagueChallengeStake.deleteMany({ where: { challengeId: { in: lcIds } } });
              await prisma.leagueChallengeContribution.deleteMany({ where: { challengeId: { in: lcIds } } });
              await prisma.userChallengeSnapshot.deleteMany({ where: { challengeId: { in: lcIds } } });
            }
            await prisma.leagueChallenge.deleteMany({ where: { creatorLeagueId: { in: leagueIds } } });
            await prisma.userCreatedLeagueMember.deleteMany({ where: { leagueId: { in: leagueIds } } });
            await prisma.leagueJoinRequest.deleteMany({ where: { leagueId: { in: leagueIds } } });
            await prisma.leagueTeam.deleteMany({ where: { leagueId: { in: leagueIds } } });
            await prisma.leagueModeration.deleteMany({ where: { leagueId: { in: leagueIds } } });
            const leagueOpinions = await prisma.leagueOpinion.findMany({ where: { leagueId: { in: leagueIds } }, select: { id: true } });
            const loIds = leagueOpinions.map((o) => o.id);
            if (loIds.length > 0) await prisma.leagueOpinionVote.deleteMany({ where: { opinionId: { in: loIds } } });
            await prisma.leagueOpinion.deleteMany({ where: { leagueId: { in: leagueIds } } });
            await prisma.leagueAnnouncement.deleteMany({ where: { leagueId: { in: leagueIds } } });
            await prisma.userCreatedLeague.deleteMany({ where: { id: { in: leagueIds } } });
          }
          // Teams created by these users: delete challenges then teams
          const teamsByCreator = await prisma.team.findMany({
            where: { creatorId: { in: userObjIds } },
            select: { id: true },
          });
          const teamIds = teamsByCreator.map((t) => t.id);
          if (teamIds.length > 0) {
            const teamChallenges = await prisma.teamChallenge.findMany({
              where: { creatorTeamId: { in: teamIds } },
              select: { id: true },
            });
            const tcIds = teamChallenges.map((c) => c.id);
            if (tcIds.length > 0) {
              await prisma.teamChallengeStake.deleteMany({ where: { challengeId: { in: tcIds } } });
              await prisma.teamChallengeContribution.deleteMany({ where: { challengeId: { in: tcIds } } });
              await prisma.userTeamChallengeSnapshot.deleteMany({ where: { challengeId: { in: tcIds } } });
            }
            await prisma.teamChallenge.deleteMany({ where: { creatorTeamId: { in: teamIds } } });
            await prisma.teamMember.deleteMany({ where: { teamId: { in: teamIds } } });
            await prisma.teamJoinRequest.deleteMany({ where: { teamId: { in: teamIds } } });
            await prisma.teamModeration.deleteMany({ where: { teamId: { in: teamIds } } });
            const teamOpinions = await prisma.teamOpinion.findMany({ where: { teamId: { in: teamIds } }, select: { id: true } });
            const toIds = teamOpinions.map((o) => o.id);
            if (toIds.length > 0) await prisma.teamOpinionVote.deleteMany({ where: { opinionId: { in: toIds } } });
            await prisma.teamOpinion.deleteMany({ where: { teamId: { in: teamIds } } });
            await prisma.teamAnnouncement.deleteMany({ where: { teamId: { in: teamIds } } });
            await prisma.team.deleteMany({ where: { id: { in: teamIds } } });
          }
          await prisma.user.deleteMany({ where: { id: { in: userObjIds } } });
        } catch (err) {
          console.error('Delete users error:', err);
          const msg = err instanceof Error ? err.message : 'Delete failed';
          return NextResponse.json({ error: 'Failed to delete. ' + msg }, { status: 500 });
        }
        return NextResponse.json({ success: true, message: `${userIds.length} user(s) deleted permanently` });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing accounts:', error);
    return NextResponse.json({ error: 'Failed to manage accounts' }, { status: 500 });
  }
}
