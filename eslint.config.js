/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  { ignores: ['node_modules', 'coverage', 'dist'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        global: true, process: true, __dirname: true, __filename: true,
        module: true, exports: true, require: true, console: true
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'off',
      'prefer-const': 'warn',
      'eqeqeq': ['warn','smart']
    }
  },
  { files: ['**/*.{test,spec}.js'], rules: { 'no-undef': 'off' } }
];