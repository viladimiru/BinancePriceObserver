import axios from 'axios';
import { type IsFutureExist } from '../../../shared/models/future';

export const isFutureExist: IsFutureExist = async (params) => {
	const result = await axios.get(
		'https://fapi.binance.com/fapi/v1/premiumIndex',
		{
			params: {
				symbol: params.symbol,
			},
		}
	);
	return !!result;
};
