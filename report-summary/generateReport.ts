import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

interface TestStepAnalytics {
  step: number;
  stepDescription: string;
  actionType: string;
  status: 'success' | 'failed';
  screenshotPath: string;
}

interface TestCaseAnalytics {
  testCaseName: string;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  successRate: number;
  duration?: number;
  steps: TestStepAnalytics[];
}

interface ExecutionAnalytics {
  executionDate: string;
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  overallSuccessRate: number;
  testCases: TestCaseAnalytics[];
  actionTypeDistribution: Record<string, number>;
  mostUsedActions: Array<{ action: string; count: number }>;
}

export class AnalyticsReportGenerator {
  private screenshotBaseDir: string;
  private testScriptPath: string;
  private reportOutputPath: string;

  constructor(
    screenshotBaseDir: string = 'screenshots',
    testScriptPath: string = 'tests/testScript/TestTemplatev2.xlsx',
    reportOutputPath: string = 'report-summary/reports'
  ) {
    this.screenshotBaseDir = screenshotBaseDir;
    this.testScriptPath = testScriptPath;
    this.reportOutputPath = reportOutputPath;
  }

  /**
   * Analyze test executions from screenshots and Excel data
   */
  async analyzeExecutions(): Promise<ExecutionAnalytics[]> {
    const executions: ExecutionAnalytics[] = [];
    
    // Get all execution dates from screenshots directory
    const screenshotDirs = fs.readdirSync(this.screenshotBaseDir)
      .filter(dir => fs.statSync(path.join(this.screenshotBaseDir, dir)).isDirectory())
      .filter(dir => /^\d{4}-\d{2}-\d{2}$/.test(dir)); // Date format YYYY-MM-DD

    for (const executionDate of screenshotDirs) {
      const execution = await this.analyzeExecution(executionDate);
      executions.push(execution);
    }

    return executions;
  }

