import axios, { Axios } from 'axios';
import { type DeleteAlerts } from '../../../shared/models/alerts';
import {
	type UpdateSession,
	type GetSession,
} from '../../../shared/models/session';
import {
	type CreatePriceWithSymbol,
	type IsPriceExist,
	type RemovePrice,
} from '../../../shared/models/price';
import {
	type CreatePair,
	type GetPairs,
	type GetAlertSymbols,
	type GetChatPairs,
	type IsAlertSymbolExist,
} from '../../../shared/models/pair';
import {
	type GetChatTradesByPairs,
	type GetChatTrades,
	type CreateTrade,
	type IsChatTradeExist,
	type RemoveTrade,
} from '../../../shared/models/trade';
import {
	type IsFutureExist,
	type GetChatPairPrices,
} from '../../../shared/models/future';
import { type AddFeedback } from '../../../shared/models/feedback';
import { type CreateUser } from '../../../shared/models/user';
import {
	type IsSpikeExist,
	type GetSpikePairs,
	type RemoveSpike,
	type CreateSpikeWithSymbol,
} from '../../../shared/models/spike';

class ApiClient extends Axios {
	sendFeedback: AddFeedback = async (params) => {
		await this.post('/sendFeedback', params);
	};

	createUser: CreateUser = async (params) => {
		await this.post('/createUser', params);
	};

	updateSession: UpdateSession = async (params) => {
		await this.post('/updateSession', params);
	};

	getSession: GetSession = async (params) => {
		return await this.get('/getSession', {
			params,
		});
	};

	removePrice: RemovePrice = async (params) => {
		return await this.delete('/removePrice', {
			data: params,
		});
	};

	removeSpike: RemoveSpike = async (request) => {
		return await this.delete('/removeSpike', {
			data: request,
		});
	};

	getPairs: GetPairs = async () => {
		const pairs = await this.get('/getPairs');
		if (!Array.isArray(pairs)) {
			return [];
		}

		return pairs;
	};

	getSpikePairs: GetSpikePairs = async ({ symbol }) => {
		return await this.get(`/getSpikePairs/${symbol}`);
	};

	getChatPairPrices: GetChatPairPrices = async ({ chatId }) => {
		return await this.get(`/getChatPairPrices/${chatId}`);
	};

	getChatTradesByPairs: GetChatTradesByPairs = async (request) => {
		return await this.get('/getChatTradesByPairs', {
			params: request,
		});
	};

	// TODO: rename method
	getPairIndex: IsFutureExist = async (symbol: any) => {
		return await this.get(`/isFutureExist/${symbol}`);
	};

	createPair: CreatePair = async (request: any) => {
		await this.post('/createPair', request);
	};

	isAlertSymbolExist: IsAlertSymbolExist = async (request: {
		symbol: string;
		chatId: number;
	}) => {
		return await this.get('/isAlertSymbolExist', {
			params: request,
		});
	};

	getAlertSymbols: GetAlertSymbols = async ({ chatId }) => {
		return await this.get(`/getAlertSymbols/${chatId}`);
	};

	isSpikeExist: IsSpikeExist = async (request) => {
		return await this.get('/isSpikeExist', {
			params: request,
		});
	};

	isPriceExist: IsPriceExist = async (request) => {
		return await this.get('/isPriceExist', {
			params: request,
		});
	};

	deleteAlerts: DeleteAlerts = async (params) => {
		await this.delete('/deleteAlerts', {
			data: params,
		});
	};

	getChatPairs: GetChatPairs = async (request: {
		chatId: number;
		symbol: string;
	}) => {
		return await this.get('/getChatPairs', {
			params: request,
		});
	};

	createTrade: CreateTrade = async (request) => {
		await this.post('/createTrade', request);
	};

	createPriceWithSymbol: CreatePriceWithSymbol = async (request) => {
		await this.post('/createPriceWithSymbol', request);
	};

	createSpikeWithSymbol: CreateSpikeWithSymbol = async (request) => {
		await this.post('/createPriceWithSymbol', request);
	};

	isChatTradeExist: IsChatTradeExist = async (request) => {
		return await this.get('/isChatTradeExist', {
			data: request,
		});
	};

	removeTrade: RemoveTrade = async (request) => {
		await this.delete('/deleteTrade', {
			data: request,
		});
	};

	getChatTrades: GetChatTrades = async ({ chatId }) => {
		return await this.get(`/getChatTrades/${chatId}`);
	};
}

export const apiClient = new ApiClient({
	transformRequest: axios.defaults.transformRequest,
	transformResponse: axios.defaults.transformResponse,
	baseURL: 'http://localhost:3000/',
});
// TODO: move requests and responses in logger
// apiClient.interceptors.request.use((request) => {
// 	console.log('REQUEST_URL:', request.url);
// 	console.log('REQUEST_DATA:', request.data);
// 	return request;
// });

// apiClient.interceptors.response.use((response) => {
// 	console.log('RESPONSE_URL:', response.config.url);
// 	console.log('RESPONSE_DATA:', response.data);
// 	return response;
// });

apiClient.interceptors.response.use((response) => response.data);
