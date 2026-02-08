# Maestro E2E Testing Guide

## ✅ What's Already Set Up

- ✅ Maestro flow files created in `.maestro/` folder
- ✅ Test scripts added to `package.json`
- ✅ testID attributes added to React Native components
- ✅ 4 complete test flows ready to run

## 🚀 Quick Start

### 1. Install Java 17+ (REQUIRED)

Maestro requires Java 17 or higher. Check your version:
```powershell
java -version
```

**If you have Java 8 or lower, install Java 17+:**

**Option A: Download from Oracle/OpenJDK**
- Download Java 17: https://www.oracle.com/java/technologies/downloads/#java17
- Or OpenJDK: https://adoptium.net/temurin/releases/?version=17
- Install and restart PowerShell

**Option B: Using winget (accept terms when prompted)**
```powershell
winget install -e --id Microsoft.OpenJDK.17
```

**Option C: Using Chocolatey**
```powershell
choco install openjdk17
```

After installing Java, restart PowerShell and verify:
```powershell
java -version  # Should show version 17 or higher
```

### 2. Install Maestro

**Windows (Using PowerShell as Administrator):**

```powershell
# Option 1: Download and install manually
iwr "https://get.maestro.mobile.dev/install.ps1" -OutFile install.ps1
.\install.ps1
```

**Or download the installer from:** https://maestro.mobile.dev/getting-started/installing-maestro

**Mac/Linux:**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

After installation, **restart your terminal** and verify:
```powershell
maestro --version
```

**If maestro command not found:**
- Make sure you restarted PowerShell after adding to PATH
- Try running with full path: `C:\Users\Samy\maestro\bin\maestro.bat --version`
- Or add an alias: `Set-Alias maestro "C:\Users\Samy\maestro\bin\maestro.bat"`

### 3. Start Your App

Maestro works with your running app - no need to build special test versions!

**Option A: Using Expo (Recommended for React Native)**
```powershell
# In your project directory
cd app/frontend
npx expo start
```
Then press:
- `a` for Android emulator/device
- `i` for iOS simulator (Mac only)

**Option B: Using Android Studio Emulator**
1. Open Android Studio → Device Manager
2. Start an emulator
3. Install your app on the emulator

**Option C: Physical Device**
- Connect your Android phone via USB
- Enable USB debugging
- Install your app

### 4. Run Maestro Tests

**Run all tests:**
```powershell
npm run maestro:test
```

**Run specific tests:**
```powershell
npm run maestro:test:search       # Search functionality
npm run maestro:test:directions   # Directions & navigation
npm run maestro:test:campus       # Campus toggle & recenter
npm run maestro:test:navigation   # Basic navigation flow
```

**Or run directly with maestro CLI:**
```powershell
maestro test .maestro/search-building.yaml
```

## 📁 Test Flow Files

All test flows are in the `.maestro/` folder:

- **`navigation.yaml`** - Basic app navigation test
- **`search-building.yaml`** - Building search functionality
- **`campus-toggle.yaml`** - Campus switching and map controls
- **`directions.yaml`** - Directions and route navigation

## 🎨 Maestro Studio - Visual Test Builder

Maestro Studio provides a visual interface to build and debug tests:

```powershell
npm run maestro:studio
```

This opens an interactive GUI where you can:
- See your app in real-time
- Click elements to add them to your test
- Run tests step-by-step
- Export tests as YAML

## 📹 Record Test Flows

Maestro can record your interactions and generate test flows:

```powershell
npm run maestro:record
```

Then interact with your app. When done, press Ctrl+C to save the recording.

## 🔧 Configuration

### Update App ID

Edit `.maestro/config.yaml` and each flow file with your actual app package name:

**For React Native/Expo:**
- Check `app.json` or `app.config.js` for your `package` (Android) or `bundleIdentifier` (iOS)
- Default Expo format: `com.yourcompany.yourapp`

**Example:**
```yaml
appId: com.concordia.githappens  # Android
# or
appId: com.concordia.GitHappens  # iOS
```

### Using testID vs text

Maestro can find elements by:
- **testID** (recommended): `id: "search-input"`
- **Text**: `text: "Search for building"`
- **Accessibility label**: `label: "Search"`

Our components already have testIDs:
- `map-container`, `search-input`, `search-bar`
- `directions-button`, `start-navigation-button`
- `recenter-button`, `campus-toggle-button`
- `route-polyline`, `outdoor-view`

## 🎯 Test Flow Syntax

### Basic Commands

