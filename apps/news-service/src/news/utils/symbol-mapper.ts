/**
 * Map CryptoCompare categories/tags to valid Binance trading symbols
 * 
 * Categories from CryptoCompare API are general tags like:
 * - BLOCKCHAIN, CRYPTOCURRENCY, ALTCOIN, MARKET, TRADING, etc.
 * 
 * We need to convert them to actual tradable symbols like:
 * - BTCUSDT, ETHUSDT, BNBUSDT
 */

const CATEGORY_TO_SYMBOLS: Record<string, string[]> = {
  // Direct crypto symbol mappings
  'BTC': ['BTCUSDT'],
  'BITCOIN': ['BTCUSDT'],
  'ETH': ['ETHUSDT'],
  'ETHEREUM': ['ETHUSDT'],
  'BNB': ['BNBUSDT'],
  'XRP': ['XRPUSDT'],
  'SOL': ['SOLUSDT'],
  'SOLANA': ['SOLUSDT'],
  'ADA': ['ADAUSDT'],
  'CARDANO': ['ADAUSDT'],
  'DOGE': ['DOGEUSDT'],
  'DOGECOIN': ['DOGEUSDT'],
  
  // Generic categories -> major coins
  'ALTCOIN': ['ETHUSDT', 'BNBUSDT', 'SOLUSDT'],
  'CRYPTOCURRENCY': ['BTCUSDT', 'ETHUSDT'],
  'CRYPTO': ['BTCUSDT', 'ETHUSDT'],
  'BLOCKCHAIN': ['BTCUSDT', 'ETHUSDT'],
  'DEFI': ['ETHUSDT', 'BNBUSDT'],
  'NFT': ['ETHUSDT'],
  
  // Market/Trading related -> BTC as market indicator
  'MARKET': ['BTCUSDT'],
  'TRADING': ['BTCUSDT'],
  'BUSINESS': ['BTCUSDT'],
  'REGULATION': ['BTCUSDT', 'ETHUSDT'],
  'TECHNOLOGY': ['BTCUSDT', 'ETHUSDT'],
  'ANALYSIS': ['BTCUSDT'],
  
  // Exchanges -> major coins
  'BINANCE': ['BTCUSDT', 'BNBUSDT'],
  'COINBASE': ['BTCUSDT', 'ETHUSDT'],
  'EXCHANGE': ['BTCUSDT'],
};

/**
 * Convert CryptoCompare categories to valid Binance trading symbols
 * @param categories - Array of categories from CryptoCompare API
 * @returns Array of unique Binance trading symbols (e.g., ['BTCUSDT', 'ETHUSDT'])
 */
export function mapCategoriesToSymbols(categories: string[]): string[] {
  if (!categories || categories.length === 0) {
    return ['BTCUSDT']; // Default to BTC
  }

  const symbols = new Set<string>();
  
  for (const category of categories) {
    const upperCategory = category.toUpperCase().trim();
    
    // Skip empty categories
    if (!upperCategory) continue;
    
    // Check if category directly matches a symbol mapping
    const mapped = CATEGORY_TO_SYMBOLS[upperCategory];
    
    if (mapped) {
      // Add all mapped symbols
      mapped.forEach(symbol => symbols.add(symbol));
    } else {
      // Check if category contains a known crypto name
      for (const [key, values] of Object.entries(CATEGORY_TO_SYMBOLS)) {
        if (upperCategory.includes(key) || key.includes(upperCategory)) {
          values.forEach(symbol => symbols.add(symbol));
          break;
        }
      }
    }
  }
  
  // If no valid symbols found, default to BTC
  if (symbols.size === 0) {
    symbols.add('BTCUSDT');
  }
  
  // Limit to max 3 symbols to avoid too many impact analyses
  const result = Array.from(symbols).slice(0, 3);
  
  return result;
}

/**
 * Validate if a symbol is a valid Binance trading symbol
 * @param symbol - Symbol to validate
 * @returns true if valid
 */
export function isValidSymbol(symbol: string): boolean {
  const VALID_SYMBOLS = [
    'BTCUSDT',
    'ETHUSDT',
    'BNBUSDT',
    'XRPUSDT',
    'SOLUSDT',
    'ADAUSDT',
    'DOGEUSDT',
  ];
  
  return VALID_SYMBOLS.includes(symbol.toUpperCase());
}

/**
 * Filter and validate an array of symbols
 * @param symbols - Symbols to filter
 * @returns Only valid Binance symbols
 */
export function filterValidSymbols(symbols: string[]): string[] {
  return symbols.filter(s => isValidSymbol(s));
}
