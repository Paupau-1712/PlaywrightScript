import { expect, Locator, Page } from '@playwright/test';
import { rowStep } from './excelColumns';
import { ExecutionSummary } from './executionSummary';

// Import Node.js standard modules
import * as fs from 'fs';
import * as path from 'path';

export class actionHandler {
  public page: Page;
  public currentSheetName: string;
  public baseScreenshotDir: string;
  public executionSummary?: ExecutionSummary;


  constructor(page: Page, sheetName: string, executionSummary?: ExecutionSummary) {
    this.page = page;
    this.currentSheetName= sheetName;
    this.executionSummary = executionSummary;

    const today = new Date().toISOString().split('T')[0]; // e.g., 2025-11-09
    this.baseScreenshotDir = path.join('screenshots', today, this.currentSheetName);

    // ✅ Create folder if not exists
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

  // async getModuleName(moduleName: string) {
  //   console.log(`Accessing module: ${moduleName}`);
  // }

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
      // case 'GetModule': {
      //   console.log(`✅ Step ${step} completed: Accessed module ${inputData}`);
      //   break;
      // }

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

    }
  }

}
