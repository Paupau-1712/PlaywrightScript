import * as XLSX from 'xlsx';
import { actionHandler } from './actionHandler';


export class readTestCaseTemplate {
  public performStepFromExcel: actionHandler;

  constructor(performStep: actionHandler) {
    this.performStepFromExcel = performStep;
  }


  async readTestSteps(filePath: string, sheetName: string) {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];
    
    // Check if sheet exists
    if (!sheet) {
      console.error(`\n❌ ERROR: Sheet "${sheetName}" not found in Excel file!`);
      throw new Error(`Sheet "${sheetName}" does not exist in ${filePath}`);
    }
    
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    // Validate that the sheet has test steps
    if (!data || data.length === 0) {
      console.error(`\n❌ ERROR: No test steps found in sheet "${sheetName}"!`);
      console.error(`   The sheet appears to be empty or has no data rows.`);
      console.error(`   Please check that the sheet contains test steps with the required columns:\n`);
      console.error(`   - STEP, STEPDESCRIPTION, LOCATORPATHTYPE, LOCATORPATH, ACTIONTYPE, INPUTDATA\n`);
      throw new Error(`No test steps found in sheet "${sheetName}". Sheet is empty or missing data.`);
    }

    console.log(`📋 Reading ${data.length} test step(s) from sheet "${sheetName}"`);
    let executedSteps = 0;

    for (const row of data) {
      const testStepFromExcel = row["STEP"];
      const stepDescriptionFromExcel = row["STEPDESCRIPTION"];
      const locatorPathTypeFromExcel = row["LOCATORPATHTYPE"];
      const locatorPathFromExcel = row["LOCATORPATH"];
      const actionTypeFromExcel = row["ACTIONTYPE"];
      const inputDataFromExcel = row["INPUTDATA"];

      await this.performStepFromExcel.performStep({
        step: testStepFromExcel,
        stepDescription: stepDescriptionFromExcel,
        locatorPathType: locatorPathTypeFromExcel,
        locatorPath: locatorPathFromExcel,
        actionType: actionTypeFromExcel,
        inputData: inputDataFromExcel
      });
      
      executedSteps++;
    }
    
    // Verify all steps were executed
    if (executedSteps !== data.length) {
      console.error(`\n❌ ERROR: Test script did not complete fully!`);
      console.error(`   Expected ${data.length} steps, but only ${executedSteps} were executed.`);
      throw new Error(`Test script "${sheetName}" incomplete: ${executedSteps}/${data.length} steps executed.`);
    }
    
    console.log(`✅ Successfully executed all ${executedSteps} steps in "${sheetName}"\n`);
  }

}

export class excelTestDataSource {

  getFilePath(): string {
    return "tests/testScript/TestTemplatev2.xlsx";
  }
  getSheetName(): string {
    return "SampleTemplate";
  }
  getSheetNames(testCaseName: string): string[] {
    const filePath = this.getFilePath();
    const workbook = XLSX.readFile(filePath,{cellDates:true}); 
    console.log("Latest SheetNames :",workbook.SheetNames);
   return workbook.SheetNames.filter(name => name.startsWith(testCaseName));
  }

}
export class excelTestDataSourcev2 {

workbook: XLSX.WorkBook;

  constructor(private filePath: string) {
    this.workbook = XLSX.readFile(filePath, { cellDates: true });
  }

  getFilePath(): string {
    return this.filePath;
  }

  getSheetNames(): string[] {
    return this.workbook.SheetNames;
  }

  getSheetData(sheetName: string): XLSX.WorkSheet | undefined {
    return this.workbook.Sheets[sheetName];
  }

  /**
   * Filter and validate sheet names based on criteria
   * @param filterPrefix - The prefix to filter sheet names (e.g., 'Test', 'SauceDemo')
   * @returns Array of filtered sheet names
   * @throws Error if no sheets match the filter criteria
   */
  getFilteredSheetNames(filterPrefix: string): string[] {
    const allSheets = this.getSheetNames();
    const filteredSheets = allSheets.filter(name => name.startsWith(filterPrefix));
    
    // Validate that at least one sheet was found
    if (filteredSheets.length === 0) {
      const availableSheets = allSheets.join(', ');
      console.error('\n❌ ERROR: No test cases found!');
      console.error(`   Filter criteria: Sheets starting with '${filterPrefix}'`);
      console.error(`   Available sheets in Excel: ${availableSheets}`);
      console.error(`   Please check:`);
      console.error(`   1. Sheet names match the filter (currently: '${filterPrefix}')`);
      console.error(`   2. Excel file path is correct: ${this.filePath}`);
      console.error(`   3. Test case sheets exist in the Excel file\n`);
      throw new Error(`No test cases found matching filter '${filterPrefix}'. Available sheets: ${availableSheets}`);
    }
    
    console.log(`\n📊 Found ${filteredSheets.length} test case(s): ${filteredSheets.join(', ')}\n`);
    return filteredSheets;
  }

}