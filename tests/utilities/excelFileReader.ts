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
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

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
    }
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

}