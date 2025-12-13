# Contributing to Scamnemesis

## Project Standards

Scamnemesis is a **professional SaaS platform** utilizing AI and advanced technologies for fraud detection and reporting. All contributions must meet the highest standards of quality.

### Core Principles

1. **Stability First** - The platform must be extremely stable at all times
2. **Performance** - All code must be optimized for speed
3. **Security** - Security is non-negotiable; no vulnerabilities allowed
4. **No Technical Debt** - Do not disable or bypass important features

### Forbidden Practices

The following practices are **strictly forbidden**:

- Disabling tests or test coverage
- Using `continue-on-error: true` without proper justification
- Skipping security scans or audits
- Removing validation or sanitization
- Bypassing authentication or authorization
- Using deprecated or vulnerable dependencies
- Creating workarounds instead of proper fixes

### Before Making Changes

If you encounter a situation where you need to:
- Disable any feature temporarily
- Skip tests or coverage
- Downgrade a dependency
- Use a workaround instead of a fix

**You MUST:**
1. Document the issue in detail
2. Explain why a proper fix is not immediately possible
3. Create a GitHub Issue with the `tech-debt` label
4. Get explicit approval before proceeding
5. Set a deadline for the proper fix

## CI/CD Requirements

### All CI Jobs Must Pass

- **Lint** - Zero errors (warnings acceptable but should be minimized)
- **Type Check** - Zero TypeScript errors
- **Unit Tests** - All tests must pass
- **Coverage** - Coverage reports must be generated
- **Build** - Production build must succeed
- **E2E Tests** - End-to-end tests must pass
- **Security Scan** - No high/critical vulnerabilities

### Test Coverage

- Coverage must always be enabled in CI
- New code should maintain or improve coverage
- Do not mock entire modules without good reason
- Write meaningful tests, not just to hit coverage numbers

## Code Quality

### TypeScript
- Use strict mode
- No `any` types without explicit justification
- All exports must be properly typed

### Error Handling
- Never swallow errors silently
- Log errors with proper context
- Return meaningful error messages to users

### Security
- Validate all user input
- Sanitize all output
- Use parameterized queries
- Never expose sensitive data in logs
- Follow OWASP Top 10 guidelines

## Dependency Management

### Adding Dependencies
- Verify the package is actively maintained
- Check for known vulnerabilities
- Prefer packages with TypeScript support
- Document why the dependency is needed

### Updating Dependencies
- Review changelogs for breaking changes
- Run full test suite after updates
- Test in staging before production

### Security Overrides
If a security vulnerability requires a pnpm override:
```json
{
  "pnpm": {
    "overrides": {
      "vulnerable-package": "^fixed-version"
    }
  }
}
```

Document the override in commit message with:
- CVE number if applicable
- Why the override is safe
- When it can be removed

## Git Workflow

### Commit Messages
- Use clear, descriptive messages
- Reference issue numbers when applicable
- Explain the "why" not just the "what"

### Pull Requests
- Must pass all CI checks
- Must be reviewed by at least one team member
- Must include test coverage for new code
- Must update documentation if needed

## Monitoring and Alerts

All production deployments must include:
- Error tracking (Sentry or similar)
- Performance monitoring
- Uptime monitoring
- Security alerts

## Contact

For questions about these guidelines, contact the project maintainers.

---

**Remember: This is a professional platform. Quality is not optional.**
