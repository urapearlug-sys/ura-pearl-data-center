// app/admin/page.tsx

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

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const AdminPanel = () => {
    const router = useRouter();

    // When landing on dashboard (leaving a protected section), clear item password so re-entry asks again
    useEffect(() => {
        fetch('/api/admin/clear-item-session', { method: 'POST', credentials: 'include' }).catch(() => {});
    }, []);

    const adminSections = [
        { title: 'Account Management', path: '/admin/accounts', description: 'Delete, reset, freeze, hide, and manage user accounts (select users in table, then use actions)' },
        { title: 'Bot Users', path: '/admin/bot-users', description: 'Identify and manage suspected bot/cheater accounts; flag users, freeze with cheating message, view suspicion score' },
        { title: 'Fees Collection', path: '/admin/fees-collection', description: 'View all transactions to the treasury wallet, by date and total' },
        { title: 'Manage Tasks (Earn Activities)', path: '/admin/tasks', description: 'Add, edit, and manage activities shown on the Earn tab (tabbed by category)' },
        { title: 'Decode', path: '/admin/daily-cipher', description: 'Set daily cipher overrides and word pool (Hybrid mode)' },
        { title: 'Matrix', path: '/admin/daily-combo', description: 'Set daily combo overrides and card pool (Hybrid mode)' },
        { title: 'Collection Cards', path: '/admin/cards', description: 'Manage collection cards (unlock by rank, referrals, task)' },
        { title: 'Weekly Event', path: '/admin/weekly-event', description: 'Override weekly event tiers (Hybrid mode)' },
        { title: 'Manage Onchain Tasks', path: '/admin/onchain-tasks', description: 'Add, edit, and manage onchain tasks' },
        { title: 'Notifications', path: '/admin/notifications', description: 'Create and manage in-app notifications (notification center, user profiles)' },
        { title: 'Milestone Banners', path: '/admin/milestone-banners', description: 'Create and publish one-time congratulations banners (e.g. 6,800 players, product launches) shown on main screen' },
        { title: 'Telegram broadcast', path: '/admin/telegram-broadcast', description: 'Send a message only to users\' Telegram bot chats (link + buttons; no in-app notification, no profiles)' },
        { title: 'Export User Data', path: '/admin/export', description: 'Export user information' },
        { title: 'Staking audit', path: '/admin/staking-audit', description: 'Report and correct stakes with wrong bonus %' },
        { title: 'League Management', path: '/admin/league-management', description: 'Add, delete, and manage teams and leagues; donate ALM to teams; add or remove teams from leagues' },
        { title: 'Global Joinable Tasks', path: '/admin/global-tasks', description: 'Track tasks (taps, tiers, invites); set winner and redeem prize (stakes + 2× bonus)' },
        { title: 'Mitroplus Quiz', path: '/admin/quiz', description: 'Set multiple-choice questions for the Earn page Mitroplus Quiz; users earn ALM on first completion' },
        { title: 'Daily Pattern', path: '/admin/daily-pattern', description: 'View today\'s 9-dot pattern for the minigame; set override. Pattern changes automatically each day.' },
        { title: 'Shop (Match 2 Earn)', path: '/admin/shop', description: 'Approve or reject product listings. Approved products appear in the in-app Shop where users sell for ALM.' },
    ];

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-[#1d2025] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-[#f3ba2f]">Admin Panel</h1>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-white text-sm"
                    >
                        Log out
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {adminSections.map((section) => (
                        <div
                            key={section.path}
                            className="bg-[#272a2f] rounded-lg p-6 hover:bg-[#3a3d42] transition-colors cursor-pointer"
                            onClick={() => router.push(section.path)}
                        >
                            <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                            <p className="text-gray-400 mb-4">{section.description}</p>
                            <Link
                                href={section.path}
                                className="inline-block bg-[#f3ba2f] text-black px-4 py-2 rounded-lg hover:bg-[#f4c141] transition-colors"
                            >
                                Go to {section.title}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;