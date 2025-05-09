# Solana Alpha Suite

A modern React application built with Vite that provides comprehensive Solana blockchain functionality and trading tools.

## 🚀 Features

- Built with React 19 and Vite 6
- Solana blockchain integration
- TypeScript support
- Modern development tooling
- ESLint configuration
- Jupiter DEX integration
- SPL Token support
- Advanced trading features

## 📦 Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm (Package manager)
- Solana CLI tools (for development)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd solana-alpha-suite
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory and add your configuration:
```env
VITE_PROJECT_ID=your_project_id
```

## 🏃‍♂️ Development

To start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Building for Production

To create a production build:

```bash
pnpm build
```

To preview the production build:

```bash
pnpm preview
```

## 🧪 Testing

Run the linter:

```bash
pnpm lint
```

## 📚 Dependencies

### Core Dependencies
- `@reown/appkit`: Reown AppKit for blockchain integration
- `@reown/appkit-adapter-solana`: Solana adapter for Reown AppKit
- `@solana/web3.js`: Solana web3 library
- `@solana/spl-token`: SPL Token library
- `@jup-ag/api`: Jupiter DEX integration
- `react`: React 19
- `lucide-react`: Icon library

### Development Dependencies
- `typescript`: TypeScript support
- `vite`: Build tool and development server
- `eslint`: Code linting
- Various TypeScript and React type definitions

## 📁 Project Structure

```
src/
├── assets/        # Static assets
├── components/    # React components
├── config/        # Configuration files
├── constants/     # Constants and enums
├── utils/         # Utility functions
├── App.tsx        # Main application component
├── App.css        # Main styles
└── main.tsx       # Application entry point
```

## 🔧 Configuration

The project uses several configuration files:
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite configuration
- `eslint.config.js`: ESLint configuration

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

MIT License

Copyright (c) 2024 Solana Alpha Suite

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


