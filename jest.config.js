module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^typeorm$': '<rootDir>/test/mocks/typeorm.js',
    '^@nestjs/typeorm$': '<rootDir>/test/mocks/nestjs-typeorm.js',
    '^typeorm/(.*)$': '<rootDir>/node_modules/typeorm/$1',
  },
  // Only transform TypeScript files with ts-jest (avoid transforming .js mocks)
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 30000,
};
