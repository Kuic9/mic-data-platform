# 🚀 MiC Data Platform GitHub 部署指南

## 前置作業

### 1. 安裝 Git
- 前往 [Git 官網](https://git-scm.com/download/win) 下載 Windows 版本
- 安裝完成後重新啟動 PowerShell

### 2. 註冊 GitHub 帳號
- 前往 [GitHub](https://github.com) 註冊帳號
- 記住您的用戶名和密碼

## 部署步驟

### 第一步：初始化 Git 倉庫

在 PowerShell 中執行以下命令：

```powershell
# 切換到專案目錄
cd "E:\RA\第一周\mic-data-platform"

# 初始化 Git 倉庫
git init

# 配置 Git 用戶信息（請替換為您的信息）
git config --global user.name "您的姓名"
git config --global user.email "您的email@example.com"

# 添加所有文件到暫存區
git add .

# 創建第一次提交
git commit -m "Initial commit: MiC Data Platform"
```

### 第二步：在 GitHub 創建倉庫

1. 登入 GitHub
2. 點擊右上角的 "+" 號，選擇 "New repository"
3. 倉庫名稱填入：`mic-data-platform`
4. 設為 Private（如果不想公開）或 Public
5. 不要勾選 "Initialize this repository with README"
6. 點擊 "Create repository"

### 第三步：連接本地倉庫到 GitHub

```powershell
# 添加遠程倉庫（請替換 YOUR_USERNAME 為您的 GitHub 用戶名）
git remote add origin https://github.com/YOUR_USERNAME/mic-data-platform.git

# 重命名分支為 main
git branch -M main

# 推送代碼到 GitHub
git push -u origin main
```

### 第四步：設置環境變數

創建 `.env` 文件（參考 `.env.example`）：

```env
JWT_SECRET=your_jwt_secret_key_here
DATABASE_URL=./data/mic_platform.db
PORT=5001
NODE_ENV=development
UPLOAD_PATH=./uploads
EXPORT_PATH=./exports
DB_CONNECTION_TIMEOUT=30000
DB_BUSY_TIMEOUT=30000
```

## 在其他設備上克隆專案

### 方法一：使用 HTTPS
```bash
git clone https://github.com/YOUR_USERNAME/mic-data-platform.git
cd mic-data-platform
npm install
cd client && npm install
```

### 方法二：使用 SSH（需要配置 SSH 密鑰）
```bash
git clone git@github.com:YOUR_USERNAME/mic-data-platform.git
cd mic-data-platform
npm install
cd client && npm install
```

## 日常維護命令

### 查看狀態
```bash
git status
```

### 添加修改的文件
```bash
git add .
# 或添加特定文件
git add filename.js
```

### 提交修改
```bash
git commit -m "描述您的修改"
```

### 推送到 GitHub
```bash
git push
```

### 拉取最新代碼
```bash
git pull
```

### 查看提交歷史
```bash
git log --oneline
```

## 分支管理

### 創建新功能分支
```bash
git checkout -b feature/new-feature-name
```

### 切換分支
```bash
git checkout main
git checkout feature/new-feature-name
```

### 合併分支
```bash
git checkout main
git merge feature/new-feature-name
```

### 刪除分支
```bash
git branch -d feature/new-feature-name
```

## 協作開發

### 邀請協作者
1. 在 GitHub 倉庫頁面點擊 "Settings"
2. 左側選擇 "Manage access"
3. 點擊 "Invite a collaborator"
4. 輸入對方的 GitHub 用戶名或 email

### 處理衝突
如果多人同時修改同一文件，可能會產生衝突：

```bash
# 拉取最新代碼
git pull

# 如果有衝突，手動編輯衝突文件，然後：
git add .
git commit -m "解決衝突"
git push
```

## 發布版本

### 創建標籤
```bash
git tag -a v1.0.0 -m "版本 1.0.0"
git push origin v1.0.0
```

### 創建 Release
1. 在 GitHub 倉庫頁面點擊 "Releases"
2. 點擊 "Create a new release"
3. 選擇標籤，填寫發布說明
4. 點擊 "Publish release"

## 備份策略

1. **定期推送**：每天工作結束前推送代碼
2. **分支保護**：重要分支設置保護規則
3. **標籤管理**：重要版本創建標籤
4. **文檔更新**：修改功能時同步更新 README

## 故障排除

### 推送被拒絕
```bash
git pull --rebase
git push
```

### 忘記添加 .gitignore
```bash
# 停止追蹤已經被追蹤的文件
git rm -r --cached node_modules/
git commit -m "移除 node_modules"
```

### 撤銷上次提交
```bash
# 撤銷但保留修改
git reset --soft HEAD~1

# 完全撤銷
git reset --hard HEAD~1
```

## 安全建議

1. 不要將 `.env` 文件推送到 GitHub
2. 使用強密碼作為 JWT_SECRET
3. 定期更新依賴包
4. 設置倉庫為 Private（如包含敏感信息）
5. 使用 SSH 密鑰而非密碼進行認證

## 持續部署

考慮使用 GitHub Actions 進行自動化部署：

1. 在倉庫中創建 `.github/workflows/deploy.yml`
2. 配置自動測試和部署流程
3. 連接到雲端服務（如 Heroku、Vercel、Netlify）

這樣您就可以在不同設備上方便地編輯、維護和升級您的 MiC Data Platform 了！ 