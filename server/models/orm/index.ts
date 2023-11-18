import { orm } from './orm';
import { createPairModel } from './entities/pair';
import { createPriceModel } from './entities/price';
import { createSpikeModel } from './entities/spike';
import { createTradeModel } from './entities/trade';
import { createSessionModel } from './entities/session';
import { createFeedbackModel } from './entities/feedback';
import { createUserModel } from './entities/user';
import { setRelationships } from './relationships';

const PAIR = createPairModel(orm);
const PRICE = createPriceModel(orm);
const SPIKE = createSpikeModel(orm);
const TRADE = createTradeModel(orm);
const USER = createUserModel(orm);
const SESSION = createSessionModel(orm);
const FEEDBACK = createFeedbackModel(orm);

setRelationships(PAIR, PRICE, SPIKE, TRADE, USER);

orm.sync();

export { PAIR, PRICE, SPIKE, TRADE, SESSION, FEEDBACK, USER, orm };
