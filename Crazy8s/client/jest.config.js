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
    reporters: [
        "default", // This is the default reporter
        [ "jest-html-reporters", {
          pageTitle: "Test Report",
          outputPath: "client/test-report.html",
          includeFailureMsg: true,
          // Additional options...
        }]
      ],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
    }
    
  };