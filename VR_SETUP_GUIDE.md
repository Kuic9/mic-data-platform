# MiC VR 查看器設置指南

## 概述

本指南將幫助您設置和使用 MiC 數據平台的 VR 功能，讓用戶能夠在虛擬現實環境中查看 Revit 模型和 MiC 模組。

## 功能特點

- 🏗️ **Revit 模型導入**: 支持 .rvt、.ifc、.glb 格式
- 🥽 **VR 支持**: 使用 WebXR 技術，支持各種 VR 設備
- 🧱 **MiC 模組可視化**: 3D 展示模組化建築構件
- 🎮 **互動控制**: 滑鼠、鍵盤和 VR 控制器支持
- 📱 **跨平台**: 支持桌面和移動設備

## 系統要求

### 瀏覽器支持
- Chrome 79+ (推薦)
- Firefox 72+
- Edge 79+
- Safari 13+ (部分功能)

### VR 設備支持
- Meta Quest 2/3
- HTC Vive
- Valve Index
- Windows Mixed Reality
- 手機 VR (Google Cardboard, Samsung Gear VR)

### 硬件要求
- **CPU**: Intel i5 或 AMD Ryzen 5 以上
- **內存**: 8GB RAM (推薦 16GB)
- **顯卡**: 支持 WebGL 2.0 的獨立顯卡
- **網絡**: 穩定的網絡連接

## 安裝步驟

### 1. 安裝依賴

```bash
# 安裝後端依賴
npm install

# 安裝前端依賴
cd client
npm install
```

### 2. 啟動服務

```bash
# 開發模式 (同時啟動前後端)
npm run dev

# 或分別啟動
npm run server  # 後端
npm run client  # 前端
```

### 3. 訪問 VR 功能

打開瀏覽器訪問: `http://localhost:3000/vr`

## 使用指南

### 上傳 Revit 模型

1. **拖拽上傳**: 將 Revit 文件拖拽到上傳區域
2. **點擊上傳**: 點擊上傳區域選擇文件
3. **支持格式**: .rvt, .ifc, .glb

### VR 控制

#### 桌面控制
- **WASD**: 移動
- **滑鼠**: 環視
- **點擊**: 選擇物件
- **滾輪**: 縮放

#### VR 控制器
- **搖桿**: 移動
- **觸發鍵**: 選擇
- **握把**: 抓取
- **菜單鍵**: 打開設置

### MiC 模組管理

1. **查看模組**: 在側邊欄選擇模組
2. **編輯屬性**: 點擊編輯按鈕
3. **狀態管理**: 更新模組狀態
4. **材料配置**: 選擇和修改材料

## 技術架構

### 前端技術棧
- **React**: 用戶界面框架
- **A-Frame**: VR 場景渲染
- **Three.js**: 3D 圖形庫
- **WebXR**: VR/AR 標準 API

### 後端技術棧
- **Node.js**: 服務器運行時
- **Express**: Web 框架
- **Multer**: 文件上傳處理
- **SQLite**: 數據存儲

### 文件處理流程

```
Revit 文件 (.rvt) 
    ↓
Revit Extractor / Forge API
    ↓
GLB 格式
    ↓
Three.js 加載器
    ↓
A-Frame VR 場景
```

## API 接口

### 文件上傳
```javascript
POST /api/revit/upload
Content-Type: multipart/form-data

// 響應
{
  "success": true,
  "model": {
    "id": "1234567890",
    "name": "building.rvt",
    "status": "processing"
  }
}
```

### 獲取模型列表
```javascript
GET /api/revit/models

// 響應
[
  {
    "id": "1234567890",
    "name": "building.rvt",
    "type": ".rvt",
    "status": "completed",
    "uploadTime": "2024-01-01T00:00:00.000Z"
  }
]
```

### 獲取 MiC 模組
```javascript
GET /api/revit/models/:id/mic-modules

// 響應
[
  {
    "id": "module_1",
    "name": "浴室模組 A",
    "type": "bathroom",
    "status": "completed",
    "dimensions": {
      "width": 2.5,
      "height": 2.8,
      "depth": 3.0
    }
  }
]
```

## 故障排除

### 常見問題

#### VR 模式無法啟動
- 檢查瀏覽器是否支持 WebXR
- 確認 VR 設備已正確連接
- 嘗試使用 HTTPS 連接

#### 模型加載失敗
- 檢查文件格式是否支持
- 確認文件大小不超過限制 (500MB)
- 查看瀏覽器控制台錯誤信息

#### 性能問題
- 降低模型複雜度
- 關閉不必要的視覺效果
- 使用更強大的硬件

### 調試模式

啟用調試模式查看詳細信息:

```javascript
// 在瀏覽器控制台執行
localStorage.setItem('debug', 'true');
location.reload();
```

## 擴展功能

### 自定義 VR 環境

```javascript
// 修改 VRViewer.js
<a-scene environment="preset: custom; skyType: gradient; skyColor: #24CAFF; horizonColor: #FFC65D">
```

### 添加新的 MiC 模組類型

```javascript
// 在 revitService.js 中添加
const newModuleType = {
  type: 'office',
  defaultDimensions: { width: 4.0, height: 2.8, depth: 6.0 },
  materials: ['玻璃', '鋼材', '石材']
};
```

### 集成外部 3D 模型庫

```javascript
// 添加模型加載器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('path/to/model.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

## 部署指南

### 生產環境部署

1. **構建前端**:
```bash
cd client
npm run build
```

2. **設置環境變量**:
```bash
export NODE_ENV=production
export PORT=5001
```

3. **啟動服務**:
```bash
npm start
```

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN cd client && npm install && npm run build

EXPOSE 5001
CMD ["npm", "start"]
```

## 支持與反饋

如果您遇到問題或有改進建議，請：

1. 查看本文檔的故障排除部分
2. 檢查 GitHub Issues
3. 聯繫技術支持團隊

## 更新日誌

### v1.0.0 (2024-01-01)
- 初始版本發布
- 支持 Revit 文件導入
- 基礎 VR 查看功能
- MiC 模組管理

### 未來計劃
- [ ] 支持更多 3D 格式
- [ ] 增強 VR 交互功能
- [ ] 多用戶協作
- [ ] 雲端渲染支持 