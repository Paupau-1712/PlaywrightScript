import * as fs from 'fs';
import * as path from 'path';

interface StepResult {
  step: number;
  stepDescription: string;
  actionType: string;
  status: 'passed' | 'failed';
  error?: string;
  timestamp: Date;
}

interface TestCaseResult {
  testCaseName: string;
  status: 'passed' | 'failed';
  steps: StepResult[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
  errorStep?: number;
  errorMessage?: string;
}

export class ExecutionSummary {
  private testCases: Map<string, TestCaseResult> = new Map();
  private overallStartTime: Date;
  private executionDate: string;

  constructor() {
    this.overallStartTime = new Date();
    this.executionDate = new Date().toISOString().split('T')[0];
  }

  /**
   * Start tracking a new test case
   */
  startTestCase(testCaseName: string): void {
    this.testCases.set(testCaseName, {
      testCaseName,
      status: 'passed',
      steps: [],
      startTime: new Date()
    });
  }

  /**
   * Record a step execution
   */
  recordStep(
    testCaseName: string,
    step: number,
    stepDescription: string,
    actionType: string,
    status: 'passed' | 'failed',
    error?: string
  ): void {
    const testCase = this.testCases.get(testCaseName);
    if (testCase) {
      testCase.steps.push({
        step,
        stepDescription,
        actionType,
        status,
        error,
        timestamp: new Date()
      });

      if (status === 'failed') {
        testCase.status = 'failed';
        testCase.errorStep = step;
        testCase.errorMessage = error;
      }
    }
  }

  /**
   * End tracking a test case
   */
  endTestCase(testCaseName: string): void {
    const testCase = this.testCases.get(testCaseName);
    if (testCase) {
      testCase.endTime = new Date();
      testCase.duration = testCase.endTime.getTime() - testCase.startTime.getTime();
    }
  }

