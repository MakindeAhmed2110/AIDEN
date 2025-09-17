// Jest setup file for DePIN tests

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DEPIN_NODE_ENV = 'test';
process.env.DEPIN_LOG_LEVEL = 'error';
process.env.HEDERA_NETWORK = 'testnet';
process.env.DEPIN_MEASUREMENT_INTERVAL = '1000';


