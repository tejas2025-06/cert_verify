# Certificate Verification DApp

A decentralized application (DApp) for issuing and verifying digital certificates using blockchain technology. Built with Next.js and Ethereum smart contracts.

## Features

- **Issue Certificates**: Authorized issuers can create and issue digital certificates
- **Certificate Verification**: Anyone can verify the authenticity of certificates
- **Image Hash Verification**: Ensures certificate images haven't been tampered with
- **Blockchain Security**: Leverages Ethereum blockchain for immutable certificate records
- **Modern UI**: Clean, responsive three-column layout for different user roles

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Blockchain: Ethereum, ethers.js
- Smart Contract: Solidity
- Wallet Integration: MetaMask

## Prerequisites

- Node.js 16.x or later
- MetaMask wallet extension installed in your browser
- Some test ETH for deploying and interacting with smart contracts

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/certificate-verification-dapp.git
cd certificate-verification-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your configuration:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

### For Issuers
1. Connect your MetaMask wallet
2. Use the Issuer Portal to create and issue new certificates
3. Fill in student details and upload certificate image
4. Submit the transaction through MetaMask

### For Certificate Holders
1. Receive certificate ID from issuer
2. View certificate details in the Client Portal
3. Download or share certificate information

### For Verifiers
1. Enter the certificate ID
2. Upload the certificate image
3. Verify the authenticity of the certificate

## Smart Contract

The smart contract is deployed on the Ethereum network and handles:
- Certificate issuance
- Certificate verification
- Issuer authorization
- Image hash verification

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Smart contract interaction with [ethers.js](https://docs.ethers.org/)
