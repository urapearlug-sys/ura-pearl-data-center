// images/index.ts

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

import hamsterExchange from "./hamster-exchange.png";
import binanceLogo from "./binance-logo.png";
import dollarCoin from "./dollar-coin.png";
import dailyReward from "./daily-reward.png";
import dailyCipher from "./daily-cipher.png";
import dailyCombo from "./daily-combo.png";
// Version: 3 - AfroLumens branding update - Cache bust
import mainCharacter from "./main-character.png";
import hamsterCoin from "./hamster-coin.png";
import iceToken from "./ice-token.png";
import airdropHero from "./airdrop-hero.png";
import lightning from "./lightning.png";
import battery from "./battery.png";
import multiclick from "./multiclick.png";
import baseGift from "./base-gift.png";
import collection from "./collection.png";
import total from "./Total.png";
import game from "./Game.png";
import taps from "./Taps.png";
import bigGift from "./big-gift.png";
import youtube from "./youtube.png";
import telegram from "./telegram.png";
import twitter from "./twittter.png";
import friends from "./friends.png";
import tonWallet from "./ton-wallet.png";
import blockchain from "./blockchain.png";
import afrolumens from "./afrolumens.png";
import mitroplus from "./mitroplus.png";
import troncoin from "./troncoin.png";
import luminanetwork from "./luminanetwork.png";
import sun from "./sun.png";
import afro from "./afro.png";
import autodex from "./autodex.png";
import jetideas from "./jetideas.png";
import tiktalk from "./tiktalk.png";
import website from "./website.jpg";
import zoom from "./zoom.png";
import crystal1 from "./crystals/crystal1.png";
import crystal2 from "./crystals/crystal2.png";
import crystal3 from "./crystals/crystal3.png";
import crystal4 from "./crystals/crystal4.png";
import crystal5 from "./crystals/crystal5.png";
import crystal6 from "./crystals/crystal6.png";
import crystal7 from "./crystals/crystal7.png";
import crystal8 from "./crystals/crystal8.png";
import crystal9 from "./crystals/crystal9.png";
import crystal10 from "./crystals/crystal10.png";
import paidTrophy1 from "./paid-trophy1.png";
import paidTrophy2 from "./paid-trophy2.png";
import botUrlQr from "./bot-url-qr.png";
import announcements from "./Announcements.png";
import roketicon from "./roketicon.gif";
import uraLanding from "./ura-landing.png";
import defaultProfileAvatar from "./default-profile-avatar.png";
import uraFiscalFunBanner from "./ura-fiscal-fun-banner.png";
import uraDailyPearlCoins from "./ura-daily-pearl-coins.png";


export {
    hamsterExchange,
    binanceLogo,
    dollarCoin,
    dailyReward,
    dailyCipher,
    dailyCombo,
    mainCharacter,
    hamsterCoin,
    iceToken,
    airdropHero,
    lightning,
    battery,
    multiclick,
    baseGift,
    collection,
    total,
    game,
    taps,
    bigGift,
    youtube,
    telegram,
    twitter,
    friends,
    tonWallet,
    crystal1,
    crystal2,
    crystal3,
    crystal4,
    crystal5,
    crystal6,
    crystal7,
    crystal8,
    crystal9,
    crystal10,
    paidTrophy1,
    paidTrophy2,
    botUrlQr,
    announcements,
    roketicon,
    uraLanding,
    defaultProfileAvatar,
    uraFiscalFunBanner,
    uraDailyPearlCoins,
    blockchain,
    afrolumens,
    mitroplus,
    troncoin,
    luminanetwork,
    sun,
    afro,
    autodex,
    jetideas,
    tiktalk,
    website,
    zoom
};

/** Display names for image keys (e.g. in admin task image selector) */
export const imageDisplayNames: Record<string, string> = {
    tiktalk: 'TikTalk',
    website: 'Website',
    zoom: 'Zoom',
};

export const imageMap: Record<string, any> = {
    youtube,
    telegram,
    twitter,
    friends,
    binanceLogo,
    dollarCoin,
    baseGift,
    dailyCipher,
    dailyCombo,
    blockchain,
    afrolumens,
    mitroplus,
    troncoin,
    luminanetwork,
    sun,
    afro,
    autodex,
    jetideas,
    tiktalk,
    website,
    zoom,
    // Aliases so display names or alternate casing still resolve
    TikTalk: tiktalk,
    Website: website,
};

/** Resolve task image src (tries key as-is then lowercase so "TikTalk" and "tiktalk" both work). */
export function getTaskImageSrc(imageKey: string | null | undefined) {
    if (!imageKey || typeof imageKey !== 'string') return undefined;
    const key = imageKey.trim();
    return imageMap[key] ?? imageMap[key.toLowerCase()] ?? undefined;
}