import { SUPPORTED_FIAT } from '@/constants/currency';
import { PriceService } from './api/price.service';
import { coingeckoClient } from './coingecko.client';

export const getNativeAssetId = (chainId: string): string => {
  const mapping = {
    '43114': 'avalanche-2'
  };

  return mapping[chainId] || 'avalanche-2';
};

export const getPlatformId = (chainId: string): string => {
  const mapping = {
    '43114': 'avalanche'
  };

  return mapping[chainId] || 'avalanche';
};

export class CoingeckoService {
  supportedFiat: string;
  prices: PriceService;

  constructor(
    public readonly client = coingeckoClient,
    priceServiceClass = PriceService
  ) {
    this.supportedFiat = SUPPORTED_FIAT.join(',');
    this.prices = new priceServiceClass(this);
  }
}

export const coingeckoService = new CoingeckoService();
