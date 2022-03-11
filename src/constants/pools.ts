import { isMainnet, networkId } from '@/composables/useNetwork';
import { Network } from '@rumble-finance/sdk';

export const MIN_FIAT_VALUE_POOL_MIGRATION = isMainnet.value ? 100_000 : 1; // 100K USD or $1 for other networks

export type FactoryType =
  | 'oracleWeightedPool'
  | 'weightedPool'
  | 'stablePool'
  | 'managedPool'
  | 'liquidityBootstrappingPool'
  | 'boostedPool';

export type Pools = {
  IdsMap: Record<'staBAL' | 'bbAaveUSD', string>;
  Pagination: {
    PerPage: number;
  };
  DelegateOwner: string;
  ZeroAddress: string;
  DynamicFees: {
    Gauntlet: string[];
  };
  BlockList: string[];
  ExcludedPoolTypes: string[];
  Stable: {
    AllowList: string[];
  };
  Investment: {
    AllowList: string[];
  };
  Factories: Record<string, FactoryType>;
};

const POOLS_KOVAN: Pools = {
  IdsMap: {
    staBAL:
      '0xd387dfd3a786e7caa06e6cf0c675352c7ffff30400000000000000000000063e',
    bbAaveUSD:
      '0x8fd162f338b770f7e879030830cde9173367f3010000000000000000000004d8'
  },
  Pagination: {
    PerPage: 10
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: ['']
  },
  BlockList: [
    '0x22d398c68030ef6b1c55321cca6e0cecc5c93b2f000200000000000000000678',
    '0xca1eb8624be8e11418f629559321587197557e0c000200000000000000000682',
    '0xa21da5768186c1bc0f56dd72aa94672d77bdf23e00020000000000000000067a',
    '0x7f9db0d15eea32e205b7df0fa5184f4a8a905abb000200000000000000000683',
    '0x72c5a86831f019df6fac146fc14ef60ebe0d5f2600020000000000000000067f',
    '0x542b9f6fd4500b94d453974d8c70783ef794ff6a00020000000000000000067c',
    '0x47f9309a8c5a68a93ac27a4cccc0e222cd3adfa2000200000000000000000684',
    '0x3f3050a0fe84778aeff96906c9218b318f924d22000200000000000000000680',
    '0x31e61587b5dc148ae42ae323655fb8d7af7bb86600020000000000000000067d',
    '0x28efa7f86341aa0ad534bdfb033edb4f4ac6adf700020000000000000000067e',
    '0x10ee90b9ff4b9a44a773107280c0ce083619286800020000000000000000067b'
  ],
  ExcludedPoolTypes: ['Element', 'AaveLinear', 'Linear'],
  Stable: {
    AllowList: [
      '0x6b15a01b5d46a5321b627bd7deef1af57bc629070000000000000000000000d4', // kovan
      '0xe08590bde837eb9b2d42aa1196469d6e08fe96ec000200000000000000000101', // kovan
      '0xb4c23af48e79f73e3a7e36c0e54eb38e1ce1755e0002000000000000000000d3', // kovan
      '0x8fd162f338b770f7e879030830cde9173367f3010000000000000000000004d8', // kovan bb-a-USD,
      '0xd387dfd3a786e7caa06e6cf0c675352c7ffff30400000000000000000000063e' // kovan staBAL3,
    ]
  },
  Investment: {
    AllowList: [
      '0x4fd63966879300cafafbb35d157dc5229278ed23000100000000000000000169', // kovan
      '0x37a6fc079cad790e556baedda879358e076ef1b3000100000000000000000348' // WSB Kovan
    ]
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0xc66ba2b6595d3613ccab350c886ace23866ede24': 'stablePool',
    '0x1b57f637ce3408f1f834b0b70f9a595b062daea7': 'liquidityBootstrappingPool',
    '0x751dfdace1ad995ff13c927f6f761c6604532c79': 'stablePool', // Kovan
    '0x590e544e7ca956bb878f8c873e82e65550d67d2f': 'stablePool', // Kovan Metastable
    '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'managedPool', // Kovan Managed
    '0x6c7f4d97269ece163fd08d5c2584a21e4a33934c': 'boostedPool' // kovan stablephantom
  }
};

