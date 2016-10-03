// TODO: Define rules
// Example: https://gist.github.com/nkbt/9efd4facb391edbf8048

module.exports = {
  root: true,
  // TODO: No longer needed, uninstall dev dependency
  // parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // Required to lint *.vue files
  plugins: [
    'html'
  ],
  // Add your custom rules here:
  // 'rules': {
  //   // allow paren-less arrow functions
  //   'arrow-parens': 0,
  //   // allow async-await
  //   'generator-star-spacing': 0,
  //   // allow debugger during development
  //   'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  // }
}
