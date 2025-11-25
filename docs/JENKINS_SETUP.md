# Jenkins CI/CD Setup Guide for Playwright Tests

## Prerequisites

1. **Jenkins Server** - Running Jenkins instance (version 2.300+)
2. **Node.js Plugin** - Install NodeJS plugin in Jenkins
3. **Git** - Git installed on Jenkins server
4. **HTML Publisher Plugin** - For publishing test reports
5. **Docker** (Optional) - For containerized builds

## Quick Setup Steps

### 1. Install Required Jenkins Plugins

Go to Jenkins → Manage Jenkins → Manage Plugins → Available

Install these plugins:
- ✅ NodeJS Plugin
- ✅ Git Plugin
- ✅ HTML Publisher Plugin
- ✅ Pipeline Plugin
- ✅ Workspace Cleanup Plugin
- ✅ Email Extension Plugin (optional, for notifications)

### 2. Configure Node.js in Jenkins

1. Go to: **Manage Jenkins → Global Tool Configuration**
2. Scroll to **NodeJS** section
3. Click **Add NodeJS**
4. Configure:
   - Name: `NodeJS`
   - Version: `18.x` or higher
   - ✅ Check "Install automatically"
5. Click **Save**

### 3. Create Jenkins Pipeline Job

#### Option A: Pipeline from SCM (Recommended)

1. **New Item** → Enter job name → Select **Pipeline** → OK
2. In **Pipeline** section:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/Paupau-1712/PlaywrightScript.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
3. Click **Save**

#### Option B: Inline Pipeline Script

1. **New Item** → Enter job name → Select **Pipeline** → OK
2. Scroll to **Pipeline** section
3. Copy the contents of `Jenkinsfile` into the script box
4. Click **Save**

### 4. Configure Build Triggers (Optional)

In your Jenkins job configuration:

**Poll SCM** - Check for changes every 5 minutes:
```
H/5 * * * *
```

**Build periodically** - Run tests daily at 2 AM:
```
0 2 * * *
```

**GitHub webhook** - Trigger on push (requires GitHub integration):
- Enable "GitHub hook trigger for GITScm polling"

### 5. Run Your First Build

1. Go to your Jenkins job
2. Click **Build Now**
3. Monitor console output
4. View test reports after completion

## Accessing Test Reports

After build completion, you'll find:

### Playwright HTML Report
- Click on **Playwright Test Report** link on build page
- View detailed test execution with traces

### Execution Summary
- Navigate to build → **Artifacts**
- Download `execution-summary-*.html` or `execution-summary-*.json`

### Screenshots
- Navigate to build → **Artifacts**
- Browse `screenshots/` folder by date and test case

## Docker Integration (Advanced)

### Build and Run with Docker

```bash
# Build Docker image
docker build -t playwright-tests .

# Run tests in container
docker run --rm \
  -v $(pwd)/report-summary:/app/report-summary \
  -v $(pwd)/screenshots:/app/screenshots \
  -v $(pwd)/playwright-report:/app/playwright-report \
  playwright-tests
```

### Jenkins Docker Pipeline

Add to your Jenkinsfile:

```groovy
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.54.1-jammy'
            args '-v $WORKSPACE:/app -w /app'
        }
    }
    // ... rest of pipeline
}
```

## Environment Variables

You can set these in Jenkins job configuration:

```groovy
environment {
    HEADLESS = 'true'
    BASE_URL = 'https://www.saucedemo.com'
    EXCEL_FILE = 'tests/testScript/TestTemplatev2.xlsx'
}
```

## Notifications Setup (Optional)

### Email Notifications

Add to `post` section in Jenkinsfile:

```groovy
post {
    failure {
        emailext (
            subject: "❌ Test Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """
                Test execution failed!
                
                Job: ${env.JOB_NAME}
                Build: ${env.BUILD_NUMBER}
                URL: ${env.BUILD_URL}
                
                Check the reports for details.
            """,
            to: "team@example.com",
            attachLog: true
        )
    }
    success {
        emailext (
            subject: "✅ Test Passed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """
                All tests passed successfully!
                
                Job: ${env.JOB_NAME}
                Build: ${env.BUILD_NUMBER}
                URL: ${env.BUILD_URL}
            """,
            to: "team@example.com"
        )
    }
}
```

## Parallel Test Execution

For faster execution, modify Jenkinsfile:

```groovy
stage('Run Tests') {
    parallel {
        stage('Chrome Tests') {
            steps {
                sh 'npx playwright test --project=chromium'
            }
        }
        stage('Firefox Tests') {
            steps {
                sh 'npx playwright test --project=firefox'
            }
        }
    }
}
```

## Troubleshooting

### Issue: Playwright browsers not found
**Solution**: Add installation step:
```groovy
sh 'npx playwright install --with-deps'
```

### Issue: Permission denied errors
**Solution**: Ensure Jenkins user has proper permissions:
```bash
chmod -R 755 /path/to/workspace
```

### Issue: Tests fail in headless mode
**Solution**: Update playwright.config.ts:
```typescript
use: {
  headless: true,
  viewport: { width: 1280, height: 720 },
  ignoreHTTPSErrors: true,
}
```

### Issue: Screenshots not captured
**Solution**: Verify directories exist and are writable:
```groovy
sh 'mkdir -p screenshots report-summary/summaries'
sh 'chmod -R 777 screenshots report-summary'
```

## Best Practices

1. ✅ **Use Jenkins Credentials** - Store sensitive data (API keys, passwords) in Jenkins credentials
2. ✅ **Archive Artifacts** - Always archive test reports and screenshots
3. ✅ **Set Timeouts** - Add reasonable timeouts to prevent hanging builds
4. ✅ **Clean Workspace** - Use workspace cleanup to manage disk space
5. ✅ **Tag Builds** - Use meaningful build descriptions
6. ✅ **Monitor Resources** - Keep an eye on Jenkins server resources

## Sample NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "report": "playwright show-report",
    "clean": "rm -rf test-results playwright-report screenshots/*/",
    "ci": "npm ci && npx playwright install --with-deps && npm test"
  }
}
```

Then in Jenkinsfile, simply use:
```groovy
sh 'npm run ci'
```

## Integration with Other Tools

### Slack Notifications
Install Slack Notification Plugin and add:
```groovy
slackSend (
    color: '#00FF00',
    message: "Tests passed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
)
```

### Jira Integration
Update Jira tickets automatically on test failures

### TestRail Integration
Push test results to TestRail for reporting

## Next Steps

1. ✅ Commit `Jenkinsfile` to your repository
2. ✅ Set up Jenkins job following steps above
3. ✅ Run your first build
4. ✅ Configure notifications
5. ✅ Set up scheduled builds
6. ✅ Monitor and optimize

---

For more information:
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [NodeJS Plugin](https://plugins.jenkins.io/nodejs/)
