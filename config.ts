// Copy this file to config.ts and fill in your actual values
export const config = {
  changelly: {
    privateKey: process.env.CHANGELLY_API_SECRET || '',
    publicKey: process.env.CHANGELLY_API_KEY || '',
    walletAddress: process.env.WALLET_ADDRESS || '',
  },
  database: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/payment',
  },
  server: {
    port: process.env.PORT || 3000,
  },
};
