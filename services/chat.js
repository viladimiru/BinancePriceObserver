import { get, BOT_MESSANGER } from '../storage/index.js';
import { logger } from '../logs.js';

export function sendMessage() {
	return get(BOT_MESSANGER)(...arguments).catch(logger.error);
}
