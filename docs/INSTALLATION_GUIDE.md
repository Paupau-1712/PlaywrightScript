# Jenkins & Docker Installation Guide for macOS

This guide will help you install and configure Jenkins and Docker on your Mac.

## Quick Installation

### Option 1: Automated Script (Recommended)

```bash
# Navigate to your project directory
cd /Users/paupau/Desktop/Coding-Projects/Playwright/Laut_Paul_ProjectFolder/PlaywrightScript

# Make the script executable
chmod +x install-jenkins-docker.sh

# Run the installation script
./install-jenkins-docker.sh
```

### Option 2: Manual Installation

Follow the steps below if you prefer manual installation.

---

## Step 1: Install Homebrew (if not installed)

```bash
# Check if Homebrew is installed
brew --version

# If not installed, run:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# For Apple Silicon Macs (M1/M2/M3), add Homebrew to PATH:
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

---

## Step 2: Install Docker Desktop

### Method 1: Using Homebrew (Recommended)

```bash
# Install Docker Desktop
brew install --cask docker

# Launch Docker Desktop
open /Applications/Docker.app
```

### Method 2: Manual Download

1. Visit: https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Mac (Apple Silicon or Intel)
3. Install the .dmg file
4. Launch Docker Desktop from Applications

### Verify Docker Installation

```bash
# Check Docker version
docker --version

# Check if Docker is running
docker ps

# Test Docker with hello-world
docker run hello-world
```

---

## Step 3: Install Jenkins

### Install Java (Required for Jenkins)

```bash
# Install OpenJDK 17
brew install openjdk@17

# Link Java to system
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# Verify Java installation
java --version
```

### Install Jenkins

```bash
# Install Jenkins LTS version
brew install jenkins-lts

# Start Jenkins service
brew services start jenkins-lts
```

### Access Jenkins

1. **Open browser**: http://localhost:8080
2. **Get initial admin password**:
   ```bash
   cat ~/.jenkins/secrets/initialAdminPassword
   ```
3. **Copy the password** and paste it in the browser
4. **Install suggested plugins** (click "Install suggested plugins")
5. **Create admin user** with your credentials
6. **Start using Jenkins**

---

## Step 4: Configure Jenkins

### Install Required Jenkins Plugins

1. Go to: **Manage Jenkins** → **Manage Plugins** → **Available**
2. Search and install:
   - ✅ **NodeJS Plugin**
   - ✅ **HTML Publisher Plugin**
   - ✅ **Docker Plugin** (optional, for Docker integration)
   - ✅ **Git Plugin** (usually pre-installed)
   - ✅ **Pipeline Plugin** (usually pre-installed)
3. Click **Install without restart**

### Configure Node.js in Jenkins

1. Go to: **Manage Jenkins** → **Global Tool Configuration**
2. Scroll to **NodeJS** section
3. Click **Add NodeJS**
4. Configure:
   - **Name**: `NodeJS`
   - **Version**: `18.x` or `20.x`
   - ✅ Check **Install automatically**
5. Click **Save**

---

## Step 5: Create Your First Jenkins Job

### Method 1: Pipeline from Git (Recommended)

1. Click **New Item**
2. Enter name: `Playwright-Tests`
3. Select **Pipeline** → Click **OK**
4. In **Pipeline** section:
   - **Definition**: Select `Pipeline script from SCM`
   - **SCM**: Select `Git`
   - **Repository URL**: Enter your Git repository URL
   - **Branch**: `*/main`
   - **Script Path**: `Jenkinsfile`
5. Click **Save**
6. Click **Build Now**

### Method 2: Local Project (Without Git)

1. Click **New Item**
2. Enter name: `Playwright-Tests-Local`
3. Select **Pipeline** → Click **OK**
4. In **Pipeline** section:
   - **Definition**: Select `Pipeline script`
   - Copy contents of your `Jenkinsfile` into the script box
5. In **Advanced Project Options**:
   - **Use custom workspace**: `/Users/paupau/Desktop/Coding-Projects/Playwright/Laut_Paul_ProjectFolder/PlaywrightScript`
6. Click **Save**
7. Click **Build Now**

---

## Step 6: Test Your Setup

### Run Playwright Tests in Docker

```bash
# Build Docker image
cd /Users/paupau/Desktop/Coding-Projects/Playwright/Laut_Paul_ProjectFolder/PlaywrightScript
docker build -t playwright-tests .

