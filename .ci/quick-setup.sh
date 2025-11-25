#!/bin/bash

echo "=========================================="
echo "Quick Setup Verification"
echo "=========================================="
echo ""

echo "1. Jenkins Status:"
if brew services list | grep -q "jenkins-lts.*started"; then
    echo "   ✅ Jenkins is running"
    echo "   📍 Access at: http://localhost:8080"
else
    echo "   ❌ Jenkins is not running"
    echo "   🔧 Start with: brew services start jenkins-lts"
fi

echo ""
echo "2. Docker Status:"
if command -v docker &> /dev/null; then
    if docker ps &> /dev/null; then
        echo "   ✅ Docker is running"
        echo "   📍 Version: $(docker --version)"
    else
        echo "   ⚠️  Docker is installed but not running"
        echo "   🔧 Start Docker Desktop from Applications"
    fi
else
    echo "   ❌ Docker is not installed"
fi

echo ""
echo "3. Node.js Status:"
if command -v node &> /dev/null; then
    echo "   ✅ Node.js: $(node --version)"
    echo "   ✅ npm: $(npm --version)"
else
    echo "   ❌ Node.js is not installed"
fi

echo ""
echo "4. Project Dependencies:"
cd "$(dirname "$0")"
if [ -d "node_modules" ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ⚠️  Dependencies not installed"
    echo "   🔧 Run: npm install"
fi

echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo ""
echo "1. Open Jenkins: http://localhost:8080"
echo "2. In Jenkins, click 'New Item'"
echo "3. Name: 'Playwright-Tests'"
echo "4. Select 'Pipeline' and click OK"
echo "5. In Pipeline section:"
echo "   - Definition: 'Pipeline script from SCM'"
echo "   - SCM: 'Git'"
echo "   - Repository: Your repo URL"
echo "   - Branch: '*/main'"
echo "   - Script Path: 'Jenkinsfile'"
echo "6. Click 'Save' then 'Build Now'"
echo ""
echo "=========================================="
echo "OR run tests locally:"
echo "=========================================="
echo ""
echo "npm test              # Run tests"
echo "npm run report        # View report"
echo "docker build -t pw .  # Build Docker image"
echo "docker run --rm pw    # Run in Docker"
echo ""
