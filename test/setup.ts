import 'reflect-metadata';

// Default environment for tests
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

jest.setTimeout(30000);
