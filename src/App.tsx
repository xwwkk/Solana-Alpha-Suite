import { createAppKit } from '@reown/appkit/react'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { useState } from 'react'
import { metadata, projectId, solanaWeb3JsAdapter } from './config'
import { Globe, TestTube, Wrench, Sun, Moon, Settings } from 'lucide-react'
import { TokenSwap } from './components/TokenSwap'
import './App.css'

// Create modal
createAppKit({
  projectId,
  metadata,
  themeMode: 'light',
  networks: [solana, solanaTestnet, solanaDevnet],
  adapters: [solanaWeb3JsAdapter],
  features: {
    analytics: true
  },
  themeVariables: {
    '--w3m-accent': '#000000'
  }
})

export function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <img src="/Mbn.png" alt="Mbn" style={{ width: '40px', height: '40px' }} />
        </div>
        <div className="header-right">
          <button className="icon-button">
            <Settings size={20} />
          </button>
          <div className="network-icon">
            <img src="solana-sol-logo.png" alt="Solana" />
          </div>
          <appkit-button />
        </div>
      </header>

      <main className="app-main">
        <h2>Solana Alpha Suite</h2>
        <p>Track Solana Swaps for Zero Slippage Execution</p>
        <TokenSwap />
      </main>
    </div>
  )
}

export default App
