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
| **Unit Tests** | 133 tests (13 suites) | 86.45% | `tests/*.test.ts` |
| **Integration Tests** | 28 tests (3 suites) | 70.83% | `tests/integration/*.test.ts` |
| **E2E Tests** | 4 flows | - | `.maestro/*.yaml` |
| **Total** | 161 tests | - | - |

**Overall Project Coverage: 86.45%** ✅ (Exceeds 70% target)

---

## 1. Unit Tests (133 tests across 13 suites)

Tests individual functions and components in isolation.

### Backend Tests
- **`config.test.ts`** - Environment configuration (PORT, API keys)
- **`mapController.test.ts`** - Route request handling and validation
- **`index.test.ts`** ✨ **NEW** - Express server setup, health endpoint, middleware, routing
- **`mapRoutes.test.ts`** ✨ **NEW** - Route configuration and Express Router setup

### Frontend Tests
- **`polylineDecoder.test.ts`** - Google Maps polyline decoding (6 tests)
- **`geofencing.test.ts`** - Building polygon detection (7 tests)
- **`buildings.test.ts`** - Campus data validation (13 tests)
- **`shuttleSchedule.test.ts`** ✨ **NEW** - Shuttle schedule constants, time validation, chronological ordering (17 tests)
- **`shuttleStops.test.ts`** ✨ **NEW** - Shuttle stop coordinates, campus locations, distance calculations (11 tests)
- **`mapApiService.test.ts`** ✨ **NEW** - Backend API communication, error handling, transport modes (11 tests)
- **`shuttleLogic.test.ts`** ✨ **NEW** - Shuttle routing algorithm, campus detection, next shuttle info (51 tests)

**Run:** `npm test`

### Coverage Details
```
Overall:     86.45% statements | 74.5% branch | 79.16% functions | 85.63% lines

Backend:
- config.ts:        100% coverage ✓
- mapController.ts: 100% coverage ✓
- mapRoutes.ts:     100% coverage ✓
- index.ts:         100% coverage ✓
- mapService.ts:    25% coverage (intentionally not tested - integration only)

Frontend:
- shuttleSchedule.ts: 100% coverage ✓
- shuttleStops.ts:    100% coverage ✓
- shuttleLogic.ts:    98.93% coverage ✓
- geofencing.ts:      100% coverage ✓
- polylineDecoder.ts: 100% coverage ✓
- buildings.ts:       35.29% coverage (data constants)
- mapApiService.ts:   84.61% coverage ✓
```

---

## 2. Integration Tests (28 tests)

Tests communication between components and full-stack flows.

### API Integration Tests
- **`mapRoutes.integration.test.ts`** (8 tests)
  - API endpoint validation
  - Transport modes (WALKING, DRIVING, TRANSIT, BICYCLING)
  - Error handling and parameter validation

- **`mapApiService.integration.test.ts`** (13 tests)
  - Real backend API communication
  - Query parameter validation
  - Error handling and timeout scenarios
  - Different transport modes (WALKING, DRIVING, TRANSIT, BICYCLING)

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
```powershell, server initialization, middleware
- **Frontend Utils:** Polyline decoding, geofencing, data validation
- **Frontend Services:** API communication, axios error handling, timeout handling
- **Frontend Logic:** Shuttle routing, campus detection, schedule calculations, next shuttle info
- **Frontend Constants:** Shuttle schedules, shuttle stops, building data validation
- **Integration:** Frontend-backend communication, API endpoints
- **E2E:** User workflows, navigation, search, directions

### Not Tested (By Design) ❌
- **React Native UI Components** - Better suited for visual regression testing (useMapLogic hook, OutDoorView, MapScreen, AppNavigator)
- **Map Rendering** - Complex MapView component, tested manually
- **Third-party Libraries** - Google Maps API, Expo libraries
- **mapService.ts** - Tested only via integration tests (live Google Maps API calls)
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
## Recent Changes (March 2026)

### New Test Files Added
Six new comprehensive test files were added to improve coverage:

1. **`index.test.ts`** - Backend server initialization
   - Health endpoint testing
   - Middleware configuration
   - Route mounting
   - Error handling for unknown routes

2. **`mapRoutes.test.ts`** - Express Router configuration
   - Route definition validation
   - HTTP method verification
   - Controller integration

3. **`shuttleSchedule.test.ts`** - Shuttle schedule validation
   - Schedule structure validation
   - Time format verification (HH:mm)
   - Chronological ordering tests
   - Monday-Thursday vs Friday schedules
   - Semester data integrity

4. **`shuttleStops.test.ts`** - Shuttle stop coordinates
   - Location accuracy (Montreal area)
   - Campus-specific coordinate ranges
   - Distance validation between campuses
   - Data structure integrity

5. **`mapApiService.test.ts`** - API service layer
   - Axios mocking and request validation
   - Query parameter construction
   - Timeout configuration
   - Error handling (network, timeout, 404, 500)
   - Multiple transport mode support

6. **`shuttleLogic.test.ts`** - Shuttle routing algorithms
   - Segment color mapping
   - Next shuttle calculation logic
   - Campus detection from user location
   - Multi-leg route building (walk + shuttle + walk)
   - Distance and duration formatting
   - Edge cases and null handling

### Coverage Improvements (Unit Tests)
- Overall coverage increased from ~70% to **86.45%** ✅
- All backend critical paths now at **100% coverage**
- Frontend utility functions at **98-100% coverage**
- Unit test count increased from 47 to **133 tests**
- **Project exceeds 70% coverage target**

### Test Quality Enhancements
- All tests use proper mocking (axios, polylineDecoder)
- Comprehensive edge case coverage
- Clear test descriptions and grouping
- No external dependencies (integration tests gracefully skip if backend unavailable)

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

**✨ All 161 tests passing! Coverage: 86.45%! ✅**