```yaml
# Launch app
- launchApp:
    clearState: true
    permissions:
      location: allow

# Assert element is visible
- assertVisible: "Button Text"
- assertVisible:
    id: "element-testid"
    timeout: 3000

# Tap element
- tapOn: "Button"
- tapOn:
    id: "button-id"

# Input text
- inputText: "Hello World"

# Wait
- waitForAnimationToEnd
- waitForAnimationToEnd:
    timeout: 2000

# Scroll
- scrollUntilVisible:
    element: "Bottom Element"
    direction: DOWN

# Take screenshot
- takeScreenshot: screenshot-name

# Run JavaScript
- runScript: console.log("test")
```

### Conditional Logic

```yaml
# If element exists
- tapOn:
    text: "Optional Button"
    optional: true

# Repeat action
- repeat:
    times: 3
    commands:
      - tapOn: "Next"
```

## 📊 Continuous Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm install
      
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
      
      - name: Run Maestro tests
        run: |
          export PATH="$PATH:$HOME/.maestro/bin"
          maestro test .maestro
```

## 🐛 Troubleshooting

### "maestro: command not found"
- **Restart your terminal after installation** (most common fix)
- Check if `C:\Users\Samy\maestro\bin` is in your PATH
- Try full path: `C:\Users\Samy\maestro\bin\maestro.bat --version`
- Create alias in PowerShell profile:
  ```powershell
  Set-Alias maestro "C:\Users\Samy\maestro\bin\maestro.bat"
  ```

### "Java 17 or higher is required"
- Install Java 17+: https://adoptium.net/temurin/releases/?version=17
- Or use winget: `winget install -e --id Microsoft.OpenJDK.17`
- Restart PowerShell after installation
- Verify: `java -version`

### "No devices found"
- Make sure an emulator/simulator is running
- For physical device, check USB debugging is enabled
- Run `adb devices` (Android) or `xcrun simctl list` (iOS) to verify

### "Cannot find element"
- Use Maestro Studio to inspect element hierarchy
- Try using text instead of testID: `text: "Button Text"`
- Add timeout: `timeout: 5000`

### Tests fail with "App not responding"
- Increase timeouts in flow files
- Make sure your backend server is running (for directions tests)
- Check if app is fully loaded before running tests

### "Permission denied" errors
- Make sure app has location permissions enabled
- On emulator, manually grant permissions first

## 📝 Writing New Tests

### 1. Use Maestro Studio
```powershell
maestro studio
```
Click on elements in the GUI to add them to your test.

### 2. Record Your Actions
```powershell
maestro record .maestro/new-test.yaml
```
Interact with your app, then save.

### 3. Write YAML Manually
Create a new `.yaml` file in `.maestro/` folder:

```yaml
appId: com.githappens
---
- launchApp
- tapOn: "My Button"
- assertVisible: "Success Message"
```

### 4. Run Your Test
```powershell
maestro test .maestro/new-test.yaml
```

## 🎓 Best Practices

1. **Use testIDs** - More reliable than text (text can change with translations)
2. **Add timeouts** - Give elements time to appear
3. **Clear state** - Start each test with a clean app state
4. **Small, focused tests** - One feature per flow file
5. **Use descriptive names** - Make flow files easy to understand
6. **Test offline** - Add flows for error states
7. **Screenshot on failure** - Add `takeScreenshot` before critical assertions

## 📚 Resources

- Official Docs: https://maestro.mobile.dev
- Examples: https://github.com/mobile-dev-inc/maestro/tree/main/maestro-test/src/test/resources
- CLI Reference: https://maestro.mobile.dev/reference/commands

## ⚡ Maestro vs Detox Comparison

| Feature | Maestro | Detox |
|---------|---------|-------|
| **Installation** | ✅ Simple (single command) | ❌ Complex (requires build config) |
| **Test Format** | ✅ YAML (easy to read) | ❌ JavaScript/TypeScript |
| **Setup Time** | ✅ 5 minutes | ❌ 30-60 minutes |
| **Build Required** | ✅ No (uses running app) | ❌ Yes (special test build) |
| **Visual Builder** | ✅ Maestro Studio | ❌ None |
| **Cross-Platform** | ✅ Same tests for iOS/Android | ⚠️ Platform-specific |
| **Record Tests** | ✅ Yes | ❌ No |
| **Learning Curve** | ✅ Low | ❌ High |
| **CI/CD** | ✅ Easy | ⚠️ Moderate |
| **Speed** | ⚠️ Moderate | ✅ Fast |
| **Advanced Features** | ⚠️ Limited | ✅ Full control |

**Verdict:** Maestro is perfect for quick E2E testing without complex setup!

---

## 🎯 Next Steps

1. ✅ Install Maestro: `iwr "https://get.maestro.mobile.dev/install.ps1" -OutFile install.ps1; .\install.ps1`
2. ✅ Update app IDs in `.maestro/*.yaml` files
3. ✅ Start your app (Expo/emulator)
4. ✅ Run tests: `npm run maestro:test`
5. ✅ Try Maestro Studio: `npm run maestro:studio`

Happy Testing! 🎉
