module.exports = {
  roots: ['<rootDir>/src'],
  transform: { '^.+\\.(ts|tsx|js|jsx)?$': 'ts-jest' },
  testRegex: '[a-zA-Z0-9-\\/]+(\\.test\\.ts)$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
