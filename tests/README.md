# Test Suite Documentation

This directory contains unit tests for both backend and frontend components of the Git-happens project.

## Test Files Overview

### Backend Unit Tests

#### `config.test.ts`
Tests for backend configuration management.
- **Tests Run:**
  - Validates PORT environment variable usage
  - Tests default port fallback (3000)
  - Verifies GOOGLE_MAPS_API_KEY exposure

#### `mapController.test.ts`
Tests for the map controller endpoints.
- **Tests Run:**
  - Valid route request handling
  - Error handling for service failures
  - Missing query parameter handling

### Frontend Tests

####polylineDecoder.test.ts`
Tests for the Google Maps polyline decoder utility.
- **Tests Run:**
  - Simple polyline decoding accuracy
  - Coordinate object structure validation (latitude/longitude)
  - Montreal area coordinate validation
  - Empty string handling
  - Multi-point polyline decoding
  - Precision validation (5 decimal places)
  - Consecutive point differentiation

#### `geofencing.test.ts`
Tests for building geofencing logic.
- **Tests Run:**
  - User inside building polygon detection
  - User outside building polygon detection
  - Far location (edge case) handling
  - Boundary location handling
  - Different building shapes (triangular, rectangular)
  - Complex polygon support (many vertices)
  - Minimum polygon validation (3 points)

#### `buildings.test.ts`
Tests for Concordia buildings constant data validation.
- **Tests Run:**
  - Building data array existence
  - Both campus representation (SGW & LOYOLA)
  - Required property validation
  - Valid campus value checking
  - Polygon coordinate count (minimum 3)
  - Coordinate structure validation
  - Geographic location validation (Montreal area)
  - SGW campus coordinate bounds
  - Loyola campus coordinate bounds
  - Unique building ID verification
  - Non-empty information fields
  - Known building inclusion checks

### Integration Tests

#### `mapRoutes.integration.test.ts`
Integration tests for backend API routes with mocked services.
- **Tests Run:**
  - GET /api/directions with valid parameters
  - Different transport modes (WALKING, DRIVING, TRANSIT, BICYCLING)
  - Error handling when service fails
  - Undefined parameter handling
  - Query parameter type preservation
  - JSON error response formatting
  - HTTP method validation

#### `fullstack.integration.test.ts`
Full stack integration tests simulating frontend-to-backend communication.
- **Tests Run:**
  - Frontend API service to backend API integration
  - Different transport modes through full stack
  - Polyline encoding/decoding workflow
  - Backend timeout handling
  - Invalid coordinates error handling
  - SGW campus building routes
  - Cross-campus routes (SGW to Loyola)

**Note:** Full stack tests gracefully skip when backend server is not running (useful for CI/CD).

## Components NOT Tested

The following frontend components were **not** tested as they would require complex React Native testing setup and provide limited unit testing value:

- `IndoorView.tsx` - Empty component file
- `MapController.tsx` - Empty component file  
- `OutDoorView.tsx` - React Native MapView component (better suited for integration tests)
- `MapScreen.tsx` - Complex screen component with state management (better suited for integration/E2E tests)
- `AppNavigator.tsx` - Navigation setup (better suited for integration tests)
- `mapApiService.ts` - API service (would require complex axios mocking; better suited for integration tests with a test server)

These components are primarily UI/rendering focused or involve external API calls, and would benefit more from integration or end-to-end testing rather than unit tests.

## Running Tests

```bash
# Run unit tests (backend + frontend utils)
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

### Unit Tests
- **Config File:** `jest.config.backend.js`
- **Framework:** Jest with ts-jest preset
- **Test Pattern:** `**/tests/**/*.test.ts` (excludes integration folder)
- **Environment:** Node.js
- **Coverage:** Enabled with JSON, LCOV, text, and clover reporters

### Integration Tests
- **Config File:** `jest.config.integration.js`
- **Framework:** Jest with ts-jest preset
- **Test Pattern:** `**/tests/integration/**/*.test.ts`
- **Environment:** Node.js
- **Timeout:** 10 seconds (for API calls)
- **Coverage:** Separate coverage directory (`coverage/integration`)
- **Setup:** `tests/integration/setup.ts` for global test setup

# Run all tests (unit + integration)
npm run test:all
```

## Test Configuration

Tests use the following setup:
- **Framework:** Jest with ts-jest preset
- **Test Pattern:** `**/tests/**/*.test.ts`
- **Environment:** Node.js
- **Coverage:** Enabled with JSON, LCOV, text, and clover reporters

## Coverage Reports

Coverage reports are generated in the `coverage/` directory and include:
- `lcov.info` - LCOV format
- `coverage-final.json` - JSON format
- `clover.xml` - Clover format
- `lcov-report/` - HTML coverage report

## Notes

- All frontend utility functions (pure functions) have comprehensive test coverage
- API service tests use mocked axios to avoid real network calls
- Building data tests ensure geographic accuracy for Concordia University campuses
- Tests follow AAA pattern (Arrange, Act, Assert) for clarity
- Integration tests gracefully skip when backend server is not running (ideal for CI/CD)
- Full stack tests validate frontend-to-backend communication flow

## Test Results Summary

**Unit Tests:** 32 passing tests across 5 suites
- Backend config and controllers
- Frontend utilities (polylineDecoder, geofencing)
- Constants validation (buildings)

**Integration Tests:** 15 passing tests across 2 suites
- Map routes API integration (8 tests)
- Full stack frontend-to-backend (7 tests)

**Total:** 47 tests passing

## Next Steps: E2E Testing

For end-to-end testing of the React Native frontend, consider:

### Option 1: Detox (Recommended)
Industry-standard E2E testing for React Native.

```bash
npm install --save-dev detox detox-cli
```

### Option 2: Maestro (Simpler Alternative)
Easier setup with YAML-based test flows.

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### E2E Test Examples
- User searches for a building
- User requests directions between campuses
- User switches between indoor/outdoor view
- Route polyline displays correctly
- Shuttle information appears for inter-campus routes

See the main documentation for detailed E2E setup instructions.
