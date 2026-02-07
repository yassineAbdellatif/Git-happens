# Testing Guide

Complete testing suite with **unit tests**, **integration tests**, and **E2E tests** for the Git-happens Campus Navigator project.

---

## Quick Start

```powershell
# Run all tests
npm run test:all

# Run specific test types
npm test                    # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e           # E2E tests (requires setup)

# Run tests in watch mode
npm run test:watch                    # Unit tests
npm run test:integration:watch        # Integration tests

# Generate coverage reports
npm run test:coverage                 # Unit test coverage
npm run test:integration:coverage     # Integration test coverage
```

---

## Test Summary

| Type | Count | Coverage | Location |
|------|-------|----------|----------|
| **Unit Tests** | 32 tests | 90% | `tests/*.test.ts` |
| **Integration Tests** | 15 tests | 85% | `tests/integration/*.test.ts` |
| **E2E Tests** | 4 flows | - | `.maestro/*.yaml` |
| **Total** | 47 tests | - | - |

---

## 1. Unit Tests (32 tests)

Tests individual functions and components in isolation.

### Backend Tests
- **`config.test.ts`** - Environment configuration (PORT, API keys)
- **`mapController.test.ts`** - Route request handling and validation

### Frontend Tests
- **`polylineDecoder.test.ts`** - Google Maps polyline decoding (6 tests)
- **`geofencing.test.ts`** - Building polygon detection (7 tests)
- **`buildings.test.ts`** - Campus data validation (13 tests)

**Run:** `npm test`

---

## 2. Integration Tests (15 tests)

Tests communication between components and full-stack flows.

### API Integration Tests
- **`mapRoutes.integration.test.ts`** (8 tests)
  - API endpoint validation
  - Transport modes (WALKING, DRIVING, TRANSIT, BICYCLING)
  - Error handling and parameter validation

### Full-Stack Tests
- **`fullstack.integration.test.ts`** (7 tests)
  - Frontend → Backend communication
  - Cross-campus routing
  - Timeout and error handling
  - **Note:** Gracefully skips if backend not running (CI/CD friendly)

**Run:** `npm run test:integration`

---

## 3. E2E Tests (4 test flows)

Tests complete user workflows on Android emulator using Maestro.

### Test Flows
- **`navigation.yaml`** - Basic app navigation and search
- **`search-building.yaml`** - Building search and selection
- **`campus-toggle.yaml`** - Campus switching and map controls
- **`directions.yaml`** - Directions and route display

### Prerequisites
1. **Java 17+** installed
2. **Maestro** installed
3. **Android emulator** running with app installed

### Running E2E Tests

**Setup (first time):**
```powershell
# Set environment permanently
$env:ANDROID_HOME = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
# Add to System Environment Variables

# Install Maestro
# Download from: https://maestro.mobile.dev
```

**Run tests:**
```powershell
# Make sure your app is running on emulator first!
cd app/frontend
npx expo start
# Press 'a' to launch on Android

# In a new terminal, run E2E tests
.\run-maestro-tests.ps1
```

**Note:** E2E tests use coordinate-based interactions due to Expo Go limitations. For better testID support, build a development client with `expo run:android`.

---

## Test Coverage

### What's Tested ✅
- **Backend:** Route API, configuration, error handling
- **Frontend Utils:** Polyline decoding, geofencing, data validation
- **Integration:** Frontend-backend communication, API endpoints
- **E2E:** User workflows, navigation, search, directions

### Not Tested (By Design) ❌
- **React Native UI Components** - Better suited for visual regression testing
- **Map Rendering** - Complex MapView component, tested manually
- **Third-party Libraries** - Google Maps API, Expo libraries

---

## Configuration Files

| File | Purpose |
|------|---------|
| `jest.config.backend.js` | Unit test configuration |
| `jest.config.integration.js` | Integration test configuration |
| `.maestro/*.yaml` | E2E test flows |
| `run-maestro-tests.ps1` | E2E test runner script |

---

## Troubleshooting

### Unit/Integration Tests Fail
- Ensure dependencies installed: `npm install`
- Check Node.js version: `node --version` (v18+ recommended)
- Clear Jest cache: `npx jest --clearCache`

### E2E Tests Can't Find App
- Verify app is running on emulator
- Check `ANDROID_HOME` environment variable is set
- Ensure Java 17+ is active: `java -version`
- Verify emulator connection: `adb devices`

### E2E Tests Can't Find Elements
- Tests use coordinate-based interactions (designed for Expo Go)
- Verify app layout matches expected coordinates
- Use Maestro Studio to inspect UI: `maestro studio`

---

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Unit Tests
  run: npm test

- name: Run Integration Tests
  run: npm run test:integration

# E2E tests require emulator setup (add if needed)
```

### Coverage Reports
Generated in `coverage/` directory:
- `lcov.info` - LCOV format
- `lcov-report/index.html` - HTML report
- `clover.xml` - Clover format
- `coverage-final.json` - JSON format

---

## Additional Resources

- **E2E Setup Guide:** `MAESTRO-E2E-GUIDE.md`
- **Integration Testing:** `tests/integration/README.md`
- **Maestro Documentation:** https://maestro.mobile.dev

---

**✨ All 47 tests passing! Happy testing!**
