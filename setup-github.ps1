# MiC Data Platform GitHub 設置腳本
# 在 PowerShell 中執行此腳本以快速設置 GitHub 倉庫

Write-Host "=== MiC Data Platform GitHub 設置腳本 ===" -ForegroundColor Green

# 檢查是否安裝了 Git
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 錯誤：未找到 Git。請先安裝 Git：" -ForegroundColor Red
    Write-Host "   下載地址：https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git 已安裝" -ForegroundColor Green

# 獲取用戶輸入
$userName = Read-Host "請輸入您的 GitHub 用戶名"
$userEmail = Read-Host "請輸入您的 Email"
$repoName = Read-Host "請輸入倉庫名稱 (默認: mic-data-platform)" 

if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "mic-data-platform"
}

# 配置 Git
Write-Host "🔧 配置 Git..." -ForegroundColor Blue
git config --global user.name "$userName"
git config --global user.email "$userEmail"

# 初始化 Git 倉庫
Write-Host "📦 初始化 Git 倉庫..." -ForegroundColor Blue
if (Test-Path ".git") {
    Write-Host "⚠️  Git 倉庫已存在，跳過初始化" -ForegroundColor Yellow
} else {
    git init
    Write-Host "✅ Git 倉庫初始化完成" -ForegroundColor Green
}

# 添加文件到暫存區
Write-Host "📝 添加文件到暫存區..." -ForegroundColor Blue
git add .

# 創建初始提交
Write-Host "💾 創建初始提交..." -ForegroundColor Blue
git commit -m "Initial commit: MiC Data Platform"

# 添加遠程倉庫
$repoUrl = "https://github.com/$userName/$repoName.git"
Write-Host "🔗 添加遠程倉庫：$repoUrl" -ForegroundColor Blue

# 檢查是否已存在遠程倉庫
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "⚠️  遠程倉庫已存在：$existingRemote" -ForegroundColor Yellow
    $replace = Read-Host "是否要替換現有的遠程倉庫？(y/N)"
    if ($replace -eq "y" -or $replace -eq "Y") {
        git remote set-url origin $repoUrl
        Write-Host "✅ 遠程倉庫已更新" -ForegroundColor Green
    }
} else {
    git remote add origin $repoUrl
    Write-Host "✅ 遠程倉庫已添加" -ForegroundColor Green
}

# 重命名分支為 main
Write-Host "🔄 設置主分支為 main..." -ForegroundColor Blue
git branch -M main

Write-Host ""
Write-Host "=== 設置完成！===" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Cyan
Write-Host "1. 前往 GitHub 創建新倉庫：https://github.com/new" -ForegroundColor White
Write-Host "   - 倉庫名稱：$repoName" -ForegroundColor White
Write-Host "   - 不要勾選 'Initialize with README'" -ForegroundColor White
Write-Host ""
Write-Host "2. 倉庫創建完成後，執行以下命令推送代碼：" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. 在其他設備上克隆倉庫：" -ForegroundColor White
Write-Host "   git clone $repoUrl" -ForegroundColor Yellow
Write-Host "   cd $repoName" -ForegroundColor Yellow
Write-Host "   npm install && cd client && npm install" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 詳細說明請參考 DEPLOYMENT.md 文件" -ForegroundColor Cyan

# 詢問是否立即推送
Write-Host ""
$pushNow = Read-Host "如果您已經在 GitHub 創建了倉庫，是否現在推送代碼？(y/N)"
if ($pushNow -eq "y" -or $pushNow -eq "Y") {
    Write-Host "🚀 推送代碼到 GitHub..." -ForegroundColor Blue
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 代碼推送成功！" -ForegroundColor Green
        Write-Host "🌐 倉庫地址：https://github.com/$userName/$repoName" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 推送失敗。請確認：" -ForegroundColor Red
        Write-Host "   1. GitHub 倉庫已創建" -ForegroundColor White
        Write-Host "   2. 倉庫名稱正確" -ForegroundColor White
        Write-Host "   3. 網路連接正常" -ForegroundColor White
    }
} 