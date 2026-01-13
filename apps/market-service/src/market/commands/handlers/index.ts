import { GetCandlesHandler } from './get-candles.handler';
import { GetSymbolsHandler } from './get-symbols.handler';
import { GetCurrentPriceHandler } from './get-current-price.handler';

export const CommandHandlers = [
  GetCandlesHandler,
  GetSymbolsHandler,
  GetCurrentPriceHandler,
];

export { GetCandlesHandler, GetSymbolsHandler, GetCurrentPriceHandler };
