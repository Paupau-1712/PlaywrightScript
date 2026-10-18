pipeline {
    agent any

    environment {
        PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
        HEADLESS = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling latest code from Git...'
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                sh '''
                    echo "=== Environment Info ==="
                    node --version
                    npm --version
                    echo "Current directory: $(pwd)"
                    echo "Git branch: $(git branch --show-current || echo 'detached HEAD')"
                    echo "Latest commit: $(git log -1 --oneline)"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "Installing dependencies..."
                    npm ci
                '''
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                sh 'npx playwright install chromium'
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    echo "Running Playwright tests in headless mode..."
                    npm test
                '''
            }
        }
    }

    post {
        always {
            echo 'Archiving test results and reports...'
            archiveArtifacts artifacts: 'playwright-report/**, report-summary/summaries/*.html, report-summary/summaries/*.json, screenshots/**/*.png, test-results/**/*', allowEmptyArchive: true
        }

        success {
            echo 'All tests passed!'
        }

        failure {
            echo 'Tests failed! Check the archived reports for details.'
        }
    }
}
