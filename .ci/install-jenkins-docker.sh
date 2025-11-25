#!/bin/bash

# Jenkins and Docker Installation Script for macOS
# Run this script with: bash install-jenkins-docker.sh

set -e  # Exit on error

echo "=========================================="
echo "Jenkins & Docker Installation for macOS"
echo "=========================================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == 'arm64' ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo "✅ Homebrew is already installed"
fi

echo ""
echo "=========================================="
echo "Installing Docker Desktop for Mac"
echo "=========================================="

if command -v docker &> /dev/null; then
    echo "✅ Docker is already installed"
    docker --version
else
    echo "📦 Installing Docker..."
    brew install --cask docker
    echo "✅ Docker installed successfully"
    echo "⚠️  Please open Docker Desktop from Applications to complete setup"
    echo "⚠️  After Docker Desktop starts, press Enter to continue..."
    read -p ""
fi

echo ""
echo "=========================================="
echo "Installing Jenkins"
echo "=========================================="

if command -v jenkins &> /dev/null; then
    echo "✅ Jenkins is already installed"
else
    echo "📦 Installing Java (required for Jenkins)..."
    brew install openjdk@17
    
    echo "📦 Installing Jenkins..."
    brew install jenkins-lts
    
    echo "✅ Jenkins installed successfully"
fi

echo ""
echo "=========================================="
echo "Installing Additional Tools"
echo "=========================================="

# Install Git if not present
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    brew install git
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    brew install node@18
fi

echo ""
echo "=========================================="
echo "✅ Installation Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Start Jenkins:"
echo "   brew services start jenkins-lts"
echo ""
echo "2. Access Jenkins:"
echo "   Open browser: http://localhost:8080"
echo ""
echo "3. Get initial admin password:"
echo "   cat ~/.jenkins/secrets/initialAdminPassword"
echo ""
echo "4. Start Docker Desktop:"
echo "   Open Docker Desktop from Applications"
echo ""
echo "5. Verify Docker is running:"
echo "   docker --version"
echo "   docker ps"
echo ""
echo "=========================================="
echo "Quick Start Commands:"
echo "=========================================="
echo ""
echo "# Start Jenkins"
echo "brew services start jenkins-lts"
echo ""
echo "# Stop Jenkins"
echo "brew services stop jenkins-lts"
echo ""
echo "# Restart Jenkins"
echo "brew services restart jenkins-lts"
echo ""
echo "# Check Jenkins status"
echo "brew services info jenkins-lts"
echo ""
echo "# View Jenkins logs"
echo "tail -f /opt/homebrew/var/log/jenkins-lts/jenkins-lts.log"
echo ""
echo "=========================================="
