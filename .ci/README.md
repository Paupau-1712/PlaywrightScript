# CI/CD Configuration Files

This directory contains all CI/CD related configurations for Jenkins, Docker, and GitHub Actions.

## 📁 Directory Structure

```
.ci/
├── jenkins/          # Jenkins pipeline configurations
├── docker/           # Docker configurations
├── install-jenkins-docker.sh    # Installation script
└── quick-setup.sh    # Quick verification script

.github/
└── workflows/        # GitHub Actions workflows

docs/
├── JENKINS_SETUP.md        # Jenkins setup guide
├── INSTALLATION_GUIDE.md   # Installation instructions
└── SETUP_STEPS.md         # Step-by-step setup
```

## 🚀 Quick Start

### Install Jenkins & Docker
```bash
.ci/install-jenkins-docker.sh
```

### Verify Setup
```bash
.ci/quick-setup.sh
```

## 📖 Documentation

- [Jenkins Setup Guide](../docs/JENKINS_SETUP.md)
- [Installation Guide](../docs/INSTALLATION_GUIDE.md)
- [Setup Steps](../docs/SETUP_STEPS.md)
