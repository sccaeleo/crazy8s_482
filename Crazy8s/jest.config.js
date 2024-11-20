module.exports = {
  moduleNameMapper: {
  '\\.(jpg|jpeg|png|gif|webp|svg|mp3|mp4)$': '<rootDir>/fileTransformer.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy'
  },
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    '/node_modules/(?!(axios)/)'
  ],
  reporters: [
      "default",
      [ "jest-html-reporters", {
        pageTitle: "Test Report",
        outputPath: "client/test-report.html",
        includeFailureMsg: true,
      }]
    ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  }

  
};