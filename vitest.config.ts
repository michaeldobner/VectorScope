import { defineConfig } from 'vitest/config';

// Unit tests of all modules plus the repository checks in tests/.
export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify('test') },
  test: { include: ['air/src/**/*.test.ts', 'intel/src/**/*.test.ts', 'tests/**/*.test.ts'] },
});
