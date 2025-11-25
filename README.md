# Playwright Excel-Driven Test Automation Framework

## 📋 Overview
This is a data-driven test automation framework using Playwright that reads test cases from Excel files and executes them with automatic screenshot capture and execution summaries.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Project Structure
```
PlaywrightScript/
├── tests/
│   ├── executeTestCase/
│   │   └── executeTestCase.spec.ts    # Main test runner
│   ├── testScript/
│   │   └── TestTemplatev2.xlsx        # Excel test cases
│   └── utilities/
│       ├── actionHandler.ts            # Step execution handler
│       ├── excelFileReader.ts          # Excel data reader
│       ├── executionSummary.ts         # Summary generator
│       ├── moduleHandler.ts            # Module loader
│       ├── testConfig.ts               # Test configuration
│       └── excelColumns.ts             # Type definitions
├── screenshots/                         # Auto-generated screenshots
├── report-summary/
│   └── summaries/                      # Execution reports (HTML/JSON)
└── playwright.config.ts                # Playwright configuration
```

## ⚙️ Configuration

### Test Configuration (`tests/utilities/testConfig.ts`)
Centralized configuration for test execution. Modify this file instead of hardcoding values:

```typescript
// Excel file path
TestConfig.EXCEL_FILE_PATH = "tests/testScript/TestTemplatev2.xlsx"

// Exclude sheets starting with these prefixes
TestConfig.EXCLUDED_SHEET_PREFIXES = ['Module', 'ActionList', '_Template']

// Exclude specific sheet names
TestConfig.EXCLUDED_SHEET_NAMES = ['', 'SampleTemplate', 'README']

// Optional: Include only specific prefixes (leave empty to include all)
TestConfig.INCLUDE_SHEET_PREFIXES = []  // e.g., ['TestCase', 'SauceDemo']
```

**How it works:**
- All sheets are executed as test cases by default
- Sheets matching `EXCLUDED_SHEET_PREFIXES` or `EXCLUDED_SHEET_NAMES` are skipped
- If `INCLUDE_SHEET_PREFIXES` is set, only matching sheets are executed
- Modules (sheets starting with `Module_`) are always excluded from test execution

## 📝 Test Structure

### Excel Test Template
Tests are defined in `tests/testScript/TestTemplatev2.xlsx` with sheets named `TestCase_*`. Each sheet contains columns:
- **STEP**: Step number
- **STEPDESCRIPTION**: What the step does
- **LOCATORPATHTYPE**: Locator method (locator, getByRole, getByText, etc.)
- **LOCATORPATH**: Element selector
- **ACTIONTYPE**: Action to perform (OPENURL, FILL, CLICKBUTTON, ValidateElementtobeVisible, etc.)
- **INPUTDATA**: Input value for the action

### Supported Actions
- **Navigation**: OPENURL
- **Input**: FILL, CLEARFIELD
- **Interaction**: CLICKBUTTON, DOUBLECLICK, RIGHTCLICK, HOVER, PRESSKEY
- **Selection**: SELECTOPTION, CHECKCheckbox, UNCHECKCheckbox, RADIOButtonSelect
- **Validation**: ValidateElementtobeVisible, ValidateElementtobeHidden, ValidateElementtobeEnabled, ValidateElementtobeDisabled
- **Modules**: GETMODULE (execute reusable step sequences)
- **Other**: WAIT, UPLOADFile, TAKEFullPageScreenshot, CLOSEPAGE

## 📦 Reusable Modules (GETMODULE)

### What are Modules?
Modules are reusable test step sequences stored as separate Excel sheets. Instead of repeating common steps (like login) in every test case, you create a module once and reuse it everywhere.

### Creating a Module
1. Create a new sheet in Excel starting with `Module_` (e.g., `Module_Login`)
2. Define steps using the same columns as test cases:
   - STEP, STEPDESCRIPTION, LOCATORPATHTYPE, LOCATORPATH, ACTIONTYPE, INPUTDATA
3. Save the Excel file

### Using a Module
In your test case, add a step with:
- **ACTIONTYPE**: `GETMODULE`
- **INPUTDATA**: Module name (e.g., `Module_Login`)

**Example Test Case:**
```
Step 1: OPENURL        → https://example.com
Step 2: GETMODULE      → Module_Login          ← Executes Module_Login steps
Step 3: CLICKBUTTON    → Dashboard button      ← Continues after module
Step 4: ValidateElementtobeVisible → Welcome message
```

**Example Module (Module_Login sheet):**
```
Step 1: FILL           → #username → standard_user
Step 2: FILL           → #password → secret_sauce
Step 3: CLICKBUTTON    → button[type="submit"]
Step 4: ValidateElementtobeVisible → .inventory_container
```

### Module Benefits
- ✅ **DRY Principle**: Write once, use everywhere
- ✅ **Maintainability**: Update login in one place, affects all tests
- ✅ **Nested Modules**: Modules can call other modules (up to 5 levels)
- ✅ **Same Actions**: All 30+ actions work identically in modules
- ✅ **Auto-reporting**: Module steps appear in execution summaries
- ✅ **Screenshots**: Captured for each module step

## ▶️ Running Tests

### Run all test cases:
```bash
npx playwright test tests/executeTestCase/executeTestCase.spec.ts --headed
```

### Run on specific browser:
```bash
npx playwright test tests/executeTestCase/executeTestCase.spec.ts --headed --project=Chrome
```

### Run with single worker (sequential):
```bash
npx playwright test tests/executeTestCase/executeTestCase.spec.ts --headed --project=Chrome --workers=1
```

## 📊 Execution Summary

After each test run, the framework automatically generates:

### 1. Console Summary
Beautiful formatted output showing:
- Overall statistics (test cases passed/failed)
- Step-level success rates
- Individual test case details
- Duration and timestamps

### 2. HTML Report
Located in `report-summary/summaries/execution-summary-[timestamp].html`
- Visual dashboard with statistics
- Tabulated step details with screenshots
- Color-coded pass/fail indicators
- Direct links to screenshots
- Clickable folder links to view all screenshots

### 3. JSON Report
Located in `report-summary/summaries/execution-summary-[timestamp].json`
- Complete execution data
- Programmatic access to results
- Suitable for CI/CD integration

## 📸 Screenshots
- Automatically captured after every step
- Organized by date and test case: `screenshots/[date]/[TestCase]/`
- Linked in HTML reports for easy access

## 🔍 Key Features
- ✅ **Excel-driven**: Non-technical users can create test cases
- ✅ **Automatic screenshots**: Every step captured
- ✅ **Detailed reporting**: HTML and JSON formats
- ✅ **Error tracking**: Failed steps with error messages
- ✅ **Multi-browser**: Chrome, Firefox, WebKit support
- ✅ **Parallel execution**: Run tests concurrently
- ✅ **Step-by-step validation**: Each action verified

## 📌 Assumptions
- Excel file follows the defined template structure
- Test case sheets are named with prefix `TestCase_`
- Locators are valid and accessible when tests run
- Web application is available at the URL specified in test data
- Screenshots directory has write permissions

## 🛠️ Configuration
Edit `playwright.config.ts` to customize:
- Browser settings
- Timeouts
- Screenshots options
- Test directories
- Report output paths
