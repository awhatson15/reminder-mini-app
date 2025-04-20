module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'plugin:node/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
    'node/no-unpublished-require': ['error', {
      allowModules: ['jest', 'supertest'],
    }],
    'max-len': ['error', { code: 100, ignoreUrls: true }],
    'consistent-return': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'no-param-reassign': ['error', { props: false }],
  },
}; 