  /**
   * Analyze a single execution date
   */
  private async analyzeExecution(executionDate: string): Promise<ExecutionAnalytics> {
    const executionPath = path.join(this.screenshotBaseDir, executionDate);
    const testCaseDirs = fs.readdirSync(executionPath)
      .filter(dir => fs.statSync(path.join(executionPath, dir)).isDirectory());

    const testCases: TestCaseAnalytics[] = [];
    const actionTypeDistribution: Record<string, number> = {};

    // Read Excel file for test data
    const workbook = XLSX.readFile(this.testScriptPath);

    for (const testCaseName of testCaseDirs) {
      const testCase = await this.analyzeTestCase(
        executionDate,
        testCaseName,
        workbook,
        actionTypeDistribution
      );
      testCases.push(testCase);
    }

    // Calculate overall statistics
    const totalTestCases = testCases.length;
    const passedTestCases = testCases.filter(tc => tc.failedSteps === 0).length;
    const failedTestCases = totalTestCases - passedTestCases;
    const totalSteps = testCases.reduce((sum, tc) => sum + tc.totalSteps, 0);
    const successfulSteps = testCases.reduce((sum, tc) => sum + tc.completedSteps, 0);
    const failedSteps = testCases.reduce((sum, tc) => sum + tc.failedSteps, 0);
    const overallSuccessRate = totalSteps > 0 ? (successfulSteps / totalSteps) * 100 : 0;

    // Get most used actions
    const mostUsedActions = Object.entries(actionTypeDistribution)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      executionDate,
      totalTestCases,
      passedTestCases,
      failedTestCases,
      totalSteps,
      successfulSteps,
      failedSteps,
      overallSuccessRate,
      testCases,
      actionTypeDistribution,
      mostUsedActions
    };
  }

  /**
   * Analyze a single test case
   */
  private async analyzeTestCase(
    executionDate: string,
    testCaseName: string,
    workbook: XLSX.WorkBook,
    actionTypeDistribution: Record<string, number>
  ): Promise<TestCaseAnalytics> {
    const testCasePath = path.join(this.screenshotBaseDir, executionDate, testCaseName);
    const screenshots = fs.readdirSync(testCasePath)
      .filter(file => file.endsWith('.png'))
      .sort();

    const steps: TestStepAnalytics[] = [];
    
    // Read test case data from Excel
    const sheet = workbook.Sheets[testCaseName];
    const testData = sheet ? XLSX.utils.sheet_to_json(sheet) : [];

    for (const screenshot of screenshots) {
      const match = screenshot.match(/Step_(\d+)_(.+)\.png/);
      if (match) {
        const stepNumber = parseInt(match[1]);
        const actionType = match[2];

        // Find corresponding step data from Excel
        const stepData: any = testData.find((row: any) => row.STEP === stepNumber);

        steps.push({
          step: stepNumber,
          stepDescription: stepData?.STEPDESCRIPTION || 'N/A',
          actionType: actionType,
          status: 'success', // If screenshot exists, step was executed
          screenshotPath: path.join(testCasePath, screenshot)
        });

        // Count action types
        actionTypeDistribution[actionType] = (actionTypeDistribution[actionType] || 0) + 1;
      }
    }

    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.status === 'success').length;
    const failedSteps = totalSteps - completedSteps;
    const successRate = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return {
      testCaseName,
      totalSteps,
      completedSteps,
      failedSteps,
      successRate,
      steps
    };
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(executions: ExecutionAnalytics[]): string {
    const latestExecution = executions[executions.length - 1];

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Execution Analytics Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }

        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }

        .card {
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(0,0,0,0.2);
        }

        .card-title {
            font-size: 0.9em;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .card-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }

        .card-subtitle {
            font-size: 0.9em;
            color: #6c757d;
        }

        .card.success .card-value {
            color: #28a745;
        }

        .card.failed .card-value {
            color: #dc3545;
        }

        .card.rate .card-value {
            color: #667eea;
        }

        .section {
            padding: 40px;
        }

        .section-title {
            font-size: 1.8em;
            color: #333;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }

        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }

        .chart-container {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .chart-title {
            font-size: 1.2em;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }

        .test-cases-grid {
            display: grid;
            gap: 20px;
        }

        .test-case-card {
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-left: 5px solid #667eea;
        }

        .test-case-card.passed {
            border-left-color: #28a745;
        }

        .test-case-card.failed {
            border-left-color: #dc3545;
        }

        .test-case-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .test-case-name {
            font-size: 1.4em;
            font-weight: bold;
            color: #333;
        }

        .test-case-status {
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }

        .status-passed {
            background: #28a745;
            color: white;
        }

        .status-failed {
            background: #dc3545;
            color: white;
        }

        .test-case-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .stat-item {
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .stat-label {
            font-size: 0.85em;
            color: #6c757d;
            margin-bottom: 5px;
        }

        .stat-value {
            font-size: 1.8em;
            font-weight: bold;
            color: #667eea;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 15px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s ease;
        }

        .steps-table {
            width: 100%;
            margin-top: 20px;
            border-collapse: collapse;
        }

        .steps-table th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }

        .steps-table td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }

        .steps-table tr:hover {
            background: #f8f9fa;
        }

        .action-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.85em;
            font-weight: 600;
            background: #667eea;
            color: white;
        }

        .footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
        }

        @media (max-width: 768px) {
            .summary-cards {
                grid-template-columns: 1fr;
            }

            .charts-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Test Execution Analytics Report</h1>
            <p>Comprehensive analysis of automated test executions</p>
            <p style="margin-top: 10px; font-size: 1em;">Latest Execution: ${latestExecution.executionDate}</p>
        </div>

        <div class="summary-cards">
            <div class="card">
                <div class="card-title">Total Test Cases</div>
                <div class="card-value">${latestExecution.totalTestCases}</div>
                <div class="card-subtitle">Executed test suites</div>
            </div>

            <div class="card success">
                <div class="card-title">Passed Test Cases</div>
                <div class="card-value">${latestExecution.passedTestCases}</div>
                <div class="card-subtitle">${((latestExecution.passedTestCases / latestExecution.totalTestCases) * 100).toFixed(1)}% success rate</div>
            </div>

            <div class="card failed">
                <div class="card-title">Failed Test Cases</div>
                <div class="card-value">${latestExecution.failedTestCases}</div>
                <div class="card-subtitle">${((latestExecution.failedTestCases / latestExecution.totalTestCases) * 100).toFixed(1)}% failure rate</div>
            </div>

            <div class="card">
                <div class="card-title">Total Steps Executed</div>
                <div class="card-value">${latestExecution.totalSteps}</div>
                <div class="card-subtitle">Automation steps</div>
            </div>

            <div class="card success">
                <div class="card-title">Successful Steps</div>
                <div class="card-value">${latestExecution.successfulSteps}</div>
                <div class="card-subtitle">Completed successfully</div>
            </div>

            <div class="card rate">
                <div class="card-title">Overall Success Rate</div>
                <div class="card-value">${latestExecution.overallSuccessRate.toFixed(1)}%</div>
                <div class="card-subtitle">Step-level success</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">📈 Visual Analytics</h2>
            <div class="charts-grid">
                <div class="chart-container">
                    <div class="chart-title">Test Cases Pass/Fail Distribution</div>
                    <canvas id="passFailChart"></canvas>
                </div>

                <div class="chart-container">
                    <div class="chart-title">Top 10 Most Used Actions</div>
                    <canvas id="actionsChart"></canvas>
                </div>

                <div class="chart-container">
                    <div class="chart-title">Test Case Success Rates</div>
                    <canvas id="successRateChart"></canvas>
                </div>

                <div class="chart-container">
                    <div class="chart-title">Steps per Test Case</div>
                    <canvas id="stepsChart"></canvas>
                </div>
            </div>
        </div>

        <div class="section" style="background: #f8f9fa;">
            <h2 class="section-title">🧪 Detailed Test Case Results</h2>
            <div class="test-cases-grid">
                ${latestExecution.testCases.map(tc => this.generateTestCaseHTML(tc)).join('')}
            </div>
        </div>

        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Playwright Test Automation Framework</p>
            <p style="margin-top: 5px;">Total Executions Analyzed: ${executions.length}</p>
        </div>
    </div>

    <script>
        // Pass/Fail Chart
        const passFailCtx = document.getElementById('passFailChart').getContext('2d');
        new Chart(passFailCtx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed'],
                datasets: [{
                    data: [${latestExecution.passedTestCases}, ${latestExecution.failedTestCases}],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Actions Chart
        const actionsCtx = document.getElementById('actionsChart').getContext('2d');
        new Chart(actionsCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(latestExecution.mostUsedActions.map(a => a.action))},
                datasets: [{
                    label: 'Usage Count',
                    data: ${JSON.stringify(latestExecution.mostUsedActions.map(a => a.count))},
                    backgroundColor: '#667eea',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Success Rate Chart
        const successRateCtx = document.getElementById('successRateChart').getContext('2d');
        new Chart(successRateCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(latestExecution.testCases.map(tc => tc.testCaseName))},
                datasets: [{
                    label: 'Success Rate (%)',
                    data: ${JSON.stringify(latestExecution.testCases.map(tc => tc.successRate))},
                    backgroundColor: '#667eea',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Steps Chart
        const stepsCtx = document.getElementById('stepsChart').getContext('2d');
        new Chart(stepsCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(latestExecution.testCases.map(tc => tc.testCaseName))},
                datasets: [{
                    label: 'Total Steps',
                    data: ${JSON.stringify(latestExecution.testCases.map(tc => tc.totalSteps))},
                    backgroundColor: '#764ba2',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * Generate HTML for a single test case
   */
  private generateTestCaseHTML(testCase: TestCaseAnalytics): string {
    const isPassed = testCase.failedSteps === 0;
    const statusClass = isPassed ? 'passed' : 'failed';
    const statusText = isPassed ? 'PASSED' : 'FAILED';

    return `
        <div class="test-case-card ${statusClass}">
            <div class="test-case-header">
                <div class="test-case-name">${testCase.testCaseName}</div>
                <div class="test-case-status status-${statusClass.toLowerCase()}">${statusText}</div>
            </div>

            <div class="test-case-stats">
                <div class="stat-item">
                    <div class="stat-label">Total Steps</div>
                    <div class="stat-value">${testCase.totalSteps}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Completed</div>
                    <div class="stat-value" style="color: #28a745;">${testCase.completedSteps}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Failed</div>
                    <div class="stat-value" style="color: #dc3545;">${testCase.failedSteps}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Success Rate</div>
                    <div class="stat-value">${testCase.successRate.toFixed(1)}%</div>
                </div>
            </div>

            <div class="progress-bar">
                <div class="progress-fill" style="width: ${testCase.successRate}%"></div>
            </div>

            <table class="steps-table">
                <thead>
                    <tr>
                        <th>Step #</th>
                        <th>Description</th>
                        <th>Action Type</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${testCase.steps.map(step => `
                        <tr>
                            <td><strong>#${step.step}</strong></td>
                            <td>${step.stepDescription}</td>
                            <td><span class="action-badge">${step.actionType}</span></td>
                            <td><span style="color: #28a745;">✓ Success</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
  }

  /**
   * Save the HTML report to a file
   */
  async saveReport(htmlContent: string, filename: string = 'analytics-report.html'): Promise<string> {
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportOutputPath)) {
      fs.mkdirSync(this.reportOutputPath, { recursive: true });
    }

    const reportPath = path.join(this.reportOutputPath, filename);
    fs.writeFileSync(reportPath, htmlContent, 'utf-8');
    
    return reportPath;
  }

  /**
   * Generate and save the complete report
   */
  async generateAndSaveReport(): Promise<string> {
    console.log('🔍 Analyzing test executions...');
    const executions = await this.analyzeExecutions();
    
    if (executions.length === 0) {
      throw new Error('No test executions found to analyze');
    }

    console.log(`✅ Found ${executions.length} execution(s) to analyze`);
    console.log('📊 Generating HTML report...');
    
    const htmlContent = this.generateHTMLReport(executions);
    const reportPath = await this.saveReport(htmlContent);
    
    console.log(`✅ Report generated successfully: ${reportPath}`);
    
    return reportPath;
  }
}

// Main execution
if (require.main === module) {
  const generator = new AnalyticsReportGenerator();
  
  generator.generateAndSaveReport()
    .then(reportPath => {
      console.log('\n🎉 Analytics report generation complete!');
      console.log(`📁 Report location: ${reportPath}`);
      console.log('\n💡 Open the report in your browser to view the analytics.');
    })
    .catch(error => {
      console.error('❌ Error generating analytics report:', error);
      process.exit(1);
    });
}