const POOLS_MAINNET: Pools = {
  IdsMap: {
    staBAL:
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
    bbAaveUSD:
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe'
  },
  Pagination: {
    PerPage: 10
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [
      '0x8339e311265a025fd5792db800daa8eda4264e2c000200000000000000000029',
      '0x45910faff3cbf990fdb204682e93055506682d1700020000000000000000000d',
      '0xfa22ec1c02f121083bf04fbbcaad019f490d7a3000020000000000000000002a',
      '0xa660ba113f9aabaeb4bcd28a4a1705f4997d5432000200000000000000000022',
      '0xea8886a24b6e01fba88a9e98d794e8d1f29ed863000200000000000000000010',
      '0x0b09dea16768f0799065c475be02919503cb2a3500020000000000000000001a',
      '0xde148e6cc3f6047eed6e97238d341a2b8589e19e000200000000000000000017',
      '0x5d563ca1e2daaae3402c36097b934630ab53702c000200000000000000000024',
      '0x9f1f16b025f703ee985b58ced48daf93dad2f7ef00020000000000000000001e',
      '0x3ebf48cd7586d7a4521ce59e53d9a907ebf1480f000200000000000000000028',
      '0xefaa1604e82e1b3af8430b90192c1b9e8197e377000200000000000000000021',
      '0x9c08c7a7a89cfd671c79eacdc6f07c1996277ed5000200000000000000000025',
      '0xe99481dc77691d8e2456e5f3f61c1810adfc1503000200000000000000000018',
      '0xec60a5fef79a92c741cb74fdd6bfc340c0279b01000200000000000000000015',
      '0x231e687c9961d3a27e6e266ac5c433ce4f8253e4000200000000000000000023',
      '0x80be0c303d8ad2a280878b50a39b1ee8e54dbd2200020000000000000000000f',
      '0x5aa90c7362ea46b3cbfbd7f01ea5ca69c98fef1c000200000000000000000020',
      '0xa6f548df93de924d73be7d25dc02554c6bd66db500020000000000000000000e',
      '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019',
      '0x186084ff790c65088ba694df11758fae4943ee9e000200000000000000000013',
      '0x4626d81b3a1711beb79f4cecff2413886d461677000200000000000000000011',
      '0x072f14b85add63488ddad88f855fda4a99d6ac9b000200000000000000000027',
      '0xaac98ee71d4f8a156b6abaa6844cdb7789d086ce00020000000000000000001b',
      '0x7eb878107af0440f9e776f999ce053d277c8aca8000200000000000000000012',
      '0x16faf9f73748013155b7bc116a3008b57332d1e600020000000000000000001c',
      '0x6ae82385f76e3742f89cb46343b169f6ee49de1b000200000000000000000016',
      '0x8a92c3afabab59101b4e2426c82a7ddbb66b545000020000000000000000001f',
      '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
      '0xf4c0dd9b82da36c07605df83c8a416f11724d88b000200000000000000000026',
      '0x3e5fa9518ea95c3e533eb377c001702a9aacaa32000200000000000000000052',
      '0xf8a0623ab66f985effc1c69d05f1af4badb01b0000020000000000000000001d',
      '0x021c343c6180f03ce9e48fae3ff432309b9af19900020000000000000000000b',
      '0x14462305d211c12a736986f4e8216e28c5ea7ab4000200000000000000000068',
      '0xf5aaf7ee8c39b651cebf5f1f50c10631e78e0ef9000200000000000000000069',
      '0xe2469f47ab58cf9cf59f9822e3c5de4950a41c49000200000000000000000089',
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
      '0x87165b659ba7746907a48763063efa3b323c2b0700020000000000000000002d',
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063'
    ]
  },
  BlockList: [''],
  ExcludedPoolTypes: ['Element', 'AaveLinear', 'Linear'],
  Stable: {
    AllowList: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063', // staBAL3 (DAI-USD-USDC)
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066', // WBTC-renBTC-sBTC
      '0x9f19a375709baf0e8e35c2c5c65aca676c4c719100000000000000000000006e', // PAR-sEUR-EURS
      '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080', // Lido Metastable
      '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112', // Rocket Pool Metastable
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe' // Mainnet bb-a-USD
    ]
  },
  Investment: {
    AllowList: [
      '0xccf5575570fac94cec733a58ff91bb3d073085c70002000000000000000000af', // iROBOT mainnet
      '0xe7b1d394f3b40abeaa0b64a545dbcf89da1ecb3f00010000000000000000009a', // Techemy mainnet
      '0x3b40d7d5ae25df2561944dd68b252016c4c7b2800001000000000000000000c2' // WSB-DEFI mainnet
    ]
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0xc66ba2b6595d3613ccab350c886ace23866ede24': 'stablePool',
    '0x67d27634e44793fe63c467035e31ea8635117cd4': 'stablePool', // Metastable
    '0x751a0bc0e3f75b38e01cf25bfce7ff36de1c87de': 'liquidityBootstrappingPool', // Mainnet LBP
    '0x0f3e0c4218b7b0108a3643cfe9d3ec0d4f57c54e': 'liquidityBootstrappingPool', // Mainnet LBP (zero protocol fee)
    '0x48767f9f868a4a7b86a90736632f6e44c2df7fa9': 'managedPool', // Mainnet Managed
    '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'boostedPool' // mainnet stablephantom
  }
};

