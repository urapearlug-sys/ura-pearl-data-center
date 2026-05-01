// utils/server-checks.ts

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

import { validate as validateInitData } from '@tma.js/init-data-node';
import { DEV_PREVIEW_TELEGRAM_ID } from '@/utils/dev-auth-constants';

export { DEV_PREVIEW_TELEGRAM_ID } from '@/utils/dev-auth-constants';

interface ValidatedData {
  [key: string]: string;
}

interface User {
  id?: string | number;
  username?: string;
  first_name?: string;
  is_premium?: boolean;
  language_code?: string;
}

interface ValidationResult {
  validatedData: ValidatedData | null;
  user: User;
  message: string;
}

// Accept init data for 7 days so users who leave the app open or return later don't get 403.
// Signature is still validated; only the age check is relaxed.
const INIT_DATA_MAX_AGE_SEC = 7 * 24 * 60 * 60;

/**
 * Skip Telegram init validation. Enabled for `next dev` and Vercel preview unless FORCE_TELEGRAM_AUTH=true.
 * Production uses real validation unless BYPASS_TELEGRAM_AUTH=true.
 */
export function isTelegramAuthBypassed(): boolean {
  if (process.env.FORCE_TELEGRAM_AUTH === 'true') return false;
  if (process.env.BYPASS_TELEGRAM_AUTH === 'true') return true;
  if (process.env.NODE_ENV === 'development') return true;
  if (process.env.VERCEL_ENV === 'preview') return true;
  return false;
}

export function validateTelegramWebAppData(telegramInitData: string): ValidationResult {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const BYPASS_AUTH = isTelegramAuthBypassed();

  console.log("validateTelegramWebAppData");
  console.log("telegramInitData", telegramInitData);

  let validatedData: ValidatedData | null = null;
  let user: User = {};
  let message = '';

  if (BYPASS_AUTH) {
    validatedData = { temp: '1', user: '{}' };
    user = {
      id: DEV_PREVIEW_TELEGRAM_ID,
      username: 'local_preview',
      first_name: 'Preview',
      language_code: 'en',
      is_premium: false,
    };
    message = 'Authentication bypassed (dev or preview)';
  } else {
    if (!BOT_TOKEN) {
      return { message: 'BOT_TOKEN is not set', validatedData: null, user: {} };
    }

    try {
      validateInitData(telegramInitData, BOT_TOKEN, { expiresIn: INIT_DATA_MAX_AGE_SEC });
    } catch (err) {
      const e = err as { name?: string; message?: string };
      message = e?.message || 'Hash validation failed';
      console.log('Init data validation error:', e?.name, message);
      return { message, validatedData: null, user: {} };
    }

    const initData = new URLSearchParams(telegramInitData);
    initData.delete('hash');
    validatedData = Object.fromEntries(initData.entries());
    message = 'Validation successful';
    const userString = validatedData['user'];
    if (userString) {
      try {
        user = JSON.parse(userString);
        console.log("Parsed user data:", user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        message = 'Error parsing user data';
        validatedData = null;
      }
    } else {
      message = 'User data is missing';
      validatedData = null;
    }
  }

  return { validatedData, user, message };
}