module.exports = {
    // Handle CSS imports from previous solution
    moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/fileTransformer.js',
      '\\.(css|less|sass|scss)$': 'identity-obj-proxy'
    },
    // Add these new configurations
    testEnvironment: 'jsdom',
    transformIgnorePatterns: [
      // Change the transformIgnorePatterns to handle axios
      '/node_modules/(?!(axios)/)'
    ],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
    }
  };