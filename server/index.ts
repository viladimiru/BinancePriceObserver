import { createTradeController } from './controllers/createTrade';
import { deleteTradeController } from './controllers/deleteTrade';
import { sendFeedbackController } from './controllers/sendFeedback';
import { app } from './express/index';
import { createUserController } from './controllers/createUser';
import { updateSessionController } from './controllers/updateSession';
import { getPairsController } from './controllers/getPairs';
import { getSessionController } from './controllers/getSession';
import { removePriceController } from './controllers/removePrice';
import { createPairController } from './controllers/createPair';
import { isFutureExistController } from './controllers/isFutureExistController';
import { removeSpikeController } from './controllers/removeSpike';
import { isAlertSymbolExistController } from './controllers/isAlertSymbolExist';
import { getAlertSymbolsController } from './controllers/getAlertSymbols';
import { getChatPairsController } from './controllers/getChatPairs';
import { createPriceWithSymbolController } from './controllers/createPriceWithSymbol';
import { createSpikeWithSymbolController } from './controllers/createSpikeWithSymbol';
import { getChatTradesController } from './controllers/getChatTrades';
import { getSpikePairsController } from './controllers/getSpikePairs';
import { getChatPairPricesController } from './controllers/getChatPairPrices';
import { getChatTradesByPairsController } from './controllers/getChatTradesByPairs';
import { isSpikeExistController } from './controllers/isSpikeExist';
import { isPriceExistController } from './controllers/isPriceExist';
import { isChatTradeExistController } from './controllers/isChatTradeExist';

app.post('/sendFeedback', sendFeedbackController);
app.post('/createTrade', createTradeController);
app.post('/createUser', createUserController);
app.post('/updateSession', updateSessionController);
app.post('/createPair', createPairController);
app.post('/createPriceWithSymbol', createPriceWithSymbolController);
app.post('/createSpikeWithSymbol', createSpikeWithSymbolController);

app.get('/getPairs', getPairsController);
app.get('/getSession', getSessionController);
app.get('/isFutureExist/:symbol', isFutureExistController);
app.get('/isAlertSymbolExist', isAlertSymbolExistController);
app.get('/getAlertSymbols/:chatId', getAlertSymbolsController);
app.get('/getChatPairs', getChatPairsController);
app.get('/getChatTrades/:chatId', getChatTradesController);
app.get('/getSpikePairs/:symbol', getSpikePairsController);
app.get('/getChatPairPrices/:chatId', getChatPairPricesController);
app.get('/getChatTradesByPairs', getChatTradesByPairsController);
app.get('/isSpikeExist', isSpikeExistController);
app.get('/isPriceExist', isPriceExistController);
app.get('/isChatTradeExist', isChatTradeExistController);

app.delete('/deleteTrade', deleteTradeController);
app.delete('/removePrice', removePriceController);
app.delete('/removeSpike', removeSpikeController);
