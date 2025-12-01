// Crazy stuff!
//
// On developer boxes we want to run the .ts files directly for quickest
// iteration (save -> run), but on CI machines we want to run the compiled
// JavaScript for highest throughput.

const isCi = !!process.env.CI || !!process.env.CODEBUILD_BUILD_ID;
const ext = isCi ? 'js' : 'ts';

module.exports = {
  // The preset deals with preferring TS over JS
  moduleFileExtensions: [
    // .ts first to prefer a ts over a js if present
    'ts',
    'js',
  ],
  testMatch: [`<rootDir>/test/**/?(*.)+(test).${ext}`],

  // Transform TypeScript using ts-jest. Use of this preset still requires the depending
  // package to depend on `ts-jest` directly. We need to use `babel-jest` on .js files to
  // make sure `jest.mock` calls are hoisted to the top of every test file.
  transform: {
    "\\.jsx?$": ["babel-jest"],
    '^.+\\.tsx?$': ['ts-jest'],
  },
  // Jest is resource greedy so this shouldn't be more than 50%
  maxWorkers: '50%',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      statements: 80,
    },
  },
  collectCoverage: true,
  coverageReporters: [
    'text-summary', // for console summary
    'cobertura', // for codecov. see https://docs.codecov.com/docs/code-coverage-with-javascript
    'html' // for local deep dive
  ],
  coveragePathIgnorePatterns: ['\\.generated\\.[jt]s$', '<rootDir>/test/', '.warnings.jsii.js$', '/node_modules/'],
  reporters: ['default', ['jest-junit', { suiteName: 'jest tests', outputDirectory: 'coverage' }]],

  // A consequence of doing this is that snapshots files are always named after
  // the currently executing file, which will be different for .ts and .js
  // extensions, so we need to do some more work to redirect always to .ts
  snapshotResolver: `${__dirname}/snapshot-resolver.js`,
};
