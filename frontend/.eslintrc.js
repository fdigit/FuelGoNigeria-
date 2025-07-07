module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Ignore unused variables in production builds
    '@typescript-eslint/no-unused-vars': process.env.NODE_ENV === 'production' ? 'off' : 'warn',
    'react-hooks/exhaustive-deps': process.env.NODE_ENV === 'production' ? 'off' : 'warn',
    'import/no-anonymous-default-export': process.env.NODE_ENV === 'production' ? 'off' : 'warn'
  }
}; 