const POOLS_POLYGON: Pools = {
  IdsMap: {
    staBAL:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    bbAaveUSD:
      '0x0000000000000000000000000000000000000000000000000000000000000000'
  },
  Pagination: {
    PerPage: 10
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: ['']
  },
  BlockList: [''],
  ExcludedPoolTypes: ['Element', 'AaveLinear', 'Linear'],
  Stable: {
    AllowList: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012', // polygon MAI/DAI/USDC/USDT
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc5600020000000000000000001e', // polygon WBTC/renBTC
      '0x9f19a375709baf0e8e35c2c5c65aca676c4c7191000200000000000000000022', // polygon PAR/PAR,
      '0xf38cf113d2d4f60c36cbd95af2f48a9a0167045a00000000000000000000005b', // polygon,
      '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068', // tusd polygon
      '0x5028497af0c9a54ea8c6d42a054c0341b9fc616800020000000000000000007b', // dusd polygon
      '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366' // polygon staked matic
    ]
  },
  Investment: {
    AllowList: ['']
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0xc66ba2b6595d3613ccab350c886ace23866ede24': 'stablePool',
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'stablePool', // Metastable
    '0x751a0bc0e3f75b38e01cf25bfce7ff36de1c87de': 'liquidityBootstrappingPool', // LBP
    '0x41b953164995c11c81da73d212ed8af25741b7ac': 'liquidityBootstrappingPool', // LBP (zero protocol fee)
    '0x0f7bb7ce7b6ed9366f9b6b910adefe72dc538193': 'managedPool', // Polygon Managed
    '0xc128a9954e6c874ea3d62ce62b468ba073093f25': 'boostedPool' // polygon stablephantom
  }
};

const POOLS_ARBITRUM: Pools = {
  IdsMap: {
    staBAL:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    bbAaveUSD:
      '0x0000000000000000000000000000000000000000000000000000000000000000'
  },
  Pagination: {
    PerPage: 10
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: ['']
  },
  BlockList: [''],
  ExcludedPoolTypes: ['Element', 'AaveLinear', 'Linear'],
  Stable: {
    AllowList: [
      '0x9be7de742865d021c0e8fb9d64311b2c040c1ec1000200000000000000000012', // arbitrum
      '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016', // arbitrum
      '0x386b5d43ba8b97c43d4afb4cdae7877a1b295e8a000000000000000000000020' // tusd arbitrum
    ]
  },
  Investment: {
    AllowList: ['']
  },
  Factories: {
    '0x7dfdef5f355096603419239ce743bfaf1120312b': 'weightedPool', // Arbitrum Weighted
    '0xcf0a32bbef8f064969f21f7e02328fb577382018': 'weightedPool', // Arbitrum WeightedOracle
    '0x2433477a10fc5d31b9513c638f19ee85caed53fd': 'stablePool', // Arbitrum Stable
    '0xebfd5681977e38af65a7487dc70b8221d089ccad': 'stablePool', // Arbitrum MetaStable
    '0x142b9666a0a3a30477b052962dda81547e7029ab': 'liquidityBootstrappingPool', // Arbitrum LBP (old)
    '0x1802953277fd955f9a254b80aa0582f193cf1d77': 'liquidityBootstrappingPool', // Arbitrum LBP (new)
    '0xacd615b3705b9c880e4e7293f1030b34e57b4c1c': 'managedPool', // arbitrum managed
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'boostedPool' // arbitrum stablephantom
  }
};

