const { defineConfig } = require('@prisma/client');

module.exports = defineConfig({
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
});
