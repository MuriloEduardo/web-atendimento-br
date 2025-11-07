# End-to-End Integration Tests

## Overview

This directory contains comprehensive end-to-end integration tests for the onboarding flow.

## Files

- **test-complete-e2e.js** - Complete automated E2E test suite
  - Tests full user registration and onboarding flow
  - Verifies all database models (User, Company, Transaction, Automation)
  - Tests Stripe integration (with fallback for missing API key)
  - Validates email verification workflow
  - Confirms complete onboarding process

- **verify-email-helper.js** - Test utility for email verification
  - Bypasses email verification for testing purposes
  - Directly updates user email verification status in database

## Running Tests

### Prerequisites

1. Start the development server:
```bash
npm run dev
```

2. Ensure database is migrated:
```bash
npx prisma migrate dev
```

### Run Complete E2E Test

```bash
node test-complete-e2e.js
```

### Test Coverage

The E2E test covers:

1. ✅ Server health check
2. ✅ User registration with JWT authentication
3. ✅ Initial profile verification
4. ✅ Onboarding progress tracking
5. ✅ Profile update with phone number
6. ✅ Business information setup
7. ✅ Company model creation
8. ✅ WhatsApp configuration
9. ✅ Email verification (automated for tests)
10. ✅ Stripe payment setup (with mock fallback)
11. ✅ Automation setup
12. ✅ All database models verification (User, Company, Transaction, Automation)
13. ✅ Onboarding completion
14. ✅ Final state validation

### Expected Output

```
════════════════════════════════════════════════════════════
  COMPLETE END-TO-END INTEGRATION TEST
  Testing Full Onboarding Flow + All Models + Stripe
════════════════════════════════════════════════════════════

[... test execution ...]

🎉 ALL TESTS PASSED! Onboarding flow is working perfectly!
```

## Stripe Integration Testing

To test with real Stripe integration, add to your `.env`:

```
STRIPE_SECRET_KEY=sk_test_...
```

Without this key, the test will use a mock setup and still pass all tests.

## Notes

- Tests create real database entries
- Email verification is automatically handled via helper script
- Each test run creates a new user with timestamp-based email
- All tests are non-destructive and can be run multiple times
