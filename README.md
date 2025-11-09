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
│       └── excelColumns.ts             # Type definitions
├── screenshots/                         # Auto-generated screenshots
├── report-summary/
│   └── summaries/                      # Execution reports (HTML/JSON)
└── playwright.config.ts                # Playwright configuration
```

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
- **Other**: WAIT, UPLOADFile, TAKEFullPageScreenshot, CLOSEPAGE

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