const POOLS_GENERIC: Pools = {
  IdsMap: {
    staBAL:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    bbAaveUSD:
      '0x0000000000000000000000000000000000000000000000000000000000000000'
  },
  Pagination: {
    PerPage: 10
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: ['']
  },
  BlockList: [''],
  ExcludedPoolTypes: ['Element', 'AaveLinear', 'Linear'],
  Stable: {
    AllowList: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
      '0x9f19a375709baf0e8e35c2c5c65aca676c4c719100000000000000000000006e',
      '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080', // Lido Metastable
      '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112', // Rocket Pool Metastable
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012', // polygon
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc5600020000000000000000001e', // polygon
      '0x6b15a01b5d46a5321b627bd7deef1af57bc629070000000000000000000000d4', // kovan
      '0xe08590bde837eb9b2d42aa1196469d6e08fe96ec000200000000000000000101', // kovan
      '0xb4c23af48e79f73e3a7e36c0e54eb38e1ce1755e0002000000000000000000d3', // kovan
      '0x9be7de742865d021c0e8fb9d64311b2c040c1ec1000200000000000000000012', // arbitrum
      '0x9f19a375709baf0e8e35c2c5c65aca676c4c7191000200000000000000000022', // polygon PAR/PAR,
      '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016', // arbitrum
      '0xf38cf113d2d4f60c36cbd95af2f48a9a0167045a00000000000000000000005b', // polygon,
      '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068', // tusd polygon
      '0x386b5d43ba8b97c43d4afb4cdae7877a1b295e8a000000000000000000000020', // tusd arbitrum
      '0x5028497af0c9a54ea8c6d42a054c0341b9fc616800020000000000000000007b', // dusd polygon
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe', // Mainnet bb-a-USD
      '0x8fd162f338b770f7e879030830cde9173367f3010000000000000000000004d8', // kovan bb-a-USD,
      '0xd387dfd3a786e7caa06e6cf0c675352c7ffff30400000000000000000000063e', // kovan staBAL3,
      '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366' // staked matic
    ]
  },
  Investment: {
    AllowList: [
      '0x4fd63966879300cafafbb35d157dc5229278ed23000100000000000000000169', // kovan
      '0x37a6fc079cad790e556baedda879358e076ef1b3000100000000000000000348', // WSB Kovan
      '0xccf5575570fac94cec733a58ff91bb3d073085c70002000000000000000000af', // iROBOT mainnet
      '0xe7b1d394f3b40abeaa0b64a545dbcf89da1ecb3f00010000000000000000009a', // Techemy mainnet
      '0x3b40d7d5ae25df2561944dd68b252016c4c7b2800001000000000000000000c2' // WSB-DEFI mainnet
    ]
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0xc66ba2b6595d3613ccab350c886ace23866ede24': 'stablePool',
    '0x67d27634e44793fe63c467035e31ea8635117cd4': 'stablePool', // Metastable
    '0x751dfdace1ad995ff13c927f6f761c6604532c79': 'stablePool', // Kovan
    '0x590e544e7ca956bb878f8c873e82e65550d67d2f': 'stablePool', // Kovan Metastable
    // '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'managedPool', // Kovan Managed (clash with mainnet StablePhantom address)
    '0x7dfdef5f355096603419239ce743bfaf1120312b': 'weightedPool', // Arbitrum Weighted
    '0xcf0a32bbef8f064969f21f7e02328fb577382018': 'weightedPool', // Arbitrum WeightedOracle
    '0x2433477a10fc5d31b9513c638f19ee85caed53fd': 'stablePool', // Arbitrum Stable
    '0xebfd5681977e38af65a7487dc70b8221d089ccad': 'stablePool', // Arbitrum MetaStable
    '0x751a0bc0e3f75b38e01cf25bfce7ff36de1c87de': 'liquidityBootstrappingPool', // Mainnet LBP
    '0x0f3e0c4218b7b0108a3643cfe9d3ec0d4f57c54e': 'liquidityBootstrappingPool', // Mainnet LBP (zero protocol fee)
    '0x142b9666a0a3a30477b052962dda81547e7029ab': 'liquidityBootstrappingPool', // Arbitrum LBP (old)
    '0x1802953277fd955f9a254b80aa0582f193cf1d77': 'liquidityBootstrappingPool', // Arbitrum LBP (new)
    '0x48767f9f868a4a7b86a90736632f6e44c2df7fa9': 'managedPool', // Mainnet Managed
    '0x0f7bb7ce7b6ed9366f9b6b910adefe72dc538193': 'managedPool', // Polygon Managed
    '0xacd615b3705b9c880e4e7293f1030b34e57b4c1c': 'managedPool', // arbitrum managed
    '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'boostedPool', // mainnet stablephantom
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'boostedPool', // arbitrum stablephantom
    '0xc128a9954e6c874ea3d62ce62b468ba073093f25': 'boostedPool', // polygon stablephantom
    '0x6c7f4d97269ece163fd08d5c2584a21e4a33934c': 'boostedPool' // kovan stablephantom
  }
};

const POOLS_MAP = {
  [Network.AVALANCHE]: POOLS_MAINNET,
};
export const POOLS: Pools = POOLS_MAP[networkId.value]
  ? POOLS_MAP[networkId.value]
  : POOLS_GENERIC;
