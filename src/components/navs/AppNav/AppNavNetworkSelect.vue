<template>
  <BalPopover align="left" no-pad>
    <template v-slot:activator>
      <BalBtn
        color="white"
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        class="ml-4 cursor-default"
      >
        <img
          :src="iconSrc(activeNetwork)"
          :alt="activeNetwork.name"
          class="w-5 h-5 rounded-full shadow-sm"
        />
        <span class="ml-2">
          {{ activeNetwork.name }}
        </span>
      </BalBtn>
    </template>
  </BalPopover>
</template>

<script lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import ConfigService from '@/services/config/config.service';
import { defineComponent } from 'vue';

interface Network {
  id: string;
  name: string;
  subdomain: string;
  key: string;
}

export default defineComponent({
  name: 'AppNavNetworkSelect',

  setup() {
    // SERVICES
    const configService = new ConfigService();

    // COMPOSABLES
    const { upToLargeBreakpoint } = useBreakpoints();

    // DATA
    const networks = [
      {
        id: 'ethereum',
        name: 'Avalanche',
        subdomain: 'app',
        key: '1'
      }
    ];

    const appNetworkSupported = networks
      .map(network => network.key)
      .includes(configService.network.key);

    const activeNetwork = networks.find(network => {
      if (!appNetworkSupported && network.id === 'ethereum') return true;
      return isActive(network);
    });

    // METHODS
    function iconSrc(network: Network): string {
      return require(`@/assets/images/icons/networks/${network.id}.svg`);
    }

    function appUrl(network: Network): string {
      return `https://${network.subdomain}.rumble.finance`;
    }

    function isActive(network: Network): boolean {
      if (!appNetworkSupported && network.id === 'ethereum') return true;
      return configService.network.key === network.key;
    }

    return {
      // computed
      upToLargeBreakpoint,
      // data
      networks,
      activeNetwork,
      // methods
      isActive,
      appUrl,
      iconSrc
    };
  }
});
</script>

<style>
.cursor-default {
  cursor: default;
}
</style>