# Run tests in Docker container
docker run --rm playwright-tests

# Run tests with volume mounts (to save reports)
docker run --rm \
  -v $(pwd)/report-summary:/app/report-summary \
  -v $(pwd)/screenshots:/app/screenshots \
  -v $(pwd)/playwright-report:/app/playwright-report \
  playwright-tests
```

### Run Tests Directly (Without Docker)

```bash
# Navigate to project directory
cd /Users/paupau/Desktop/Coding-Projects/Playwright/Laut_Paul_ProjectFolder/PlaywrightScript

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps chromium

# Run tests
npm test

# View report
npm run report
```

---

## Useful Jenkins Commands

```bash
# Start Jenkins
brew services start jenkins-lts

# Stop Jenkins
brew services stop jenkins-lts

# Restart Jenkins
brew services restart jenkins-lts

# Check Jenkins status
brew services info jenkins-lts

# View Jenkins logs
tail -f /opt/homebrew/var/log/jenkins-lts/jenkins-lts.log

# Jenkins home directory
cd ~/.jenkins

# Jenkins configuration file
cat /opt/homebrew/etc/jenkins-lts.plist
```

---

## Useful Docker Commands

```bash
# Check Docker version
docker --version

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# List Docker images
docker images

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# View Docker logs
docker logs <container-id>

# Stop all running containers
docker stop $(docker ps -q)
```

---

## Troubleshooting

### Jenkins won't start

```bash
# Check if port 8080 is already in use
lsof -i :8080

# Kill process using port 8080
kill -9 <PID>

# Restart Jenkins
brew services restart jenkins-lts
```

### Docker not running

```bash
# Check Docker status
docker ps

# If error, open Docker Desktop from Applications
open /Applications/Docker.app

# Wait for Docker to fully start (green icon in menu bar)
```

### Playwright browsers not installing

```bash
# Install with dependencies
npx playwright install --with-deps

# If permission issues
sudo npx playwright install --with-deps
```

### Jenkins can't find Node.js

1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Verify NodeJS is configured
3. In your job, ensure NodeJS tool is selected

### Permission issues with Jenkins

```bash
# Give Jenkins permission to workspace
chmod -R 755 /Users/paupau/Desktop/Coding-Projects/Playwright/Laut_Paul_ProjectFolder/PlaywrightScript

# Change ownership (replace YOUR_USERNAME)
chown -R YOUR_USERNAME:staff /Users/paupau/Desktop/Coding-Projects/Playwright/Laut_Paul_ProjectFolder/PlaywrightScript
```

---

## Uninstalling (if needed)

### Uninstall Jenkins

```bash
# Stop Jenkins
brew services stop jenkins-lts

# Uninstall Jenkins
brew uninstall jenkins-lts

# Remove Jenkins data (optional)
rm -rf ~/.jenkins
```

### Uninstall Docker

```bash
# Uninstall Docker Desktop
brew uninstall --cask docker

# Remove Docker data (optional)
rm -rf ~/Library/Containers/com.docker.docker
rm -rf ~/.docker
```

---

## System Requirements

- **macOS**: 10.15 (Catalina) or later
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 10GB free space
- **Processor**: Intel or Apple Silicon (M1/M2/M3)

---

## Next Steps After Installation

1. ✅ Start Jenkins: `brew services start jenkins-lts`
2. ✅ Access Jenkins: http://localhost:8080
3. ✅ Complete Jenkins setup wizard
4. ✅ Install required plugins
5. ✅ Configure Node.js
6. ✅ Start Docker Desktop
7. ✅ Create your first Jenkins job
8. ✅ Run a test build

---

## Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Homebrew Documentation](https://docs.brew.sh/)

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Jenkins logs: `tail -f /opt/homebrew/var/log/jenkins-lts/jenkins-lts.log`
3. Check Docker logs in Docker Desktop
4. Verify all prerequisites are installed

---

**Ready to start?** Run the installation script or follow the manual steps above!
