# Jenkins Setup - Step by Step Guide

Your browser should now be open with Jenkins. Follow these exact steps:

---

## Step 1: Install Required Plugins

### 1.1 Access Plugin Manager
1. In Jenkins, click **"Manage Jenkins"** (left sidebar)
2. Click **"Plugins"** or **"Manage Plugins"**
3. Click the **"Available plugins"** tab

### 1.2 Install NodeJS Plugin
1. In the search box, type: `NodeJS`
2. Find **"NodeJS Plugin"** in the list
3. Check the checkbox next to it
4. Click **"Install"** button at the top (or "Download now and install after restart")

### 1.3 Install HTML Publisher Plugin
1. In the search box, type: `HTML Publisher`
2. Find **"HTML Publisher Plugin"**
3. Check the checkbox
4. Click **"Install"**

### 1.4 Verify Git Plugin (Usually Pre-installed)
1. Click the **"Installed plugins"** tab
2. Search for "Git Plugin"
3. If it's there, you're good! If not, install it from Available plugins

**Wait for plugins to install** (should take 1-2 minutes)

---

## Step 2: Configure NodeJS

### 2.1 Open Global Tool Configuration
1. Click **"Manage Jenkins"** (left sidebar)
2. Click **"Tools"** or **"Global Tool Configuration"**
3. Scroll down to the **"NodeJS"** section

### 2.2 Add NodeJS Installation
1. Click **"Add NodeJS"** button
2. Configure:
   ```
   Name: NodeJS
   ✓ Install automatically
   Version: Select "NodeJS 18.x" or "NodeJS 20.x" from dropdown
   ```
3. Click **"Save"** at the bottom of the page

---

## Step 3: Create Your Pipeline Job

### 3.1 Create New Item
1. Click **"New Item"** (left sidebar or dashboard)
2. Enter item name: `Playwright-Tests`
3. Select **"Pipeline"** (scroll down to find it)
4. Click **"OK"**

### 3.2 Configure the Pipeline

#### Option A: Using Git Repository (Recommended)

In the **Pipeline** section at the bottom:

1. **Definition**: Select `Pipeline script from SCM`
2. **SCM**: Select `Git`
3. **Repository URL**: 
   ```
   https://github.com/Paupau-1712/PlaywrightScript.git
   ```
4. **Branch Specifier**: 
   ```
   */main
   ```
5. **Script Path**: 
   ```
   Jenkinsfile
   ```
6. Click **"Save"**

#### Option B: Using Local Files (Alternative)

In the **Pipeline** section:

1. **Definition**: Select `Pipeline script`
2. Click in the **Script** text box
3. Open your `Jenkinsfile` in a text editor and copy ALL contents
4. Paste into the Script box

In the **General** section at the top:
1. Check ✓ **"Use custom workspace"**
2. **Directory**: 
   ```
   /Users/paupau/Desktop/Coding-Projects/Playwright/Laut_Paul_ProjectFolder/PlaywrightScript
   ```
3. Click **"Save"**

---

## Step 4: Run Your First Build

### 4.1 Start the Build
1. You should now see your job **"Playwright-Tests"** on the dashboard
2. Click on the job name
3. Click **"Build Now"** (left sidebar)

### 4.2 Monitor the Build
1. You'll see a build appear in **"Build History"** (left sidebar)
2. Click on the build number (e.g., #1)
3. Click **"Console Output"** to watch the build in real-time

### 4.3 What to Expect
The build will:
- ✓ Checkout your code from Git (or use local files)
- ✓ Install npm dependencies
- ✓ Install Playwright browsers
- ✓ Run your Playwright tests
- ✓ Generate reports

**First build takes 5-10 minutes** (installing browsers)
**Subsequent builds take 2-3 minutes**

---

## Step 5: View Test Reports

After the build completes:

### 5.1 View Playwright Report
1. On the build page, look for **"Playwright Test Report"** link (left sidebar or main area)
2. Click it to see interactive test results

### 5.2 View Execution Summary
1. On the build page, click **"Build Artifacts"**
2. You'll see:
   - `report-summary/summaries/*.html` - Your custom execution summary
   - `report-summary/summaries/*.json` - JSON summary
   - `screenshots/` - All test screenshots

### 5.3 View Screenshots
1. Navigate to **Build Artifacts → screenshots/**
2. Browse by date and test case name
3. Click any screenshot to view it

---

## Troubleshooting

### Build Fails with "Node: not found"
**Solution**: Make sure you configured NodeJS in Global Tool Configuration (Step 2)

### Build Fails with "Permission Denied"
**Solution**: Run this command in terminal:
```bash
chmod -R 755 /Users/paupau/Desktop/Coding-Projects/Playwright/Laut_Paul_ProjectFolder/PlaywrightScript
```

### Can't Find "NodeJS Plugin"
**Solution**: 
1. Restart Jenkins: `brew services restart jenkins-lts`
2. Try again after restart

### Git Repository Not Found
**Solution**: 
- Use Option B (Local Files) instead
- Or verify the Git URL is correct and the repository is public

---

## Next Steps

Once your first build succeeds:

### 1. Set Up Automated Builds
1. In your job configuration
2. Go to **"Build Triggers"** section
3. Options:
   - ✓ **"Poll SCM"** - Check Git for changes
     - Schedule: `H/5 * * * *` (every 5 minutes)
   - ✓ **"Build periodically"** - Run on schedule
     - Schedule: `0 2 * * *` (daily at 2 AM)

### 2. Add Email Notifications
1. Install **"Email Extension Plugin"**
2. Configure in job settings
3. Get notified of build results

### 3. View Build Trends
1. On job dashboard, you'll see build history graphs
2. Track pass/fail trends over time

---

## Quick Reference Commands

```bash
# Start Jenkins
brew services start jenkins-lts

# Stop Jenkins
brew services stop jenkins-lts

# Restart Jenkins
brew services restart jenkins-lts

# View Jenkins logs
tail -f /opt/homebrew/var/log/jenkins-lts/jenkins-lts.log

# Jenkins URL
http://localhost:8080

# Your workspace path
/Users/paupau/Desktop/Coding-Projects/Playwright/Laut_Paul_ProjectFolder/PlaywrightScript
```

---

## Success Indicators

Your setup is working correctly when you see:

✅ Build completes successfully
✅ Console output shows all tests passing
✅ Playwright Test Report link appears
✅ Screenshots are captured
✅ Execution summary is generated
✅ Build artifacts are archived

---

**Need Help?** Check the console output for detailed error messages!
