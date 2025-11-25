pipeline {
    agent any
    
    environment {
        PATH = "/usr/local/bin:${env.PATH}"
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
                    npm install
                '''
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
            
            // Archive Playwright HTML report
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report'
            ])
            
            // Archive execution summary reports
            archiveArtifacts artifacts: 'report-summary/summaries/*.html, report-summary/summaries/*.json', 
                             allowEmptyArchive: true
            
            // Archive screenshots
            archiveArtifacts artifacts: 'screenshots/**/*.png', 
                             allowEmptyArchive: true
            
            // Archive test results
            archiveArtifacts artifacts: 'test-results/**/*', 
                             allowEmptyArchive: true
        }
        
        success {
            echo '✅ All tests passed!'
        }
        
        failure {
            echo '❌ Tests failed! Check the reports for details.'
        }
    }
}
