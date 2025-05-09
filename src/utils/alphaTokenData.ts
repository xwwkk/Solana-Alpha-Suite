import { Token } from '../constants/tokens';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const TIMEOUT = 10000; // 10 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchAndStoreTokens = async (): Promise<Token[]> => {
    console.log('Fetching new token data...');
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

            // Fetch multiple pages from CoinGecko
            const pages = [1, 2, 3]; // Fetch first 3 pages
            const coingeckoResponses = await Promise.all(
                pages.map(page =>
                    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=binance-alpha-spotlight&order=market_cap_desc&per_page=100&page=${page}&sparkline=false&locale=en&price_change_percentage=24h`, {
                        headers: {
                            'Accept': 'application/json',
                        },
                        signal: controller.signal
                    })
                )
            );

            clearTimeout(timeoutId);

            // Check if any response failed
            for (const response of coingeckoResponses) {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            // Combine all pages of data
            const allData = await Promise.all(coingeckoResponses.map(res => res.json()));
            const data = allData.flat();
            console.log('Received new data:', data.length, 'tokens');

            if (!Array.isArray(data)) {
                throw new Error('Invalid response format');
            }

            // return the token data
            const resultTokens: Token[] = data.map(token => ({
                address: token.id,
                symbol: token.symbol.toUpperCase(),
                name: token.name,
                decimals: 18, // Default decimals for most tokens
                logo: token.image,
                price: token.current_price,
                marketCap: token.market_cap,
                volume24h: token.total_volume
            }));

            localStorage.setItem('alphaTokens', JSON.stringify(resultTokens));
            localStorage.setItem('alphaTokensTimestamp', Date.now().toString());
            console.log('Successfully stored tokens in localStorage');

            return resultTokens;

        } catch (error) {
            console.error(`Attempt ${retries + 1} failed:`, error);
            retries++;

            if (retries === MAX_RETRIES) {
                console.error('All retry attempts failed');
                return [];
            }

            await sleep(RETRY_DELAY * retries);
        }
    }

    return [];
};

export const getStoredTokens = (): Token[] => {
    const cachedTokens = localStorage.getItem('tokens');
    console.log('Getting stored tokens from localStorage');
    if (cachedTokens) {
        return JSON.parse(cachedTokens);
    }
    return [];
};

export const isTokenDataStale = (): boolean => {
    const cachedTimestamp = localStorage.getItem('tokensTimestamp');
    if (!cachedTimestamp) {
        console.log('No timestamp found, data is stale');
        return true;
    }

    const now = Date.now();
    const cacheAge = now - parseInt(cachedTimestamp);
    const isStale = cacheAge > 24 * 60 * 60 * 1000; // 24小时过期
    console.log('Cache age:', Math.floor(cacheAge / 1000 / 60), 'minutes, isStale:', isStale);
    return isStale;
};

export const updateTokenData = async (forceRefresh: boolean = false): Promise<Token[]> => {
    console.log('Checking if token data needs update...');
    if (forceRefresh || isTokenDataStale()) {
        console.log('Fetching new data...');
        return await fetchAndStoreTokens();
    }
    console.log('Using cached data');
    return getStoredTokens();
};

// 检查token是否存在
export async function checkToken(address: string): Promise<boolean> {
    try {
        const response = await fetch(`https://lite-api.jup.ag/tokens/v1/token/${address}`);
        return response.ok; // 直接返回请求是否成功
    } catch (error) {
        console.error('Error fetching token info:', error);
        return false;
    }
};