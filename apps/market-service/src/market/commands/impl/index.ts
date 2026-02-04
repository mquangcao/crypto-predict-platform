import { MARKET_OPERATION } from '@app/common';

import { GetCandlesCommand } from './get-candles.command';
import { GetSymbolsCommand } from './get-symbols.command';
import { GetCurrentPriceCommand } from './get-current-price.command';

export const OperationsMap = {
  [MARKET_OPERATION.GET_CANDLES]: GetCandlesCommand,
  [MARKET_OPERATION.GET_SYMBOLS]: GetSymbolsCommand,
  [MARKET_OPERATION.GET_CURRENT_PRICE]: GetCurrentPriceCommand,
};

export { GetCandlesCommand, GetSymbolsCommand, GetCurrentPriceCommand };
