import { test } from '@playwright/test';
import { actionHandler } from '../utilities/actionHandler';
import { excelTestDataSourcev2, readTestCaseTemplate } from '../utilities/excelFileReader';
import { ExecutionSummary } from '../utilities/executionSummary';



test('Execute Excel TestCases on headed chrome version 2', async ({ page }) => {

    const fileNamePath = "tests/testScript/TestTemplatev2.xlsx";

    // Initialize execution summary
    const executionSummary = new ExecutionSummary();

    // 1. Create the Excel data source instance
    const excelDataSource = new excelTestDataSourcev2(fileNamePath);
    
    // 2. Get filtered sheet names (with validation)
    const filteredSheetNames = excelDataSource.getFilteredSheetNames('Test');
    
    for (const sheetName of filteredSheetNames) {
        console.log(`\n📄 Running test suite: ${sheetName}`);

        // Start tracking this test case
        executionSummary.startTestCase(sheetName);

        try {
            // 3. Create per-sheet handler with execution summary
            const stepAction = new actionHandler(page, sheetName, executionSummary, fileNamePath);
            const testCaseReader = new readTestCaseTemplate(stepAction);

            // 4. Execute steps in sheet
            await testCaseReader.readTestSteps(excelDataSource.getFilePath(), sheetName);
            
            console.log(`✅ ${sheetName} completed successfully`);
        } catch (error) {
            console.error(`❌ ${sheetName} failed:`, error);
            // Error is already recorded in executionSummary by actionHandler
        } finally {
            // End tracking this test case
            executionSummary.endTestCase(sheetName);
        }
    }

    // Print execution summary to console
    console.log('\n' + '='.repeat(80));
    executionSummary.printSummary();
    
    // Save summary to JSON file
    const jsonPath = executionSummary.saveSummaryToFile();
    console.log(`📁 Summary saved to: ${jsonPath}`);
    
    // Save summary to HTML file
    const htmlPath = executionSummary.saveHTMLSummary();
    console.log(`📊 HTML Summary saved to: ${htmlPath}`);
    console.log('='.repeat(80) + '\n');
    
    // Fail the Playwright test if any test cases failed
    if (executionSummary.hasFailures()) {
        const failedCount = executionSummary.getFailedCount();
        throw new Error(`Test execution failed: ${failedCount} test case(s) failed. Check the execution summary above for details.`);
    }
});