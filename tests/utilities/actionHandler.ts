import { expect, Locator, Page } from '@playwright/test';
import { rowStep } from './excelColumns';
import { ExecutionSummary } from './executionSummary';
import * as XLSX from 'xlsx';

// Import Node.js standard modules
import * as fs from 'fs';
import * as path from 'path';

export class actionHandler {
  public page: Page;
  public currentSheetName: string;
  public baseScreenshotDir: string;
  public executionSummary?: ExecutionSummary;
  public excelFilePath: string;


  constructor(
    page: Page, 
    sheetName: string, 
    executionSummary?: ExecutionSummary,
    excelFilePath: string = "tests/testScript/TestTemplatev2.xlsx"
  ) {
    this.page = page;
    this.currentSheetName = sheetName;
    this.executionSummary = executionSummary;
    this.excelFilePath = excelFilePath;

    const today = new Date().toISOString().split('T')[0];
    this.baseScreenshotDir = path.join('screenshots', today, this.currentSheetName);

    this.ensureScreenshotDirectoryExists();
  }

  private ensureScreenshotDirectoryExists(): void {
    if (!fs.existsSync(this.baseScreenshotDir)) {
      fs.mkdirSync(this.baseScreenshotDir, { recursive: true });
    }
  }

  public resolveLocator(page: Page, locatorPathType: string, locatorPath: any): Locator {

    //insert Here
    const cleanedPathType = (locatorPathType ?? '').replace(/^['"]|['"]$/g, '').trim();
    const cleanedPath = typeof locatorPath === 'string'
      ? locatorPath.replace(/^['"]|['"]$/g, '').trim()
      : locatorPath;


    switch (cleanedPathType) {

      case 'locator':
        return page.locator(cleanedPath);

      case 'getByRole':
        return page.getByRole(cleanedPath);

      case 'getByText':
        return page.getByText(cleanedPath);

      case 'getByTestId':
        return page.getByTestId(cleanedPath);

      case 'getByLabel':
        return page.getByLabel(cleanedPath);

      case 'getByBlaceholder':
        return page.getByPlaceholder(cleanedPath);

      case 'getByAltText':
        return page.getByAltText(cleanedPath);

      case 'getByTitle':
        return page.getByTitle(cleanedPath);

      default:
        throw new Error(`❌ Unsupported locatorPathType: ${locatorPathType}`);
    }
  }

  /**
   * Get and execute module steps from the Module sheet
   * @param moduleName - The name of the module to execute
   * @param excelFilePath - Path to the Excel file containing the Module sheet
   */
  async getModule(moduleName: string, excelFilePath: string): Promise<void> {
    console.log(`\n📦 Loading module: "${moduleName}"`);
    
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(excelFilePath);
      
      // Check if Module sheet exists
      if (!workbook.SheetNames.includes('Module')) {
        throw new Error(`Module sheet not found in Excel file: ${excelFilePath}`);
      }
      
      // Read the Module sheet
      const moduleSheet = workbook.Sheets['Module'];
      const moduleData: any[] = XLSX.utils.sheet_to_json(moduleSheet);
      
      if (!moduleData || moduleData.length === 0) {
        throw new Error(`Module sheet is empty in: ${excelFilePath}`);
      }
      
      // Construct the start and end markers
      const startMarker = `${moduleName}_Start`;
      const endMarker = `${moduleName}_End`;
      
      // Find the start and end indices
      let startIndex = -1;
      let endIndex = -1;
      
      for (let i = 0; i < moduleData.length; i++) {
        const rowModuleName = moduleData[i]['MODULENAME'] || moduleData[i]['ModuleName'] || moduleData[i]['moduleName'];
        
        if (rowModuleName && rowModuleName.trim() === startMarker) {
          startIndex = i;
        }
        
        if (rowModuleName && rowModuleName.trim() === endMarker) {
          endIndex = i;
          break;
        }
      }
      
      // Validate that both markers were found
      if (startIndex === -1) {
        const availableModules = [...new Set(moduleData.map(row => {
          const name = row['MODULENAME'] || row['ModuleName'] || row['moduleName'];
          return name ? name.replace(/_Start$|_End$/g, '') : null;
        }).filter(Boolean))];
        
        throw new Error(
          `Module start marker "${startMarker}" not found in Module sheet.\n` +
          `   Available modules: ${availableModules.join(', ')}`
        );
      }
      
      if (endIndex === -1) {
        throw new Error(`Module end marker "${endMarker}" not found in Module sheet.`);
      }
      
      if (startIndex >= endIndex) {
        throw new Error(`Module "${moduleName}" has invalid markers: Start must come before End.`);
      }
      
      // Extract steps between Start and End (excluding the markers themselves)
      const moduleSteps = moduleData.slice(startIndex + 1, endIndex);
      
      if (moduleSteps.length === 0) {
        throw new Error(`Module "${moduleName}" has no steps between Start and End markers.`);
      }
      
      console.log(`   Found ${moduleSteps.length} step(s) in module "${moduleName}"`);
      
      // Execute each step in the module
      for (const moduleRow of moduleSteps) {
        const moduleStep: rowStep = {
          step: moduleRow['STEP'],
          stepDescription: moduleRow['STEPDESCRIPTION'] || 'Module step',
          locatorPathType: moduleRow['LOCATORPATHTYPE'],
          locatorPath: moduleRow['LOCATORPATH'],
          actionType: moduleRow['ACTIONTYPE'],
          inputData: moduleRow['INPUTDATA']
        };
        
        console.log(`   → Executing module step ${moduleStep.step}: ${moduleStep.stepDescription}`);
        
        try {
          // Execute the action directly
          await this.executeAction(moduleStep);
          
          // Record successful module step execution
          if (this.executionSummary) {
            this.executionSummary.recordStep(
              this.currentSheetName,
              moduleStep.step,
              `[Module: ${moduleName}] ${moduleStep.stepDescription}`,
              moduleStep.actionType || 'UNKNOWN',
              'passed'
            );
          }
          
          // Take screenshot after each module step
          const screenshotFileName = `Module_${moduleName}_Step_${moduleStep.step}_${moduleStep.actionType}.png`;
          const screenshotPath = path.join(this.baseScreenshotDir, screenshotFileName);
          await this.page.screenshot({ path: screenshotPath });
          console.log(`   📸 Screenshot taken: ${screenshotFileName}`);
          
        } catch (error) {
          // Record failed module step execution
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          if (this.executionSummary) {
            this.executionSummary.recordStep(
              this.currentSheetName,
              moduleStep.step,
              `[Module: ${moduleName}] ${moduleStep.stepDescription}`,
              moduleStep.actionType || 'UNKNOWN',
              'failed',
              errorMessage
            );
          }
          
          console.error(`   ❌ Module step ${moduleStep.step} failed: ${errorMessage}`);
          throw error; // Re-throw to fail the module
        }
      }
      
      console.log(`✅ Module "${moduleName}" completed successfully\n`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Module "${moduleName}" failed: ${errorMsg}`);
      throw error;
    }
  }

  async performStep(_rowStep: rowStep) {
    const {

      step,
      stepDescription,
      actionType,
      locatorPathType,
      locatorPath,
      inputData
    } = _rowStep;

    console.log(`Executing Step ${step}: ${stepDescription}`);

    try {
      await this.executeAction(_rowStep);
      
      // Record successful step execution
      if (this.executionSummary) {
        this.executionSummary.recordStep(
          this.currentSheetName,
          step,
          stepDescription,
          actionType || 'UNKNOWN',
          'passed'
        );
      }
    } catch (error) {
      // Record failed step execution
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (this.executionSummary) {
        this.executionSummary.recordStep(
          this.currentSheetName,
          step,
          stepDescription,
          actionType || 'UNKNOWN',
          'failed',
          errorMessage
        );
      }
      
      console.error(`❌ Step ${step} failed: ${errorMessage}`);
      throw error; // Re-throw to fail the test
    } finally {
      // ✅ Take screenshot after every step
      const screenshotFileName = `Step_${step}_${actionType}.png`;
      const screenshotPath = path.join(this.baseScreenshotDir, screenshotFileName);
      await this.page.screenshot({ path: screenshotPath });
      console.log(`📸 Screenshot taken for Step ${step}: ${screenshotPath}`);
    }
  }

  private async executeAction(_rowStep: rowStep) {
    const {
      step,
      stepDescription,
      actionType,
      locatorPathType,
      locatorPath,
      inputData
    } = _rowStep;

    switch (actionType) {
      //Module Execution
      case 'GETMODULE': {
        if (!inputData) {
          throw new Error(`Step ${step}: GETMODULE requires a module name in INPUTDATA column`);
        }
        await this.getModule(inputData, this.excelFilePath);
        console.log(`✅ Step ${step} completed: Executed module "${inputData}"`);
        break;
      }

      //Function Elements
      case 'OPENURL': {
        await this.page.goto(inputData ?? '');
        console.log(`✅ Step ${step} completed: Opened URL ${inputData}`);
        break;
      }

      case 'FILL': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.fill(inputData ?? '');
        console.log(`✅ Step ${step} completed: Filled input with data.`);
        break;
      }
      case 'CLICKBUTTON': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.click();
        console.log(`✅ Step ${step} completed: Clicked on element.`);
        break;
      }
      case 'WAIT': {
        const waitTime = parseInt(inputData ?? '1000', 10);
        await this.page.waitForTimeout(waitTime);
        console.log(`✅ Step ${step} completed: Waited for ${waitTime} ms.`);
        break;
      }
      case 'DOUBLECLICK': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.dblclick();
        console.log(`✅ Step ${step} completed: Double clicked on element.`);
        break;
      }
      case 'CLEARFIELD': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.fill(''); // Clear by filling with empty string
        console.log(`✅ Step ${step} completed: Cleared the field.`);
        break;
      }
      case 'SELECTOPTION': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.selectOption({ label: inputData ?? '' });
        console.log(`✅ Step ${step} completed: Selected option ${inputData}.`);
        break;
      }
      case 'HOVER': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.hover();
        console.log(`✅ Step ${step} completed: Hovered over element.`);
        break;
      }
      case 'RIGHTCLICK': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.click({ button: 'right' });
        console.log(`✅ Step ${step} completed: Right clicked on element.`);
        break;
      }
      case 'PRESSKEY': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.press(inputData ?? '');
        console.log(`✅ Step ${step} completed: Pressed key ${inputData}.`);
        break;
      }
      case 'CHECKCheckbox': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.check();
        console.log(`✅ Step ${step} completed: Checked the checkbox.`);
        break;
      }
      case 'UNCHECKCheckbox': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.uncheck();
        console.log(`✅ Step ${step} completed: Unchecked the checkbox.`);
        break;
      }
      case 'UPLOADFile': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.setInputFiles(inputData ?? '');
        console.log(`✅ Step ${step} completed: Uploaded file ${inputData}.`);
        break;
      }

      case 'TAKEFullPageScreenshot': {
        const screenshotPath = inputData ?? `fullpage_screenshot_step_${step}.png`;
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`✅ Step ${step} completed: Took full page screenshot at ${screenshotPath}.`);
        break;
      }
      case 'RADIOButtonSelect': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.check();
        console.log(`✅ Step ${step} completed: Selected the radio button.`);
        break;
      }
      case 'RADIOBUttonDeselect': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await locator.uncheck();
        console.log(`✅ Step ${step} completed: Deselected the radio button.`);
        break;
      }
      case 'CLOSEPAGE': {
        await this.page.close();
        console.log(`✅ Step ${step} completed: Closed the page.`);
        break;
      }


      //Assertions/Validations
      case 'ValidateElementtobeVisible': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        try {
          await expect(locator).toBeVisible({ timeout: 5000 }); // optional timeout
          console.log(`✅ Step ${step} completed: Element is visible.`);
        } catch (error) {
          if (error instanceof Error) {
            console.error(`❌ Step ${step} failed: Element is NOT visible. Details:`, error.message);
          } else {
            console.error(`❌ Step ${step} failed: Element is NOT visible. Details:`, error);
          }
          throw error; // rethrow so the test still fails
        }

        break;
      }
      case 'ValidateElementtobeHidden': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await expect(locator).toBeHidden();
        console.log(`✅ Step ${step} completed: Element is hidden.`);
        break;
      }
      case 'ValidateElementtobeEnabled': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await expect(locator).toBeEnabled();
        console.log(`✅ Step ${step} completed: Element is enabled.`);
        break;
      }
      case 'ValidateElementtobeDisabled': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await expect(locator).toBeDisabled();
        console.log(`✅ Step ${step} completed: Element is disabled.`);
        break;
      }
      case 'ValidateElementtobeEmpty': {
        const locator = this.resolveLocator(this.page, locatorPathType, locatorPath);

        await expect(locator).toBeEmpty();
        console.log(`✅ Step ${step} completed: Element is empty.`);
        break;
      }

      default: {
        const errorMsg = `❌ Unsupported or unimplemented action type: "${actionType}"`;
        console.error(errorMsg);
        console.error(`   Step ${step}: ${stepDescription}`);
        console.error(`   Available actions: OPENURL, FILL, CLICKBUTTON, WAIT, GETMODULE (not implemented), etc.`);
        console.error(`   Please check your Excel file or implement the "${actionType}" action in actionHandler.ts\n`);
        throw new Error(`Unsupported action type: "${actionType}" at Step ${step}`);
      }

    }
  }

}
