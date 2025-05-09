import { useState, useEffect, useRef } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { PublicKey, LAMPORTS_PER_SOL, VersionedTransaction, Transaction, SystemProgram } from "@solana/web3.js";
import { ChevronDown, Wallet, Info, Search, Zap, Coins, Waves, ArrowRightLeft, RefreshCw } from 'lucide-react';
import { QuoteResponse } from '@jup-ag/api';
import { Token, COMMON_TOKENS, Alpha_Tokens } from '../constants/tokens';
import { updateTokenData, getStoredTokens } from '../utils/tokenData';
import { updateSolanaTokenData } from '../utils/solanaTokenData';
import './TokenSwap.css';
import type { Provider } from '@reown/appkit-adapter-solana/react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

interface DEX {
  name: string;
  id: string;
}

interface DeadlineInfo {
  token: Token;
  deadline: Date;
  isActive: boolean;
}

const DEX_OPTIONS: DEX[] = [
  { name: 'Jupiter', id: 'jupiter' },
  { name: 'Raydium', id: 'raydium' },
  { name: 'Orca', id: 'orca' },
];

export const TokenSwap = () => {
  const ITEMS_PER_PAGE = 20;
  const [tokens, setTokens] = useState<Token[]>([]);
  const [solanaTokens, setSolanaTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [displayedTokens, setDisplayedTokens] = useState<Token[]>([]);
  const [AlphaToken, setAlphaToken] = useState<Token | null>(null);
  const [backToken, setbackToken] = useState<Token | null>(null);
  const [selectedDex, setSelectedDex] = useState<DEX>(DEX_OPTIONS[0]);
  const [amount, setAmount] = useState<string>('');
  const [jitoTip, setJitoTip] = useState<number>(0.00003);
  const { address, isConnected } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  const [estimatedOutput, setEstimatedOutput] = useState<string>('0');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenList, setShowTokenList] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deadlineInfo, setDeadlineInfo] = useState<DeadlineInfo[]>([
    {
      token: Alpha_Tokens[0],
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      isActive: true
    },
    {
      token: Alpha_Tokens[1],
      deadline: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
      isActive: false
    }
  ]);

  // 使用工具函数获取代币数据
  useEffect(() => {
    const loadTokens = async () => {
      try {
        // 使用 updateTokenData 获取最新数据（如果本地数据过期会自动更新）
        const tokenData = await updateTokenData();
        setTokens(tokenData);
        setFilteredTokens(tokenData);
        setDisplayedTokens(tokenData);

        // 设置alpha代币
        if (!AlphaToken && tokenData.length > 0) {
          setAlphaToken(tokenData[0]);
        }
        
        // 获取 Solana 代币数据并设置 backToken
        const solanaTokenData = await updateSolanaTokenData();
        setSolanaTokens(solanaTokenData);
        if (!backToken && solanaTokenData.length > 0) {
          setbackToken(solanaTokenData[0]);
        }
      } catch (error) {
        console.error('Error loading tokens:', error);
      }
    };

    loadTokens();
  }, []);

  // Filter tokens based on search query and which selector is active
  useEffect(() => {
    if (!searchQuery) {
      const tokensToShow = showTokenList === 'from' ? tokens : solanaTokens;
      setFilteredTokens(tokensToShow);
      setDisplayedTokens(tokensToShow);
      setPage(1);
      setHasMore(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const tokensToFilter = showTokenList === 'from' ? tokens : solanaTokens;
    
    // 使用本地数据进行搜索
    const filtered = tokensToFilter.filter(token => 
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    );
    
    setFilteredTokens(filtered);
    setDisplayedTokens(filtered);
    setPage(1);
    setHasMore(false);
  }, [searchQuery, tokens, solanaTokens, showTokenList]);

  // Focus search input when token list is shown
  useEffect(() => {
    if (showTokenList && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showTokenList]);

  const handleTokenSelect = (token: Token, isFrom: boolean) => {
    if (isFrom) {
      setAlphaToken(token);
    } else {
      setbackToken(token);
    }
    setShowTokenList(null);
    setSearchQuery('');
  };

  const handleDexSelect = (dex: DEX) => {
    setSelectedDex(dex);
  };

  const getQuote = async () => {
    if (!amount || parseFloat(amount) <= 0 || !AlphaToken || !backToken) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${AlphaToken.address}&outputMint=${backToken.address}&amount=${parseFloat(amount) * Math.pow(10, AlphaToken.decimals)}&slippageBps=50`
      );
      const data = await response.json();
      setQuote(data);
      setEstimatedOutput((data.outAmount / Math.pow(10, backToken.decimals)).toFixed(4));
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeApprove = async () => {
    if (!address || !AlphaToken || !connection || !walletProvider) return;
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual contract address
      const contractAddress = new PublicKey('YOUR_CONTRACT_ADDRESS_HERE');
      const tokenMint = new PublicKey(AlphaToken.address);
      const userPublicKey = new PublicKey(address);

      // Create approve instruction
      const approveInstruction = {
        programId: TOKEN_PROGRAM_ID,
        keys: [
          { pubkey: userPublicKey, isSigner: true, isWritable: true }, // owner
          { pubkey: tokenMint, isSigner: false, isWritable: true }, // token account
          { pubkey: contractAddress, isSigner: false, isWritable: false }, // spender
        ],
        data: Buffer.from([8, ...new Uint8Array(8).fill(255)]) // approve instruction with max amount
      };

      // Create and sign transaction
      const transaction = new Transaction().add(approveInstruction);
      const signature = await walletProvider.sendTransaction(transaction, connection);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      // Show success message
      alert('Token approval completed successfully!');
      
    } catch (error) {
      console.error('Error executing approval:', error);
      alert('Failed to execute approval: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (amount && parseFloat(amount) > 0 && AlphaToken && backToken) {
      getQuote();
    }
  }, [amount, AlphaToken, backToken]);

  const calculateEstimatedFees = () => {
    return {
      slippage: quote?.otherAmountThreshold ? `${(Number(quote.otherAmountThreshold) / LAMPORTS_PER_SOL).toFixed(5)}` : '0.00000',
      serviceFee: '0.01',
      jitoTip: jitoTip.toFixed(5),
      estimatedOutput: estimatedOutput
    };
  };

  const fees = calculateEstimatedFees();

  const loadMoreTokens = () => {
    const nextPage = page + 1;
    const start = 0;
    const end = nextPage * ITEMS_PER_PAGE;
    const newTokens = filteredTokens.slice(start, end);
    setDisplayedTokens(newTokens);
    setPage(nextPage);
    setHasMore(end < filteredTokens.length);
  };

  // Add useEffect for updating active status
  useEffect(() => {
    const interval = setInterval(() => {
      setDeadlineInfo(prev => prev.map(info => ({
        ...info,
        isActive: new Date() < info.deadline
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const tokenData = await updateTokenData(true);
      setTokens(tokenData);
      setFilteredTokens(tokenData);
      setDisplayedTokens(tokenData);
    } catch (error) {
      console.error('Error refreshing tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="token-swap-container">
      {/* Token Selection Row */}
      <div className="token-selection-row">
        {/* ALpha Token Selection */}
        <div className="swap-section">
          <div className="token-select" onClick={() => setShowTokenList('from')}>
            <div className="token-info">
              <img src={AlphaToken?.logo || '/solana-sol-logo.png'} alt={AlphaToken?.symbol} className="token-logo" />
              <span>{AlphaToken?.symbol || 'Select Token'}</span>
            </div>
            <div className="token-actions">
              <button 
                className="refresh-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                title="Refresh token data"
              >
                <RefreshCw size={16} className={isLoading ? 'rotating' : ''} />
              </button>
              <ChevronDown size={20} />
            </div>
          </div>
        </div>

        <div className="swap-icon-container">
          <ArrowRightLeft size={24} />
        </div>

        {/* To Token Selection */}
        <div className="swap-section">
          <div className="token-select" onClick={() => setShowTokenList('to')}>
            <div className="token-info">
              <img src={backToken?.logo || '/solana-sol-logo.png'} alt={backToken?.symbol} className="token-logo" />
              <span>{backToken?.symbol || 'Select Token'}</span>
            </div>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {/* Token Selection Modal */}
      {showTokenList && (
        <>
          <div className="modal-overlay" onClick={() => {
            setShowTokenList(null);
            setSearchQuery('');
            setPage(1);
          }} />
          <div className="token-list-modal">
            <div className="token-list-header">
              <h3>Select Token</h3>
              <button onClick={() => {
                setShowTokenList(null);
                setSearchQuery('');
                setPage(1);
              }}>×</button>
            </div>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name or paste address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="token-list">
              {displayedTokens.map((token) => (
                <div
                  key={token.address}
                  className="token-item"
                  onClick={() => handleTokenSelect(token, showTokenList === 'from')}
                >
                  <img src={token.logo || '/solana-sol-logo.png'} alt={token.symbol} className="token-logo" />
                  <div className="token-details">
                    <span className="token-symbol">{token.symbol}</span>
                    <span className="token-name">{token.name}</span>
                  </div>
                </div>
              ))}
              {hasMore && (
                <button className="load-more-button" onClick={loadMoreTokens}>
                  Load More
                </button>
              )}
              {displayedTokens.length === 0 && (
                <div className="no-tokens-found">
                  No tokens found
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* DEX Selection */}
      <div className="dex-select">
        {DEX_OPTIONS.map((dex) => (
          <button
            key={dex.id}
            className={`dex-button${selectedDex.id === dex.id ? ' active' : ''}`}
            onClick={() => handleDexSelect(dex)}
            type="button"
          >
            <img 
              src={`/dex-icons/${dex.id}.png`} 
              alt={`${dex.name} icon`} 
              className="dex-icon"
            />
            <span>{dex.name}</span>
          </button>
        ))}
      </div>

      {/* Jito MEV Tip Selection */}
      <div className="jito-tip-section">
        <div className="jito-tip-header">
          <span>Jito MEV 小费</span>
          <div className="tooltip">
            <Info size={16} />
            <span className="tooltip-text">增加小费可以提高交易被优先处理的机会</span>
          </div>
        </div>
        <div className="jito-tip-presets">
          <button onClick={() => setJitoTip(0.00003)} className={jitoTip === 0.00003 ? 'active' : ''}>默认 (0.00003 SOL)</button>
          <button onClick={() => setJitoTip(0.0001)} className={jitoTip === 0.0001 ? 'active' : ''}>高速 (0.0001 SOL)</button>
          <button onClick={() => setJitoTip(0.0003)} className={jitoTip === 0.0003 ? 'active' : ''}>极速 (0.0003 SOL)</button>
        </div>
      </div>

      {/* Estimated Fees and Output */}
      <div className="fees-section">
        <div className="fee-box">
          <div className="fee-label">
            <img src="/solana-sol-logo.png" alt="Solana" className="fee-icon" />
            预估 Gas 费消耗
          </div>
          <div className="fee-value">{fees.slippage}</div>
        </div>
        <div className="fee-box">
          <div className="fee-label">
            <img src="/solana-sol-logo.png" alt="Solana" className="fee-icon" />
            流动池费用
          </div>
          <div className="fee-value">{fees.serviceFee} %</div>
        </div>
        <div className="fee-box">
          <div className="fee-label">
            <img src="/solana-sol-logo.png" alt="Solana" className="fee-icon" />
            Jito MEV 小费
          </div>
          <div className="fee-value">{fees.jitoTip} SOL</div>
        </div>
      </div>

      <button 
        className="approve-button" 
        onClick={executeApprove}
        disabled={!isConnected || !amount || isLoading || !AlphaToken || !backToken}
      >
        {isLoading ? 'Loading...' : 'Approve'}
      </button>

      {/* Deadline Table */}
      <div className="deadline-table-container">
        <h3>Token Deadlines</h3>
        <table className="deadline-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Symbol</th>
              <th>Deadline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {deadlineInfo.map((info, index) => (
              <tr key={index}>
                <td>
                  <div className="token-cell">
                    <img src={info.token.logo || '/solana-sol-logo.png'} alt={info.token.symbol} className="token-logo-small" />
                    <span>{info.token.name}</span>
                  </div>
                </td>
                <td>{info.token.symbol}</td>
                <td>{info.deadline.toLocaleString()}</td>
                <td>
                  <div className="status-indicator">
                    {info.isActive ? (
                      <>
                        <span className="active-dot"></span>
                        Active
                      </>
                    ) : (
                      <>
                        <span className="expired-dot"></span>
                        Expired
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};