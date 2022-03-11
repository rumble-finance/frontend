export interface TokenListMap {
  Balancer: {
    Default: string;
    Vetted: string;
  };
  External: string[];
}

interface TokenListMapByNetwork {
  [networkKey: string]: TokenListMap;
}

/**
 * Mapping of the TokenLists used on each network
 */
export const TOKEN_LIST_MAP: TokenListMapByNetwork = {
  '43114': {
    Balancer: {
      Default:
        'https://raw.githubusercontent.com/rumble-finance/frontend/develop/public/json/tokenlist.json',
      Vetted:
        'https://raw.githubusercontent.com/rumble-finance/frontend/develop/public/json/tokenlist.json'
    },
    External: []
  }
};
