import { configService } from '@/services/config/config.service';
import { BalancerSDK, Network } from '@rumble-finance/sdk';

const network = ((): Network => {
  switch (configService.network.key) {
    case '43114':
      return Network.AVALANCHE;
    default:
      return Network.AVALANCHE;
  }
})();

export const balancer = new BalancerSDK({
  network,
  rpcUrl: configService.rpc
});
