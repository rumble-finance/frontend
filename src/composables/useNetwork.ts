import { computed, ref } from 'vue';
import { Network } from '@rumble-finance/sdk';

/**
 * STATE
 */
const DEFAULT_NETWORK_ID =
  process.env.VUE_APP_NETWORK != null
    ? (Number(process.env.VUE_APP_NETWORK) as Network)
    : Network.AVALANCHE;

export const networkId = ref<Network>(DEFAULT_NETWORK_ID);

export const isMainnet = computed(() => networkId.value === Network.AVALANCHE);

/**
 * METHODS
 */
export function setNetworkId(id: Network) {
  networkId.value = id;
}

export default function useNetwork() {
  return {
    setNetworkId,
    networkId
  };
}
