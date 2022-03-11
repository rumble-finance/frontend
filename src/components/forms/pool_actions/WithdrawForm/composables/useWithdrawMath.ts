/**
 * useWithdrawMath
 *
 * Returns state, computed properties and methods for the withdraw form math.
 *
 * TODO:
 * Requires major refactor following Boosted pools (StablePhantom) logic additions.
 */
import { computed, Ref, ref, watch } from 'vue';
import { bnSum, bnum, forChange } from '@/lib/utils';
import { formatUnits, parseUnits } from '@ethersproject/units';
// Types
import { FullPool } from '@/services/balancer/subgraph/types';
// Services
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
// Composables
import useUserSettings from '@/composables/useUserSettings';
import useSlippage from '@/composables/useSlippage';
import useTokens from '@/composables/useTokens';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useWeb3 from '@/services/web3/useWeb3';
import { isStablePhantom, usePool } from '@/composables/usePool';
import { BatchSwapOut } from '@/types';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import OldBigNumber from 'bignumber.js';
import { TokenInfo } from '@/types/TokenList';
import { balancer } from '@/lib/balancer.sdk';
import {
  SwapType,
  TransactionData,
  BalancerError,
  BalancerErrorCode
} from '@rumble-finance/sdk';
import { SwapKind } from '@balancer-labs/balancer-js';
import usePromiseSequence from '@/composables/usePromiseSequence';
import { setError, WithdrawalError } from './useWithdrawalState';

/**
 * TYPES
 */
export type WithdrawMathResponse = ReturnType<typeof useWithdrawMath>;

