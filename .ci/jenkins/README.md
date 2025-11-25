# Jenkins Pipeline Configurations

This directory contains Jenkins pipeline scripts for different scenarios.

## Available Pipelines

### Main Pipeline (Used by default)
- **Location**: `../../Jenkinsfile` (root directory)
- **Description**: Production Jenkins pipeline
- **Usage**: Automatically used when Jenkins job is configured with SCM

### Debug Pipeline
- **File**: `Jenkinsfile-debug`
- **Description**: Pipeline with additional logging and environment checks
- **Usage**: Copy contents to Jenkins job configuration for debugging

### Simple Pipeline
- **File**: `Jenkinsfile-simple`
- **Description**: Minimal pipeline for quick testing
- **Usage**: Use for basic test runs without extra configurations

## How to Use

1. **Default (Recommended)**: Jenkins uses `Jenkinsfile` from root directory automatically
2. **Custom**: Copy any pipeline script content and paste in Jenkins job configuration
3. **Debug**: Use `Jenkinsfile-debug` when troubleshooting issues
