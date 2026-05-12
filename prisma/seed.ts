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


import 'tsconfig-paths/register';
import prisma from '@/utils/prisma';
import { TaskType } from '@prisma/client';
import { earnData } from '@/utils/tasks-data';

async function main() {
  console.log('Start seeding...');

  // Seed default Daily Cipher word pool (Hybrid mode auto-selection)
  const existingWords = await prisma.cipherWord.count();
  if (existingWords === 0) {
    const defaultCipherWords = ['PEARLS', 'COIN', 'TAP', 'MINE', 'REWARD', 'GAME', 'CRYPTO', 'TOKEN', 'TRADE', 'MOON', 'FARM', 'DEAL', 'GOLD', 'VAULT', 'LUCK', 'WINS', 'FAME', 'LAMP', 'BEAM', 'GLOW', 'SHINE', 'SPARK', 'FLAME', 'ICE', 'FIRE', 'WATER'];
    for (let i = 0; i < defaultCipherWords.length; i++) {
      await prisma.cipherWord.create({ data: { word: defaultCipherWords[i], order: i } });
    }
    console.log(`Seeded ${defaultCipherWords.length} cipher words`);
  }

  // Seed default Daily Combo cards (Matrix) - 12 cards: telegram, twitter, binance + 9 new
  const existingCards = await prisma.comboCard.count();
  if (existingCards === 0) {
    const defaultCards = [
      { slug: 'telegram', label: 'Telegram', image: 'telegram', category: 'PR', order: 0 },
      { slug: 'twitter', label: 'Twitter', image: 'twitter', category: 'PR', order: 1 },
      { slug: 'binance', label: 'Binance', image: 'binanceLogo', category: 'Markets', order: 2 },
      { slug: 'blockchain', label: 'Blockchain', image: 'blockchain', category: 'Markets', order: 3 },
      { slug: 'afrolumens', label: 'AfroLumens', image: 'afrolumens', category: 'Specials', order: 4 },
      { slug: 'mitroplus', label: 'Mitroplus', image: 'mitroplus', category: 'Markets', order: 5 },
      { slug: 'troncoin', label: 'Tron', image: 'troncoin', category: 'Markets', order: 6 },
      { slug: 'luminanetwork', label: 'Lumina', image: 'luminanetwork', category: 'Markets', order: 7 },
      { slug: 'sun', label: 'Sun.io', image: 'sun', category: 'Markets', order: 8 },
      { slug: 'afro', label: 'AfroToken', image: 'afro', category: 'Specials', order: 9 },
      { slug: 'autodex', label: 'AutoDex', image: 'autodex', category: 'Markets', order: 10 },
      { slug: 'jetideas', label: 'JetIdeas', image: 'jetideas', category: 'Specials', order: 11 },
    ];
    for (const c of defaultCards) {
      await prisma.comboCard.create({ data: c });
    }
    console.log(`Seeded ${defaultCards.length} combo cards`);
    const templates = [
      ['telegram', 'blockchain', 'afrolumens'],
      ['twitter', 'mitroplus', 'troncoin'],
      ['binance', 'luminanetwork', 'sun'],
      ['afro', 'autodex', 'jetideas'],
      ['blockchain', 'afrolumens', 'mitroplus'],
      ['troncoin', 'sun', 'telegram'],
    ];
    for (let i = 0; i < templates.length; i++) {
      await prisma.dailyComboTemplate.create({ data: { cardSlugs: templates[i], order: i } });
    }
    console.log(`Seeded ${templates.length} combo templates`);
  }

  // Seed default Collection cards
  const existingCollectionCards = await prisma.card.count();
  if (existingCollectionCards === 0) {
    const defaultCards = [
      { slug: 'starter', name: 'Beginner', description: 'Start your journey', image: 'dollarCoin', category: 'Specials', unlockType: 'starter', unlockPayload: {}, bonusType: 'profit_percent', bonusValue: 1, order: 0 },
      { slug: 'rank1', name: 'Shaka', description: 'Reach rank Shaka', image: 'baseGift', category: 'Markets', unlockType: 'rank', unlockPayload: { rankIndex: 1 }, bonusType: 'profit_percent', bonusValue: 2, order: 1 },
      { slug: 'rank2', name: 'Inkosi', description: 'Reach rank Inkosi', image: 'bigGift', category: 'Markets', unlockType: 'rank', unlockPayload: { rankIndex: 2 }, bonusType: 'profit_percent', bonusValue: 3, order: 2 },
      { slug: 'referral3', name: 'Social', description: 'Invite 3 friends', image: 'friends', category: 'PR', unlockType: 'referrals', unlockPayload: { referralCount: 3 }, bonusType: 'profit_percent', bonusValue: 2, order: 3 },
      { slug: 'referral5', name: 'Ambassador', description: 'Invite 5 friends', image: 'telegram', category: 'PR', unlockType: 'referrals', unlockPayload: { referralCount: 5 }, bonusType: 'profit_percent', bonusValue: 3, order: 4 },
      { slug: 'task1', name: 'First Task', description: 'Complete any task', image: 'youtube', category: 'Legal', unlockType: 'task', unlockPayload: {}, bonusType: 'profit_percent', bonusValue: 1, order: 5 },
      { slug: 'daily_cipher', name: 'Decode', description: 'Solve Decode once', image: 'dailyCipher', category: 'Specials', unlockType: 'daily_cipher', unlockPayload: {}, bonusType: 'profit_percent', bonusValue: 2, order: 6 },
    ];
    for (const c of defaultCards) {
      await prisma.card.create({ data: c });
    }
    console.log(`Seeded ${defaultCards.length} collection cards`);
  }

  for (const category of earnData) {
    for (const task of category.tasks) {
      // Convert the string type to TaskType enum
      const taskType = TaskType[task.type as keyof typeof TaskType];

      const createdTask = await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          points: task.points,
          type: taskType, // Use the converted TaskType enum value
          category: category.category,
          image: task.image,
          callToAction: task.callToAction,
          taskData: task.taskData,
        },
      });
      console.log(`Created task with id: ${createdTask.id}`);
    }
  }

  // Seed global joinable task templates (10 team + 10 league) so everyone can browse them
  const { GLOBAL_TASK_SEED_TEAM, GLOBAL_TASK_SEED_LEAGUE } = await import('@/utils/global-tasks-seed-data');
  const existingGlobalTasks = await prisma.globalTask.count();
  if (existingGlobalTasks === 0) {
    for (const t of GLOBAL_TASK_SEED_TEAM) {
      await prisma.globalTask.create({
        data: { ...t, participantType: 'team', managementBonusPercent: 30 },
      });
    }
    for (const t of GLOBAL_TASK_SEED_LEAGUE) {
      await prisma.globalTask.create({
        data: { ...t, participantType: 'league', managementBonusPercent: 30 },
      });
    }
    console.log(`Seeded ${GLOBAL_TASK_SEED_TEAM.length + GLOBAL_TASK_SEED_LEAGUE.length} global task templates (10 team, 10 league)`);
  }

  // Sample URA TV programs (Learn → URA TV) — replace or extend via /admin/tv-programs
  const tvProgramCount = await prisma.tvProgram.count();
  if (tvProgramCount === 0) {
    const tvSamples = [
      {
        title: 'URA TV — Tax basics for citizens',
        description: 'Sample episode introducing key tax concepts. Replace this row in admin with your production YouTube links.',
        youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        scheduledAt: new Date('2026-02-08T14:00:00.000Z'),
        sortOrder: 0,
        isPublished: true,
      },
      {
        title: 'Compliance corner (replay)',
        description: 'Archived discussion on filing and deadlines.',
        youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
        scheduledAt: new Date('2026-03-22T15:30:00.000Z'),
        sortOrder: 1,
        isPublished: true,
      },
      {
        title: 'Live: Ask URA — May community hour',
        description: 'Upcoming live session — submit questions in-app via comments after publish.',
        youtubeUrl: 'https://www.youtube.com/watch?v=YE7VzlLtp-4',
        scheduledAt: new Date('2026-05-28T17:00:00.000Z'),
        sortOrder: 2,
        isPublished: true,
      },
      {
        title: 'URA TV Weekly — Trailer',
        description: 'Short promo for the weekly roundup (scheduled soon).',
        youtubeUrl: 'https://youtu.be/9bZkp7q19f0',
        scheduledAt: new Date('2026-06-05T12:00:00.000Z'),
        sortOrder: 3,
        isPublished: true,
      },
    ];
    for (const row of tvSamples) {
      await prisma.tvProgram.create({ data: row });
    }
    console.log(`Seeded ${tvSamples.length} URA TV sample programs`);
  }

  // Sample URA FC fixtures (Learn → URA FC) — curated; full site at https://urafc.co.ug/
  const uraFcCount = await prisma.uraFcMatch.count();
  if (uraFcCount === 0) {
    const logoUra = 'https://urafc.co.ug/wp-content/uploads/2020/10/logo-1.png';
    const logoNec = 'https://urafc.co.ug/wp-content/uploads/2024/01/nec.png';
    const logoVipers = 'https://urafc.co.ug/wp-content/uploads/2022/12/new-vipers-logo-1-1.png';
    const logoKcca =
      'https://urafc.co.ug/wp-content/uploads/2022/12/Kampala_Capital_City_Authority_FC-1.png';

    const matchSamples = [
      {
        homeTeam: 'URA FC',
        awayTeam: 'Express FC',
        homeLogoUrl: logoUra,
        awayLogoUrl: null,
        kickoffAt: new Date('2026-05-03T13:00:00.000Z'),
        venue: 'Nakivubo Stadium',
        competition: 'Uganda Premier League',
        status: 'completed',
        homeScore: 4,
        awayScore: 1,
        highlightUrl: 'https://urafc.co.ug/',
        sortOrder: 0,
        isPublished: true,
      },
      {
        homeTeam: 'NEC FC',
        awayTeam: 'URA FC',
        homeLogoUrl: logoNec,
        awayLogoUrl: logoUra,
        kickoffAt: new Date('2026-04-12T13:00:00.000Z'),
        venue: 'Lugogo Stadium',
        competition: 'Uganda Premier League',
        status: 'completed',
        homeScore: 1,
        awayScore: 0,
        highlightUrl: 'https://urafc.co.ug/',
        sortOrder: 1,
        isPublished: true,
      },
      {
        homeTeam: 'URA FC',
        awayTeam: 'Vipers SC',
        homeLogoUrl: logoUra,
        awayLogoUrl: logoVipers,
        kickoffAt: new Date('2026-05-24T15:00:00.000Z'),
        venue: 'Mandela National Stadium',
        competition: 'Uganda Premier League',
        status: 'upcoming',
        homeScore: null,
        awayScore: null,
        highlightUrl: null,
        sortOrder: 2,
        isPublished: true,
      },
      {
        homeTeam: 'KCCA FC',
        awayTeam: 'URA FC',
        homeLogoUrl: logoKcca,
        awayLogoUrl: logoUra,
        kickoffAt: new Date('2026-06-07T13:00:00.000Z'),
        venue: 'Philip Omondi Stadium',
        competition: 'Uganda Premier League',
        status: 'upcoming',
        homeScore: null,
        awayScore: null,
        highlightUrl: null,
        sortOrder: 3,
        isPublished: true,
      },
    ];
    for (const row of matchSamples) {
      await prisma.uraFcMatch.create({ data: row });
    }
    console.log(`Seeded ${matchSamples.length} URA FC sample fixtures`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });