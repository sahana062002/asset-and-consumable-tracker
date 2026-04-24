module.exports = {
  'frontend/src/**/*.{ts,tsx}': [
    'npm run lint --prefix frontend'
  ],
  'backend/src/**/*.ts': [
    () => 'npm run lint --prefix backend'
  ]
};
