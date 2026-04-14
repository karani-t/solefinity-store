#!/bin/bash
# 🚀 SOLEFINITY DEPLOYMENT SCRIPT FOR RENDER.COM
# Run this script to prepare your project for deployment

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 SOLEFINITY → RENDER.COM DEPLOYMENT PREPARATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Verify project is ready
echo "📦 Step 1: Verifying project..."
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from project root."
    exit 1
fi
echo "✅ Project structure verified"
echo ""

# Step 2: Generate NEXTAUTH_SECRET
echo "🔐 Step 2: Generating NEXTAUTH_SECRET..."
if command -v openssl &> /dev/null; then
    SECRET=$(openssl rand -base64 32)
    echo "✅ Generated: $SECRET"
    echo "   (Copy this to Render environment as NEXTAUTH_SECRET)"
else
    echo "⚠️  openssl not found. Generate manually:"
    echo "   Run: openssl rand -base64 32"
fi
echo ""

# Step 3: Verify Node/npm
echo "📝 Step 3: Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js $NODE_VERSION"
else
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi
echo ""

# Step 4: Check dependencies
echo "📚 Step 4: Checking dependencies..."
npm list > /dev/null 2>&1 && echo "✅ Dependencies installed" || echo "⚠️  Run 'npm install' first"
echo ""

# Step 5: Test build locally
echo "🔨 Step 5: Testing build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Fix errors and try again."
    npm run build  # Show errors
    exit 1
fi
echo ""

# Step 6: Git setup
echo "🌐 Step 6: Git configuration..."
if [ -d ".git" ]; then
    echo "✅ Git repository exists"
    REMOTE=$(git config --get remote.origin.url 2>/dev/null || echo "")
    if [ -n "$REMOTE" ]; then
        echo "✅ Remote: $REMOTE"
    else
        echo "⚠️  No remote set. Add with: git remote add origin YOUR_GITHUB_REPO"
    fi
else
    echo "⚠️  .git not found. Initialize with: git init && git remote add origin YOUR_GITHUB_REPO"
fi
echo ""

# Step 7: Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PROJECT READY FOR DEPLOYMENT!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  COMMIT & PUSH CODE"
echo "   git add ."
echo "   git commit -m 'Deploy to Render'"
echo "   git push origin main"
echo ""
echo "2️⃣  CREATE RENDER SERVICES"
echo "   ✨ Go to: https://dashboard.render.com"
echo "   📌 Create PostgreSQL database first"
echo "   🌐 Then create Web Service linked to this GitHub repo"
echo ""
echo "3️⃣  SET ENVIRONMENT VARIABLES IN RENDER"
echo "   📝 Required variables:"
echo "      - NEXTAUTH_URL: https://your-app-name.onrender.com"
echo "      - NEXTAUTH_SECRET: $SECRET"
echo "      - DATABASE_URL: postgresql://..."
echo "      - SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT"
echo "      - AFRICASTALKING_USERNAME, AFRICASTALKING_API_KEY"
echo ""
echo "4️⃣  DEPLOY & TEST"
echo "   🚀 Click 'Deploy' in Render dashboard"
echo "   ⏳ Wait 3-5 minutes for build to complete"
echo "   ✅ Visit your live URL"
echo ""
echo "📞 NEED HELP?"
echo "   • Render Docs: https://render.com/docs"
echo "   • Next.js Docs: https://nextjs.org/docs"
echo "   • Prisma Docs: https://www.prisma.io/docs"
echo ""
