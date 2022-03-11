import { networkId } from '@/composables/useNetwork';
import { Network } from '@rumble-finance/sdk';

import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import { aaveSubgraphClient } from './aave-subgraph.client';

import Reserves from './entities/reserves';

export default class AaveSubgraphService {
  reserves: Reserves;

  constructor(
    readonly client = aaveSubgraphClient,
    readonly rpcProviderService = _rpcProviderService
  ) {
    // Init entities
    this.reserves = new Reserves(this);
  }

  public get blockTime(): number {
    switch (networkId.value) {
      case Network.AVALANCHE:
        return 3;
      default:
        return 4;
    }
  }
}

export const aaveSubgraphService = new AaveSubgraphService();
