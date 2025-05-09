export interface Token {
    symbol: string;
    name: string;
    address: string;
    logo: string;
    decimals: number;
    price: number;
    marketCap: number;
    volume24h: number;
}

export const COMMON_TOKENS: Token[] = [
    {
        symbol: 'SOL',
        name: 'Solana',
        address: 'So11111111111111111111111111111111111111112',
        logo: '/solana-sol-logo.png',
        decimals: 9,
        price: 0,
        marketCap: 0,
        volume24h: 0
    },
    {
        symbol: 'USDC',
        name: 'USD Coin',
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        logo: '/usdc-logo.png',
        decimals: 6,
        price: 0,
        marketCap: 0,
        volume24h: 0
    }
];

export const Alpha_Tokens: Token[] = [
    {
        symbol: 'POPCAT',
        name: 'Popcat',
        address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
        logo: 'https://bafkreidvkvuzyslw5jh5z242lgzwzhbi2kxxnpkic5wsvyno5ikvpr7reu.ipfs.nftstorage.link',
        decimals: 9,
        price: 0,
        marketCap: 0,
        volume24h: 0
    },
    {
        symbol: 'KMNO',
        name: 'Kamino',
        address: '3LDjnhekVVqdxDmhD5vLHg5LfhxfW9naVyG9NfZqs7DT',
        logo: 'https://coin-images.coingecko.com/coins/images/35801/large/tP0Lcgwp_400x400.jpg?1709824189',
        decimals: 9,
        price: 0.071029,
        marketCap: 45073115,
        volume24h: 0
    }
];