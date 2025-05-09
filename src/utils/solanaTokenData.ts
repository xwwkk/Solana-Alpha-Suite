import { Token } from '../constants/tokens';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const TIMEOUT = 10000; // 10 seconds
const MAX_STORED_TOKENS = 1000; // 最多存储1000个代币

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchSolanaTokens = async (): Promise<Token[]> => {
    console.log('Starting to fetch Solana tokens...');
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            console.log(`Attempt ${retries + 1} of ${MAX_RETRIES}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

            console.log('Fetching from Jupiter API...');
            // 使用 Jupiter API 获取代币列表
            const response = await fetch('https://token.jup.ag/all', {
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received data length:', data?.length || 0);

            if (!Array.isArray(data)) {
                console.error('Invalid response format:', data);
                throw new Error('Invalid response format');
            }

            // 优先选择有 logo 的代币
            const tokensWithLogo = data.filter((token: any) => token.logoURI);
            const tokensWithoutLogo = data.filter((token: any) => !token.logoURI);

            // 合并并限制数量
            const selectedTokens = [
                ...tokensWithLogo.slice(0, MAX_STORED_TOKENS),
                ...tokensWithoutLogo.slice(0, MAX_STORED_TOKENS - tokensWithLogo.length)
            ];

            const formattedTokens = selectedTokens
                .map((token: any) => ({
                    symbol: token.symbol,
                    name: token.name,
                    address: token.address,
                    logo: token.logoURI,
                    decimals: token.decimals,
                    // Jupiter API 不提供这些数据，所以设为 0
                    price: 0,
                    marketCap: 0,
                    volume24h: 0
                }));

            console.log('Formatted tokens count:', formattedTokens.length);

            try {
                // 存储到本地
                localStorage.setItem('solanaTokens', JSON.stringify(formattedTokens));
                localStorage.setItem('solanaTokensTimestamp', Date.now().toString());
                console.log('Successfully stored tokens in localStorage');
            } catch (storageError) {
                console.warn('Failed to store tokens in localStorage:', storageError);
                // 如果存储失败，我们仍然返回获取到的数据
                // 这样至少当前会话可以使用这些数据
            }

            return formattedTokens;
        } catch (error) {
            console.error(`Attempt ${retries + 1} failed:`, error);
            retries++;

            if (retries === MAX_RETRIES) {
                console.error('All retry attempts failed');
                return [];
            }

            console.log(`Waiting ${RETRY_DELAY * retries}ms before next retry...`);
            await sleep(RETRY_DELAY * retries);
        }
    }

    return [];
};

export const getStoredSolanaTokens = (): Token[] | null => {
    console.log('Getting stored Solana tokens from localStorage');
    const cachedTokens = localStorage.getItem('solanaTokens');
    if (cachedTokens) {
        const tokens = JSON.parse(cachedTokens);
        console.log('Found cached tokens:', tokens.length);
        // 如果缓存的数据为空数组，返回 null 以触发重新获取
        if (tokens.length === 0) {
            console.log('Cached data is empty, will trigger refresh');
            return null;
        }
        return tokens;
    }
    console.log('No cached tokens found');
    return null;
};

export const isSolanaTokenDataStale = (): boolean => {
    const cachedTimestamp = localStorage.getItem('solanaTokensTimestamp');
    if (!cachedTimestamp) {
        console.log('No cache timestamp found');
        return true;
    }

    const now = Date.now();
    const cacheAge = now - parseInt(cachedTimestamp);
    const isStale = cacheAge > 24 * 60 * 60 * 1000; // 24小时过期
    console.log('Cache age:', Math.floor(cacheAge / (60 * 60 * 1000)), 'hours');
    console.log('Is cache stale:', isStale);
    return isStale;
};

export const updateSolanaTokenData = async (): Promise<Token[]> => {
    console.log('Updating Solana token data...');
    const cachedTokens = getStoredSolanaTokens();
    if (isSolanaTokenDataStale() || !cachedTokens) {
        console.log('Cache is stale or empty, fetching new data');
        return await fetchSolanaTokens();
    }
    console.log('Using cached data');
    return cachedTokens;
}; 