  /**
   * Get summary statistics
   */
  getSummaryStats() {
    const testCases = Array.from(this.testCases.values());
    const totalTestCases = testCases.length;
    const passedTestCases = testCases.filter(tc => tc.status === 'passed').length;
    const failedTestCases = totalTestCases - passedTestCases;
    
    const totalSteps = testCases.reduce((sum, tc) => sum + tc.steps.length, 0);
    const passedSteps = testCases.reduce(
      (sum, tc) => sum + tc.steps.filter(s => s.status === 'passed').length,
      0
    );
    const failedSteps = totalSteps - passedSteps;

    const overallDuration = new Date().getTime() - this.overallStartTime.getTime();

    return {
      totalTestCases,
      passedTestCases,
      failedTestCases,
      totalSteps,
      passedSteps,
      failedSteps,
      successRate: totalSteps > 0 ? (passedSteps / totalSteps * 100).toFixed(2) : '0',
      duration: this.formatDuration(overallDuration),
      durationMs: overallDuration
    };
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Print summary to console with beautiful formatting
   */
  printSummary(): void {
    const stats = this.getSummaryStats();
    const testCases = Array.from(this.testCases.values());

    const boxWidth = 80;
    const line = '═'.repeat(boxWidth);
    const doubleLine = '═'.repeat(boxWidth);

    console.log('\n');
    console.log('╔' + doubleLine + '╗');
    console.log('║' + this.centerText('🎯 TEST EXECUTION SUMMARY', boxWidth) + '║');
    console.log('╠' + doubleLine + '╣');
    console.log('║' + this.centerText(`Execution Date: ${this.executionDate}`, boxWidth) + '║');
    console.log('║' + this.centerText(`Duration: ${stats.duration}`, boxWidth) + '║');
    console.log('╚' + doubleLine + '╝');

    // Overall Statistics
    console.log('\n┌' + line + '┐');
    console.log('│' + this.centerText('📊 OVERALL STATISTICS', boxWidth) + '│');
    console.log('├' + line + '┤');
    console.log('│' + this.padText(`  Test Cases:`, boxWidth) + '│');
    console.log('│' + this.padText(`    Total: ${stats.totalTestCases}`, boxWidth) + '│');
    console.log('│' + this.padText(`    ✅ Passed: ${stats.passedTestCases} (${((stats.passedTestCases/stats.totalTestCases)*100).toFixed(1)}%)`, boxWidth) + '│');
    console.log('│' + this.padText(`    ❌ Failed: ${stats.failedTestCases} (${((stats.failedTestCases/stats.totalTestCases)*100).toFixed(1)}%)`, boxWidth) + '│');
    console.log('│' + this.padText('', boxWidth) + '│');
    console.log('│' + this.padText(`  Steps:`, boxWidth) + '│');
    console.log('│' + this.padText(`    Total: ${stats.totalSteps}`, boxWidth) + '│');
    console.log('│' + this.padText(`    ✅ Passed: ${stats.passedSteps}`, boxWidth) + '│');
    console.log('│' + this.padText(`    ❌ Failed: ${stats.failedSteps}`, boxWidth) + '│');
    console.log('│' + this.padText(`    Success Rate: ${stats.successRate}%`, boxWidth) + '│');
    console.log('└' + line + '┘');

    // Individual Test Cases
    console.log('\n┌' + line + '┐');
    console.log('│' + this.centerText('🧪 TEST CASE DETAILS', boxWidth) + '│');
    console.log('└' + line + '┘');

    testCases.forEach((tc, index) => {
      const status = tc.status === 'passed' ? '✅ PASSED' : '❌ FAILED';
      const duration = tc.duration ? this.formatDuration(tc.duration) : 'N/A';
      const passedSteps = tc.steps.filter(s => s.status === 'passed').length;
      const failedSteps = tc.steps.filter(s => s.status === 'failed').length;

      console.log('\n┌' + '─'.repeat(boxWidth) + '┐');
      console.log('│ ' + this.padText(`${tc.testCaseName}`, boxWidth - 2) + ' │');
      console.log('├' + '─'.repeat(boxWidth) + '┤');
      console.log('│ ' + this.padText(`Status: ${status}`, boxWidth - 2) + ' │');
      console.log('│ ' + this.padText(`Duration: ${duration}`, boxWidth - 2) + ' │');
      console.log('│ ' + this.padText(`Steps: ${tc.steps.length} (✅ ${passedSteps} / ❌ ${failedSteps})`, boxWidth - 2) + ' │');

      if (tc.status === 'failed' && tc.errorStep) {
        console.log('├' + '─'.repeat(boxWidth) + '┤');
        console.log('│ ' + this.padText(`❌ FAILED AT STEP ${tc.errorStep}`, boxWidth - 2) + ' │');
        if (tc.errorMessage) {
          const errorLines = this.wrapText(tc.errorMessage, boxWidth - 6);
          errorLines.forEach(line => {
            console.log('│   ' + this.padText(line, boxWidth - 4) + '   │');
          });
        }
      }

      // Show failed steps details
      const failedStepsList = tc.steps.filter(s => s.status === 'failed');
      if (failedStepsList.length > 0) {
        console.log('├' + '─'.repeat(boxWidth) + '┤');
        console.log('│ ' + this.padText('Failed Steps:', boxWidth - 2) + ' │');
        failedStepsList.forEach(step => {
          console.log('│   ' + this.padText(`Step ${step.step}: ${step.stepDescription}`, boxWidth - 4) + '   │');
          console.log('│   ' + this.padText(`Action: ${step.actionType}`, boxWidth - 4) + '   │');
          if (step.error) {
            console.log('│   ' + this.padText(`Error: ${step.error}`, boxWidth - 4) + '   │');
          }
          console.log('│ ' + this.padText('', boxWidth - 2) + ' │');
        });
      }

      console.log('└' + '─'.repeat(boxWidth) + '┘');
    });

    // Final Summary
    console.log('\n╔' + doubleLine + '╗');
    if (stats.failedTestCases === 0) {
      console.log('║' + this.centerText('🎉 ALL TESTS PASSED! 🎉', boxWidth) + '║');
    } else {
      console.log('║' + this.centerText(`⚠️  ${stats.failedTestCases} TEST(S) FAILED`, boxWidth) + '║');
    }
    console.log('║' + this.centerText(`Overall Success Rate: ${stats.successRate}%`, boxWidth) + '║');
    console.log('╚' + doubleLine + '╝');
    console.log('\n');
  }

  /**
   * Save summary to JSON file
   */
  saveSummaryToFile(): string {
    const summaryDir = path.join('report-summary', 'summaries');
    if (!fs.existsSync(summaryDir)) {
      fs.mkdirSync(summaryDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `execution-summary-${timestamp}.json`;
    const filepath = path.join(summaryDir, filename);

    const summary = {
      executionDate: this.executionDate,
      timestamp: new Date().toISOString(),
      statistics: this.getSummaryStats(),
      testCases: Array.from(this.testCases.values())
    };

    fs.writeFileSync(filepath, JSON.stringify(summary, null, 2), 'utf-8');
    
    return filepath;
  }

  /**
   * Generate HTML summary report
   */
  generateHTMLSummary(): string {
    const stats = this.getSummaryStats();
    const testCases = Array.from(this.testCases.values());

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Execution Summary - ${this.executionDate}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .header h1 { font-size: 2em; margin-bottom: 10px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; background: #f8f9fa; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center; }
        .stat-value { font-size: 2.5em; font-weight: bold; color: #667eea; }
        .stat-label { color: #6c757d; margin-top: 5px; }
        .test-cases { padding: 30px; }
        .test-case { background: white; border: 2px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
        .test-case.passed { border-left: 5px solid #28a745; }
        .test-case.failed { border-left: 5px solid #dc3545; }
        .test-case-header { padding: 20px; background: #f8f9fa; display: flex; justify-content: space-between; align-items: center; }
        .test-case-name { font-size: 1.3em; font-weight: bold; }
        .status-badge { padding: 8px 15px; border-radius: 20px; font-weight: bold; color: white; }
        .status-passed { background: #28a745; }
        .status-failed { background: #dc3545; }
        .test-case-body { padding: 20px; }
        .step { padding: 10px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; }
        .step:last-child { border-bottom: none; }
        .step.failed { background: #fff5f5; }
        .step.passed { background: #f0fff4; }
        .step-content { flex: 1; }
        .step-number { font-weight: bold; color: #667eea; }
        .step-action { display: inline-block; padding: 3px 10px; background: #667eea; color: white; border-radius: 12px; font-size: 0.85em; margin-left: 10px; }
        .screenshot-link { display: inline-block; padding: 5px 12px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; font-size: 0.85em; }
        .screenshot-link:hover { background: #218838; }
        .folder-link { display: inline-block; margin: 10px 0; padding: 8px 15px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .folder-link:hover { background: #5568d3; }
        .error-message { color: #dc3545; font-size: 0.9em; margin-top: 5px; padding: 10px; background: #fff5f5; border-radius: 5px; }
        .steps-section { margin-top: 20px; }
        .section-header { font-size: 1.1em; font-weight: bold; margin: 15px 0 10px 0; padding: 10px; background: #f8f9fa; border-left: 4px solid #667eea; }
        .steps-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .steps-table thead { background: #667eea; color: white; }
        .steps-table th { padding: 12px; text-align: left; font-weight: 600; border: 1px solid #dee2e6; }
        .steps-table td { padding: 12px; border: 1px solid #dee2e6; vertical-align: middle; }
        .steps-table tr.passed { background: #f0fff4; }
        .steps-table tr.failed { background: #fff5f5; }
        .steps-table tbody tr:hover { background: #f8f9fa; }
        .step-number-cell { font-weight: bold; color: #667eea; text-align: center; width: 80px; }
        .step-action-cell { text-align: center; width: 150px; }
        .step-status-cell { text-align: center; width: 80px; font-size: 1.5em; }
        .step-screenshot-cell { text-align: center; width: 120px; }
        .action-badge { display: inline-block; padding: 5px 12px; background: #667eea; color: white; border-radius: 12px; font-size: 0.85em; font-weight: 600; }
        .status-icon-passed { color: #28a745; }
        .status-icon-failed { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Test Execution Summary</h1>
            <p>Execution Date: ${this.executionDate}</p>
            <p>Duration: ${stats.duration}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${stats.totalTestCases}</div>
                <div class="stat-label">Total Test Cases</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #28a745;">${stats.passedTestCases}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #dc3545;">${stats.failedTestCases}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalSteps}</div>
                <div class="stat-label">Total Steps</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.successRate}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>

        <div class="test-cases">
            <h2 style="margin-bottom: 20px;">Test Case Details</h2>
            ${testCases.map(tc => `
                <div class="test-case ${tc.status}">
                    <div class="test-case-header">
                        <div class="test-case-name">${tc.testCaseName}</div>
                        <div class="status-badge status-${tc.status}">${tc.status.toUpperCase()}</div>
                    </div>
                    <div class="test-case-body">
                        <p><strong>Duration:</strong> ${tc.duration ? this.formatDuration(tc.duration) : 'N/A'}</p>
                        <p><strong>Steps:</strong> ${tc.steps.length} (✅ ${tc.steps.filter(s => s.status === 'passed').length} / ❌ ${tc.steps.filter(s => s.status === 'failed').length})</p>
                        
                        <a href="../../screenshots/${this.executionDate}/${tc.testCaseName}/" class="folder-link" target="_blank">
                            📁 View Screenshots Folder
                        </a>

                        ${tc.status === 'failed' ? `
                            <div class="error-message">
                                <strong>❌ Failed at Step ${tc.errorStep}:</strong><br>
                                ${tc.errorMessage || 'No error message available'}
                            </div>
                        ` : ''}

                        <div class="steps-section">
                            <div class="section-header">📋 All Steps</div>
                            <table class="steps-table">
                                <thead>
                                    <tr>
                                        <th>Step #</th>
                                        <th>Action Type</th>
                                        <th>Description</th>
                                        <th>Screenshot</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tc.steps.map(step => {
                                        const screenshotPath = `../../screenshots/${this.executionDate}/${tc.testCaseName}/Step_${step.step}_${step.actionType}.png`;
                                        return `
                                        <tr class="${step.status}">
                                            <td class="step-number-cell">${step.step}</td>
                                            <td class="step-action-cell">
                                                <span class="action-badge">${step.actionType}</span>
                                            </td>
                                            <td>
                                                ${step.stepDescription}
                                                ${step.error ? `<div class="error-message" style="margin-top: 8px;"><strong>Error:</strong> ${step.error}</div>` : ''}
                                            </td>
                                            <td class="step-screenshot-cell">
                                                <a href="${screenshotPath}" class="screenshot-link" target="_blank">
                                                    📸 View
                                                </a>
                                            </td>
                                            <td class="step-status-cell">
                                                <span class="status-icon-${step.status}">
                                                    ${step.status === 'passed' ? '✓' : '✗'}
                                                </span>
                                            </td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Save HTML summary to file
   */
  saveHTMLSummary(): string {
    const summaryDir = path.join('report-summary', 'summaries');
    if (!fs.existsSync(summaryDir)) {
      fs.mkdirSync(summaryDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `execution-summary-${timestamp}.html`;
    const filepath = path.join(summaryDir, filename);

    const htmlContent = this.generateHTMLSummary();
    fs.writeFileSync(filepath, htmlContent, 'utf-8');
    
    return filepath;
  }

  /**
   * Helper: Center text
   */
  private centerText(text: string, width: number): string {
    const padding = Math.max(0, width - text.length);
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
  }

  /**
   * Helper: Pad text to width
   */
  private padText(text: string, width: number): string {
    return text + ' '.repeat(Math.max(0, width - text.length));
  }

  /**
   * Helper: Wrap text to width
   */
  private wrapText(text: string, width: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }
}
