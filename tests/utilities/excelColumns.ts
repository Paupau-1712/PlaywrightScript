
export interface rowStep 
{
  
  step: number;
  stepDescription: string;
  locatorPathType: string;
  locatorPath?: string;
  actionType?: string;
  inputData?: string;
}

export interface modulerowStep {
  [moduleName: string]: rowStep[];

}