export default function useWithdrawMath(
  pool: Ref<FullPool>,
  isProportional: Ref<boolean> = ref(true),
  tokenOut: Ref<string> = ref(''),
  tokenOutIndex: Ref<number> = ref(0)
) {
  /**
   * STATE
   */
  const propBptIn = ref('');
  const tokenOutAmount = ref('');

  const batchSwap = ref<BatchSwapOut | null>(null);
  const batchSwapLoading = ref(false);

  const batchRelayerSwap = ref<any | null>(null);
  const batchRelayerSwapLoading = ref(false);

  // This array can be set by either a regular batch swap result
  // or a batch relayer result, if the batch swap returns 0.
  const batchSwapSingleAssetMaxes = ref<string[]>([]);

  /**
   * COMPOSABLES
   */
  const { isWalletReady, account } = useWeb3();
  const { toFiat, fNum2 } = useNumbers();
  const {
    tokens: allTokens,
    balances,
    balanceFor,
    getToken,
    dynamicDataLoading
  } = useTokens();
  const {
    minusSlippage,
    addSlippageScaled,
    minusSlippageScaled
  } = useSlippage();
  const { isStablePhantomPool, isWeightedPool } = usePool(pool);
  const { slippageScaled } = useUserSettings();
  const {
    promises: swapPromises,
    processing: processingSwaps,
    processAll: processSwaps
  } = usePromiseSequence();

  /**
   * SERVICES
   */
  const poolCalculator = new PoolCalculator(pool, allTokens, balances, 'exit');

  /**
   * COMPUTED
   */
  const tokenAddresses = computed((): string[] => {
    if (isStablePhantom(pool.value.poolType)) {
      return pool.value.mainTokens || [];
    }
    return pool.value.tokenAddresses;
  });

  const tokenCount = computed((): number => tokenAddresses.value.length);

  // The tokens of the pool
  const poolTokens = computed((): TokenInfo[] =>
    pool.value.tokenAddresses.map(address => getToken(address))
  );

  const tokenOutDecimals = computed(
    (): number => getToken(tokenOut.value).decimals
  );

  const poolDecimals = computed((): number => pool.value.onchain.decimals);

  /**
   * The tokens being withdrawn
   * In most cases these are the same as the pool tokens
   * except for Stable Phantom pools
   */
  const withdrawalTokens = computed((): TokenInfo[] =>
    tokenAddresses.value.map(address => getToken(address))
  );

  const bptBalance = computed((): string => balanceFor(pool.value.address));

  const bptBalanceScaled = computed((): string =>
    parseUnits(bptBalance.value, poolDecimals.value).toString()
  );

  /**
   * Returns the absolute max BPT withdrawable from a pool.
   * In most cases this is just the user's BPT balance.
   *
   * However, for weighted pools, if the user is a majority LP they may
   * only be able to withdraw up to the 30% limit.
   */
  const absMaxBpt = computed((): string => {
    if (!isWeightedPool.value) return bptBalance.value;
    // Maximum BPT allowed from weighted pool is 30%
    const poolMax = bnum(pool.value.totalShares)
      .times(0.3)
      .toFixed(poolDecimals.value, OldBigNumber.ROUND_DOWN);
    // If the user's bpt balance is greater than the withdrawal limit for
    // weighted pools we need to return the poolMax bpt value.
    return OldBigNumber.min(bptBalance.value, poolMax).toString();
  });

  const hasBpt = computed(() => bnum(bptBalance.value).gt(0));

  const tokenOutPoolBalance = computed(() => {
    const balances = Object.values(pool.value.onchain.tokens).map(
      token => token.balance
    );
    return balances[tokenOutIndex.value];
  });

  const amountExceedsPoolBalance = computed(() =>
    bnum(tokenOutAmount.value).gt(tokenOutPoolBalance.value)
  );

  /**
   * Proportional pool token amounts out given BPT in.
   * Only relevant for exit calls, not batchSwap or batch relayer exits.
   */
  const proportionalPoolTokenAmounts = computed((): string[] => {
    const { receive } = poolCalculator.propAmountsGiven(
      propBptIn.value,
      0,
      'send'
    );
    return receive;
  });

  /**
   * Proportional amounts out for a StablePhantom pool's output tokens.
   * Derived from queryBatchSwap or batchRelayer amounts out result.
   * Output tokens could be the mainTokens or unwrapped wrapped tokens.
   * e.g. USDC, USDT, DAI or aUSDC, aUSDT, aDAI
   */
  const proportionalMainTokenAmounts = computed((): string[] => {
    if (shouldUseBatchRelayer.value && batchRelayerSwap.value) {
      return batchRelayerSwap.value.outputs.amountsOut.map((amount, i) => {
        const _amount = bnum(amount.toString())
          .abs()
          .toString();
        return formatUnits(_amount, withdrawalTokens.value[i].decimals);
      });
    } else if (batchSwap.value) {
      return batchSwap.value.returnAmounts.map((amount, i) => {
        const _amount = bnum(amount.toString())
          .abs()
          .toString();
        return formatUnits(_amount, withdrawalTokens.value[i].decimals);
      });
    }
    return new Array(tokenCount.value).fill('0');
  });

  const proportionalAmounts = computed((): string[] => {
    if (isStablePhantomPool.value) {
      return proportionalMainTokenAmounts.value;
    }
    return proportionalPoolTokenAmounts.value;
  });

  const fullAmounts = computed(() => {
    if (isProportional.value) return proportionalAmounts.value;
    return new Array(tokenCount.value).fill('0').map((_, i) => {
      return i === tokenOutIndex.value ? tokenOutAmount.value || '0' : '0';
    });
  });

  const fullAmountsScaled = computed((): string[] =>
    fullAmounts.value.map((amount, i) =>
      parseUnits(amount, withdrawalTokens.value[i].decimals).toString()
    )
  );

  /**
   * The full input amounts array minus slippage,
   * if the amount is not 0 or a single asset exact out case.
   */
  const amountsOut = computed(() => {
    return fullAmounts.value.map((amount, i) => {
      if (amount === '0' || exactOut.value) return amount;
      return minusSlippage(amount, withdrawalTokens.value[i].decimals);
    });
  });

  /**
   * The BPT value to be used for the withdrawal transaction without accounting for slippage.
   */
  const fullBPTIn = computed((): string => {
    if (isProportional.value)
      return parseUnits(propBptIn.value, poolDecimals.value).toString();
    if (!exactOut.value)
      return parseUnits(absMaxBpt.value, poolDecimals.value).toString(); // Single asset max withdrawal

    // Else single asset exact out amount case

    if (isStablePhantomPool.value) {
      if (shouldUseBatchRelayer.value) {
        return batchRelayerSwap.value?.outputs?.amountsIn || '0';
      }
      return batchSwap.value?.returnAmounts?.[0]?.toString() || '0';
    }

    return poolCalculator
      .bptInForExactTokenOut(tokenOutAmount.value, tokenOutIndex.value)
      .toString();
  });

  /**
   * The BPT value to be used for the withdrawal transaction accounting for slippage.
   * Only in the single asset exact out case should the BPT value be adjusted to account for slippage.
   */
  const bptIn = computed((): string => {
    if (exactOut.value) return addSlippageScaled(fullBPTIn.value);
    return fullBPTIn.value.toString();
  });

  const normalizedBPTIn = computed((): string =>
    formatUnits(bptIn.value, poolDecimals.value)
  );

  const hasAmounts = computed(() =>
    fullAmounts.value.some(amount => bnum(amount).gt(0))
  );

  const singleAssetMaxes = computed((): string[] => {
    if (isStablePhantomPool.value) return batchSwapSingleAssetMaxes.value;

    try {
      return poolTokens.value.map((token, tokenIndex) => {
        return formatUnits(
          poolCalculator
            .exactBPTInForTokenOut(bptBalanceScaled.value, tokenIndex)
            .toString(),
          token.decimals
        );
      });
    } catch (error) {
      if ((error as Error).message.includes('MIN_BPT_IN_FOR_TOKEN_OUT')) {
        setError(WithdrawalError.SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT);
        return poolTokens.value.map((token, tokenIndex) => {
          return formatUnits(
            poolCalculator
              .exactBPTInForTokenOut(
                parseUnits(absMaxBpt.value, poolDecimals.value).toString(),
                tokenIndex
              )
              .toString(),
            token.decimals
          );
        });
      }
      return [];
    }
  });

  // Checks if the single asset withdrawal is maxed out.
  const singleAssetMaxed = computed(() => {
    return (
      singleAssetMaxes.value[tokenOutIndex.value] ===
      fullAmounts.value[tokenOutIndex.value]
    );
  });

  /**
   * Checks if exactOut case, where the user is requesting
   * a single asset withdrawal that is not maxed out.
   */
  const exactOut = computed(() => {
    return !isProportional.value && !singleAssetMaxed.value;
  });

  /**
   * Checks that the state of the form is a single asset withdrawal
   * and if the single asset is maxed out.
   */
  const singleAssetMaxOut = computed(
    () => !isProportional.value && singleAssetMaxed.value
  );

  const priceImpact = computed((): number => {
    if (amountExceedsPoolBalance.value) return 1;
    if (!hasAmounts.value || isProportional.value) return 0;

    return poolCalculator
      .priceImpact(fullAmounts.value, {
        exactOut: exactOut.value,
        tokenIndex: tokenOutIndex.value,
        queryBPT: fullBPTIn.value
      })

      .toNumber();
  });

  const highPriceImpact = computed(() =>
    bnum(priceImpact.value).isGreaterThanOrEqualTo(0.01)
  );

  const fiatAmounts = computed((): string[] =>
    fullAmounts.value.map((amount, i) =>
      toFiat(amount, withdrawalTokens.value[i].address)
    )
  );

  const fiatTotal = computed((): string =>
    fiatAmounts.value.reduce(
      (total, amount) =>
        bnum(total)
          .plus(amount)
          .toString(),
      '0'
    )
  );

  const fiatTotalLabel = computed((): string =>
    fNum2(fiatTotal.value, FNumFormats.fiat)
  );

  const shouldFetchBatchSwap = computed(
    (): boolean =>
      pool.value &&
      isStablePhantomPool.value &&
      bnum(normalizedBPTIn.value).gt(0)
  );

  const shouldUseBatchRelayer = computed((): boolean => {
    if (!isStablePhantomPool.value || !pool.value.onchain.linearPools)
      return false;

    // If batchSwap has any 0 return amounts, we should use batch relayer
    if (batchSwap.value) {
      const returnAmounts = batchSwap.value.returnAmounts;
      return hasBpt.value && returnAmounts.some(amount => bnum(amount).eq(0));
    }

    return false;
  });

  // Token amounts out to pass in to batch swap transaction and used as limits.
  const batchSwapAmountsOutMap = computed(
    (): Record<string, string> => {
      const allTokensWithAmounts = fullAmountsScaled.value.map((amount, i) => [
        tokenAddresses.value[i].toLowerCase(),
        amount
      ]);
      const onlyTokensWithAmounts = allTokensWithAmounts
        .filter(([, amount]) => bnum(amount).gt(0))
        .map(([token, amount]) => {
          return [
            token,
            exactOut.value ? amount : minusSlippageScaled(amount.toString())
          ];
        });
      return Object.fromEntries(onlyTokensWithAmounts);
    }
  );

  // An array of BPT values to be passed into the batch swap tx
  const batchSwapBPTIn = computed((): string[] => {
    if (singleAssetMaxOut.value) return [bptBalanceScaled.value];
    if (exactOut.value) {
      return batchSwap.value ? batchSwap.value.returnAmounts : [];
    }

    const poolTokenSum = bnSum(proportionalPoolTokenAmounts.value).toString();

    const fractionalBPTIn = proportionalPoolTokenAmounts.value
      .map(poolTokenAmount => {
        const fraction = bnum(poolTokenAmount).div(poolTokenSum);
        return fraction
          .times(normalizedBPTIn.value)
          .toFixed(poolDecimals.value, OldBigNumber.ROUND_DOWN);
      })
      .filter(BPT => bnum(BPT).gt(0));

    return fractionalBPTIn.map(bptFraction =>
      parseUnits(bptFraction, poolDecimals.value).toString()
    );
  });

  const batchSwapTokensOut = computed((): string[] => {
    if (singleAssetMaxOut.value) return [tokenOut.value];
    return tokenAddresses.value.map(address => address.toLowerCase());
  });

  const batchSwapKind = computed(
    (): SwapKind => (exactOut.value ? SwapKind.GivenOut : SwapKind.GivenIn)
  );

  const batchRelayerTokenOut = computed(
    (): string => pool.value?.wrappedTokens?.[tokenOutIndex.value] || ''
  );

  const loadingAmountsOut = computed(
    (): boolean => batchSwapLoading.value || batchRelayerSwapLoading.value
  );

  /**
   * METHODS
   */
  async function initMath(): Promise<void> {
    propBptIn.value = bptBalance.value;

    if (shouldFetchBatchSwap.value) {
      batchSwap.value = await getBatchSwap();
      if (shouldUseBatchRelayer.value) {
        batchRelayerSwap.value = await getBatchRelayerSwap();
      }
    }
  }

  function resetMath(): void {
    initMath();
    tokenOutAmount.value = '';
  }

  /**
   * Returns wrappedToken price rate for conversion to stable.
   * @param wrappedToken the wrapped linear pool token address.
   */
  function scaledWrappedTokenRateFor(wrappedToken: string): string {
    if (!pool.value.onchain.linearPools) return '0';

    const normalPriceRate =
      Object.values(pool.value.onchain.linearPools).find(
        linearPool => linearPool.wrappedToken.address === wrappedToken
      )?.wrappedToken?.priceRate || '0';

    return parseUnits(normalPriceRate, 18).toString();
  }

  /**
   * Given either BPT in or the exact tokens out, fetches batch swap
   * required, where return amounts are the opposite of amounts.
   * @param amounts either BPT in amounts or exact out amounts
   * @param tokensOut tokens to recieve
   * @param swapType defaults to exact in
   */
  async function getBatchSwap(
    amounts: string[] | null = null,
    tokensOut: string[] | null = null,
    swapType: SwapType = SwapType.SwapExactIn
  ): Promise<BatchSwapOut> {
    batchSwapLoading.value = true;

    amounts = amounts || batchSwapBPTIn.value;
    const tokensIn = amounts.map(() => pool.value.address);
    const fetchPools = !batchSwap.value; // Only needs to be fetched on first call

    try {
      const result = await balancer.swaps.queryBatchSwapWithSor({
        tokensIn: tokensIn,
        tokensOut: tokensOut || batchSwapTokensOut.value,
        swapType,
        amounts,
        fetchPools: {
          fetchPools,
          fetchOnChain: false
        }
      });
      batchSwapLoading.value = false;
      return result;
    } catch (error) {
      if (
        error instanceof BalancerError &&
        (error as BalancerError)?.code ===
          BalancerErrorCode.SWAP_ZERO_RETURN_AMOUNT
      ) {
        // The batch swap can fail if amounts are greater than supported by pool balances
        // in this case we can return 0 amounts which will lead to an attempt via getBatchRelayerSwap()
        batchSwapLoading.value = false;
        return {
          returnAmounts: Array(amounts.length).fill('0'),
          swaps: [],
          assets: []
        };
      } else {
        throw error;
      }
    }
  }

  /**
   * Given either BPT in or the exact wrapped tokens out to convert to stables,
   * fetches batch swap using the relayer required, where return amounts are the
   * opposite of amounts.
   * @param amounts either BPT in amounts or exact out amounts
   * @param tokensOut wrapped tokens to convert to stables
   * @param swapType defaults to exact in
   */
  async function getBatchRelayerSwap(
    amounts: string[] | null = null,
    tokensOut: string[] | null = null,
    exactOut = false
  ): Promise<TransactionData> {
    batchRelayerSwapLoading.value = true;

    amounts = amounts || batchSwapBPTIn.value.map(amount => amount.toString());
    tokensOut = tokensOut || pool.value.wrappedTokens || [];
    const fetchPools = !batchRelayerSwap.value; // Only needs to be fetched on first call

    const rates: string[] = [];
    tokensOut.forEach((tokenOut, i) => {
      rates[i] = scaledWrappedTokenRateFor(tokenOut);
    });

    // BatchRelayer can be used to swap from bpt>waToken then automatically unwrap to underlying.
    const result = await balancerContractsService.batchRelayer.stableExitStatic(
      account.value,
      pool.value.address,
      amounts,
      tokensOut,
      rates,
      slippageScaled.value,
      exactOut,
      fetchPools
    );

    batchRelayerSwapLoading.value = false;
    return result;
  }

  // Fetch single asset max out for current tokenOut using batch swaps.
  // Set max out returned from batchSwap in state.
  async function getSingleAssetMaxOut(): Promise<void> {
    const _batchSwap = await getBatchSwap(
      [bptBalanceScaled.value],
      [tokenOut.value]
    );

    const batchSwapAmountOut = bnum(
      _batchSwap.returnAmounts[0].toString()
    ).abs();

    if (batchSwapAmountOut.gt(0)) {
      const amountOut = formatUnits(
        batchSwapAmountOut.toString(),
        tokenOutDecimals.value
      );

      batchSwapSingleAssetMaxes.value[tokenOutIndex.value] = amountOut;
    } else {
      const _batchRelayerSwap = await getBatchRelayerSwap(
        [bptBalanceScaled.value.toString()],
        [batchRelayerTokenOut.value]
      );

      const batchRelayerAmountOut = bnum(
        _batchRelayerSwap.outputs?.amountsOut
          ? _batchRelayerSwap.outputs?.amountsOut[0].toString()
          : '0'
      ).abs();
      const amountOut = formatUnits(
        batchRelayerAmountOut.toString(),
        tokenOutDecimals.value
      );

      batchSwapSingleAssetMaxes.value[tokenOutIndex.value] = amountOut;
    }
  }

  /**
   * High level function that uses withdrawal state to
   * decide what swap should be fetched and sets it.
   */
  async function getSwap(): Promise<void> {
    if (!isStablePhantomPool.value) return;

    if (isProportional.value) {
      batchSwap.value = await getBatchSwap();
      if (shouldUseBatchRelayer.value) {
        batchRelayerSwap.value = await getBatchRelayerSwap();
      }
    } else if (exactOut.value) {
      const amountsOut = fullAmountsScaled.value.filter(amount =>
        bnum(amount).gt(0)
      );
      batchSwap.value = await getBatchSwap(
        amountsOut,
        [tokenOut.value],
        SwapType.SwapExactOut
      );

      if (shouldUseBatchRelayer.value) {
        batchRelayerSwap.value = await getBatchRelayerSwap(
          amountsOut.map(amount => amount.toString()),
          [batchRelayerTokenOut.value],
          true
        );
      }
    } else {
      // Single asset max out case
      batchSwap.value = await getBatchSwap(
        [bptBalanceScaled.value],
        [tokenOut.value]
      );

      if (shouldUseBatchRelayer.value) {
        batchRelayerSwap.value = await getBatchRelayerSwap(
          [bptBalanceScaled.value.toString()],
          [batchRelayerTokenOut.value]
        );
      }
    }
  }

  /**
   * WATCHERS
   */
  watch(tokenOut, () => {
    tokenOutAmount.value = '';
    if (isStablePhantomPool.value) getSingleAssetMaxOut();
  });

  watch(isWalletReady, async () => {
    await forChange(dynamicDataLoading, false);
    initMath();
  });

  watch(account, () => initMath());

  watch(fullAmounts, async () => {
    /**
     * If a single asset exit and the input values change we
     * need to refetch the swap to get the required BPT in.
     */
    if (!isProportional.value) {
      swapPromises.value.push(getSwap);
      if (!processingSwaps.value) processSwaps();
    }
  });

  return {
    // computed
    hasAmounts,
    fullAmounts,
    amountsOut,
    fiatAmounts,
    tokenOutAmount,
    propBptIn,
    bptIn,
    bptBalance,
    hasBpt,
    fiatTotalLabel,
    priceImpact,
    highPriceImpact,
    proportionalAmounts,
    proportionalPoolTokenAmounts,
    singleAssetMaxes,
    exactOut,
    singleAssetMaxOut,
    tokenOutPoolBalance,
    shouldFetchBatchSwap,
    batchSwap,
    batchSwapAmountsOutMap,
    batchSwapKind,
    shouldUseBatchRelayer,
    batchRelayerSwap,
    loadingAmountsOut,
    // methods
    initMath,
    resetMath,
    getSwap
  };
}
