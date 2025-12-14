# CI/CD Pipeline Documentation

## Overview

Scamnemesis uses GitHub Actions for continuous integration and deployment. This document describes the pipeline configuration and troubleshooting guides.

## Pipeline Jobs

### 1. Lint & Type Check (`lint`)
- Runs ESLint on `src/` and `e2e/` directories
- Runs TypeScript type checking (`tsc --noEmit`)
- **Must pass** - blocking for other jobs

### 2. Unit Tests (`test`)
- Runs Jest with coverage enabled
- Generates coverage reports in `coverage/` directory
- Uploads coverage to Codecov
- **Depends on**: `lint`

### 3. Build (`build`)
- Builds Next.js production bundle
- Generates Prisma client
- Uploads build artifacts for E2E tests
- **Depends on**: `lint`, `test`

### 4. E2E Tests (`e2e`)
- Runs Playwright tests
- Uses PostgreSQL and Redis services
- Downloads build artifacts from `build` job
- **Depends on**: `build`

### 5. Security Scan (`security`)
- Runs `pnpm audit`
- Checks for high/critical vulnerabilities
- **Depends on**: `lint`

### 6. Deploy (`deploy-staging`, `deploy-production`)
- Staging: Triggered on `develop` branch
- Production: Triggered on `main` branch
- **Depends on**: `build`, `e2e`

## Configuration

### Environment Variables

```yaml
env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'
```

### Required Secrets

- `CODECOV_TOKEN` - For coverage upload

## Dependency Overrides

Current pnpm overrides in `package.json`:

```json
{
  "pnpm": {
    "overrides": {
      "test-exclude": "^7.0.1"
    }
  }
}
```

### test-exclude Override

**Reason**: `test-exclude@6.0.0` has compatibility issues with Node.js 20+. The module uses `util.promisify()` on an object instead of a function, causing Jest coverage to crash.

**Fixed in**: `test-exclude@7.0.1`

**Can be removed when**: Jest updates its dependencies to use `test-exclude@7.x` by default.

## Troubleshooting

### Coverage Crash with TypeError

**Error**:
```
TypeError: The "original" argument must be of type function
at promisify (node:internal/util:409:3)
at node_modules/test-exclude/index.js:5:14
```

**Solution**: Ensure `test-exclude` override is set to `^7.0.1` in `package.json`.

### ESLint Config Not Found

**Error**: `ESLint couldn't find the config`

**Solution**: Ensure `.eslintrc.js` exists in project root.

### Prisma Client Not Generated

**Error**: `@prisma/client did not initialize yet`

**Solution**: Run `pnpm prisma generate` before tests/build.

### pnpm Lockfile Mismatch

**Error**: `Cannot install with "frozen-lockfile"`

**Solution**:
1. Run `pnpm install` locally
2. Commit updated `pnpm-lock.yaml`

### DRONE_SSH_PREV_COMMAND_EXIT_CODE Warnings (Deployment)

**Warning**:
```
The "DRONE_SSH_PREV_COMMAND_EXIT_CODE" variable is not set. Defaulting to a blank string.
```

**Impact**: Low priority - warnings are cosmetic and don't affect deployment functionality.

**Cause**: The `script_stop: true` flag in `appleboy/ssh-action` injects error-handling code that corrupts heredoc operations, appearing as undefined variables in Docker Compose.

**Solution**: See detailed analysis in [DEPLOYMENT_WARNING_ANALYSIS.md](./DEPLOYMENT_WARNING_ANALYSIS.md)

**Quick Fix**: Replace `script_stop: true` with `set -e` at the top of the deployment script.

## Performance Optimization

### Test Parallelization
- CI uses `--maxWorkers=2` to balance speed and memory usage
- Local development can use more workers

### Caching
- pnpm store is cached between runs
- Build artifacts are shared between jobs

## Security Notes

### Audit Failures

If `pnpm audit` finds vulnerabilities:

1. Check if it's a direct or transitive dependency
2. For transitive: Add override in `package.json`
3. For direct: Update the dependency
4. Document the fix in commit message

### Never Skip Security

The security job uses `continue-on-error: true` for informational purposes only. High/critical vulnerabilities must be addressed before production deployment.

## Monitoring

### Build Status

Check build status at: `https://github.com/[org]/Scamnemesis/actions`

### Coverage Reports

Coverage reports are uploaded to Codecov after each successful test run.

## Contact

For CI/CD issues, contact the DevOps team or create an issue with the `ci-cd` label.
