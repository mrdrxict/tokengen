# TokenForge - Web3 Token Generator SaaS

A comprehensive Web3 token generator platform that allows users to create professional-grade ERC-20 tokens with advanced features across multiple blockchain networks.

## 🚀 Features

### Frontend (Next.js + Tailwind CSS)
- **Modern Landing Page**: Professional design with hero section and feature highlights
- **Multi-Step Token Builder**: Intuitive wizard interface for token configuration
- **Multi-Chain Support**: Deploy on Ethereum, BSC, Polygon, Arbitrum, and Fantom
- **Advanced Token Features**:
  - Burnable tokens
  - Mintable tokens with max supply limits
  - Transfer fees with custom percentages
  - Holder redistribution (reflective tokens)
- **Comprehensive Vesting System**: Configure token allocation for different categories:
  - Team allocation
  - Marketing and advertising
  - Public and private sales
  - Ecosystem development
- **Wallet Integration**: MetaMask connection with network switching
- **Real-time Gas Estimation**: Cost calculation before deployment
- **Responsive Design**: Mobile-friendly interface

### Backend (Smart Contracts + API)
- **Audited Smart Contracts**: Built with OpenZeppelin standards
- **Factory Pattern**: Dynamic token creation with customizable features
- **Vesting Contracts**: Automated token locking and gradual release
- **Security Features**: Reentrancy protection, access controls, fee limits
- **Multi-Network Deployment**: Hardhat configuration for all supported chains
- **Contract Verification**: Automatic verification on block explorers
- **Database Integration**: Supabase for deployment tracking and user data

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Radix UI
- **Smart Contracts**: Solidity 0.8.19, OpenZeppelin, Hardhat
- **Blockchain Integration**: Ethers.js v6, MetaMask
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (frontend), Multi-chain (contracts)

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/tokenforge.git
   cd tokenforge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your configuration values:
   - Supabase URL and keys
   - RPC endpoints for each network
   - Block explorer API keys
   - Private key for contract deployment

4. **Set up Supabase database**:
   Create the following table in your Supabase project:
   ```sql
   CREATE TABLE deployments (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_address TEXT NOT NULL,
     token_name TEXT NOT NULL,
     token_symbol TEXT NOT NULL,
     network TEXT NOT NULL,
     contract_address TEXT NOT NULL,
     transaction_hash TEXT NOT NULL,
     gas_used INTEGER DEFAULT 0,
     deployment_cost TEXT DEFAULT '0',
     status TEXT DEFAULT 'pending',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Compile smart contracts**:
   ```bash
   npm run compile
   ```

6. **Deploy factory contracts** (optional, for production):
   ```bash
   # Deploy to all networks
   npm run deploy:ethereum
   npm run deploy:bsc
   npm run deploy:polygon
   npm run deploy:arbitrum
   npm run deploy:fantom
   ```

7. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Network Configuration
Update `src/lib/web3.ts` with your RPC endpoints and explorer URLs.

### Factory Addresses
After deploying factory contracts, update the addresses in `src/lib/deployment.ts`.

### Database Schema
The application uses Supabase for storing deployment records. Ensure your database has the required tables set up.

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Smart Contract Deployment
1. Configure network settings in `hardhat.config.js`
2. Set up your private key and RPC URLs
3. Deploy using Hardhat scripts:
   ```bash
   npx hardhat run scripts/deploy.js --network <network-name>
   ```

## 🔐 Security Features

- **OpenZeppelin Standards**: All contracts use battle-tested OpenZeppelin libraries
- **Reentrancy Protection**: Guards against reentrancy attacks
- **Access Controls**: Owner-only functions with proper validation
- **Fee Limits**: Maximum fee caps to prevent abuse
- **Input Validation**: Comprehensive validation on all user inputs
- **Gas Optimization**: Efficient contract design to minimize gas costs

## 📊 Token Features

### Basic Features
- Standard ERC-20 functionality
- Custom name, symbol, and decimals
- Initial and maximum supply configuration
- Multi-chain deployment support

### Advanced Features
- **Burnable**: Allow token holders to destroy tokens
- **Mintable**: Owner can create new tokens (up to max supply)
- **Transfer Fees**: Configurable buy/sell fees with recipient address
- **Holder Redistribution**: Automatic reward distribution to holders

### Vesting System
- **Multiple Categories**: Team, marketing, sales, ecosystem, development
- **Flexible Scheduling**: Custom start dates and durations
- **Linear Vesting**: Gradual token release over time
- **Revocable**: Owner can revoke unvested tokens if needed

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test contract deployment on local network:
```bash
npx hardhat node
npm run deploy
```

## 📚 API Documentation

### POST /api/deploy
Deploy a new token with the specified configuration.

**Request Body**:
```json
{
  "config": {
    "name": "My Token",
    "symbol": "MTK",
    "decimals": 18,
    "initialSupply": "1000000",
    "maxSupply": "10000000",
    "network": 1,
    "features": {
      "burnable": true,
      "mintable": true,
      "transferFees": false,
      "holderRedistribution": false
    },
    "vestingConfig": [...]
  },
  "userAddress": "0x..."
}
```

### GET /api/deploy?userAddress=0x...&networkId=1
Get tokens deployed by a specific user on a network.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.tokenforge.app](https://docs.tokenforge.app)
- **Discord**: [Join our community](https://discord.gg/tokenforge)
- **Email**: support@tokenforge.app
- **Twitter**: [@TokenForgeApp](https://twitter.com/TokenForgeApp)

## 🗺️ Roadmap

- [ ] Additional blockchain networks (Avalanche, Solana)
- [ ] Advanced tokenomics features
- [ ] DAO governance integration
- [ ] NFT collection creation
- [ ] DeFi protocol templates
- [ ] Mobile app development
- [ ] Enterprise features and white-label solutions

## ⚠️ Disclaimer

This software is provided "as is" without warranty. Users are responsible for understanding the risks associated with cryptocurrency and smart contract deployment. Always conduct thorough testing before deploying to mainnet.