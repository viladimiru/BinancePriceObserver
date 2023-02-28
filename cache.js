import fs from 'fs';
import { register } from './storage/index.js';
import { LAST_ACTIVITY } from './storage/const.js';
import dotenv from 'dotenv';

dotenv.config();

export const CACHE = {
	LAST_ACTIVITY: './cache/last-activity.json',
};

try {
	register(LAST_ACTIVITY, JSON.parse(fs.readFileSync(CACHE.LAST_ACTIVITY)));
} catch {
	register(LAST_ACTIVITY, {});
}

export function updateCache(path, data) {
	if (process.env.NODE_ENV === 'development') return;
	fs.writeFileSync(path, data);
}
