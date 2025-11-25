pipeline {
    agent any
    
    environment {
        PATH = "/usr/local/bin:${env.PATH}"
        PROJECT_DIR = "/Users/paupau/Desktop/Coding-Projects/Playwright/Laut_Paul_ProjectFolder/PlaywrightScript"
    }
    
    stages {
        stage('Verify Environment') {
            steps {
                sh '''
                    echo "=== Environment Info ==="
                    node --version
                    npm --version
                    echo "Working directory: ${PROJECT_DIR}"
                '''
            }
        }
        
        stage('Run Tests') {
            steps {
                dir("${PROJECT_DIR}") {
                    sh '''
                        echo "Running Playwright tests..."
                        npm test
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo 'Archiving test results and reports...'
            
            dir("${PROJECT_DIR}") {
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
        }
        
        success {
            echo '✅ All tests passed!'
        }
        
        failure {
            echo '❌ Tests failed! Check the reports for details.'
        }
    }
}
