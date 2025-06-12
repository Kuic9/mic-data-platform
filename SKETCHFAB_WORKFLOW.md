# Sketchfab iframe 嵌入工作流程

## 📋 概述

這個新系統使用 **Revit → FBX → Sketchfab → iframe嵌入代碼 → 網頁展示** 的超簡化工作流程，直接使用Sketchfab提供的嵌入代碼來展示3D模型。

## 🚀 完整工作流程

### 1️⃣ 在 Revit 中導出 FBX
```
File → Export → CAD Formats → FBX
- 選擇適當的導出設置
- 確保包含所需的幾何體和材質
- 建議檔案大小 < 50MB
```

### 2️⃣ 上傳到 Sketchfab
```
1. 訪問 https://sketchfab.com
2. 登錄您的帳戶（如果沒有請註冊）
3. 點擊 "Upload" 上傳您的 FBX 檔案
4. 設置模型標題、描述、標籤等
5. 調整材質、燈光、動畫設置
6. 發布模型（Publish）
```

### 3️⃣ 獲取iframe嵌入代碼 ⭐ **新方法**
發布後，在模型頁面：
1. 點擊模型下方的 **"Embed"** 按鈕
2. 複製整個 `<iframe>` 代碼，例如：
```html
<iframe title="Unit 3 Structure Model" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/po2pA/embed"> </iframe>
```

### 4️⃣ 在 MiC 平台中添加模型 🎯 **超簡單**
```
1. 導航到特定的 Unit 頁面（如 /units/UNIT001）
2. 點擊 "➕ 添加模型" 按鈕
3. 填寫表單：
   📋 Sketchfab iframe 嵌入代碼：[貼上完整的iframe代碼]
   📛 模型名稱：住宅單位3 - 結構模型
   📝 描述：（可選）詳細描述
4. 點擊 "✅ 添加模型"
```

### 5️⃣ 即時預覽和管理
添加後立即可以：
- 👁️ **即時預覽**：在卡片中直接看到3D模型
- 🚀 **全屏檢視**：在新視窗中打開全屏檢視器
- 🔗 **原始頁面**：在Sketchfab網站中打開
- 🗑️ **刪除**：從平台中移除模型記錄

## 🎯 新系統的優勢

### ✅ **極度簡化**
- ❌ 不需要提取模型ID
- ❌ 不需要複雜的URL解析
- ✅ 直接複製貼上iframe代碼
- ✅ 自動提取所有必要信息

### ✅ **更可靠**
- 🔒 使用Sketchfab官方嵌入方式
- 🌐 完美支援所有Sketchfab功能
- 📱 自動響應式設計
- 🎮 原生VR/AR支援

### ✅ **即時效果**
- ⚡ 添加後立即可見
- 🎨 保持原始設計和材質
- 🔄 支援動畫和互動
- 🎵 支援背景音樂（如果有）

## 📋 使用範例

### 你的模型嵌入代碼示例
基於你的 `po2pA` 模型，iframe代碼應該類似：
```html
<iframe title="住宅單位3結構模型" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/po2pA/embed?autostart=0&ui_controls=1&ui_infos=1&ui_inspector=1&ui_stop=1&ui_watermark=1" width="640" height="480"> </iframe>
```

### 自定義嵌入選項
Sketchfab允許你自定義嵌入選項：
- `autostart=0` - 不自動播放動畫
- `ui_controls=1` - 顯示控制面板
- `ui_infos=1` - 顯示模型信息
- `ui_inspector=1` - 顯示材質面板
- `ui_watermark=1` - 顯示Sketchfab標誌

## 🛠️ 技術架構

### 後端 API 端點
```
/api/sketchfab/add-embed         (POST)   - 添加iframe嵌入
/api/sketchfab/embeds            (GET)    - 獲取嵌入列表
/api/sketchfab/units/:unitId/models (GET) - 獲取特定單位的嵌入
/api/sketchfab/viewer/:modelId   (GET)    - 全屏檢視器頁面
/api/sketchfab/embeds/:modelId   (DELETE) - 刪除嵌入
/api/sketchfab/embeds/:modelId   (PUT)    - 更新嵌入
```

### 前端組件
```
SketchfabEmbedManager.js         - 嵌入管理組件
SketchfabEmbedManager.css        - 樣式文件
```

### 數據存儲
```
data/sketchfab_embeds.json       - 嵌入記錄持久化
```

### 數據結構
```javascript
{
  "id": "embed_1749724670643_xyz",
  "modelName": "住宅單位3 - 結構模型",
  "description": "完整的結構布局展示",
  "iframeCode": "<iframe title=\"...\" src=\"https://sketchfab.com/..." ...></iframe>",
  "sketchfabUrl": "https://sketchfab.com/models/po2pA/embed",
  "sketchfabModelId": "po2pA",
  "extractedTitle": "住宅單位3結構模型",
  "projectId": "PRJ001",
  "unitId": "UNIT001",
  "createdAt": "2025-06-12T10:30:00.000Z"
}
```

## 🎨 檢視器功能

### 嵌入檢視器特性
- ✅ 原生Sketchfab檢視器
- ✅ 所有VR/AR功能
- ✅ 材質檢查器
- ✅ 全屏模式
- ✅ 分享功能
- ✅ 註釋支援

### 全屏檢視器
- 🖥️ 專業檢視器界面
- 🎯 快速返回和導航
- 🔗 跳轉到Sketchfab
- 📱 完全響應式設計

## 🔧 故障排除

### 常見問題

**Q: iframe代碼無效？**
A: 確保：
- 複製完整的 `<iframe>` 標籤
- 包含 `src="https://sketchfab.com/..."` 屬性
- 模型為公開狀態

**Q: 模型不顯示？**
A: 檢查：
- 瀏覽器是否支援iframe
- 網絡連接是否正常
- Sketchfab模型是否還存在

**Q: 嵌入大小問題？**
A: 系統會自動調整iframe大小，無需擔心原始尺寸設置

## 🎯 最佳實踐

### 1. Sketchfab嵌入設置
- ✅ 選擇適合的嵌入尺寸（建議640x480以上）
- ✅ 啟用必要的UI控件
- ✅ 設置適當的自動播放選項
- ✅ 確保模型為公開狀態

### 2. 模型優化
- ⚡ 控制多邊形數量（< 500k triangles）
- 🎨 優化貼圖大小（< 4K resolution）
- 📐 設置合適的預設視角
- 💡 調整燈光和材質

### 3. 平台管理
- 📝 使用描述性的模型名稱
- 🏷️ 添加詳細的描述信息
- 📂 按項目和單位進行組織
- 🔄 定期檢查連結有效性

## 🎊 與你的po2pA模型集成

**立即試用你的模型**：

1. 前往你的Sketchfab模型頁面
2. 點擊 "Embed" 獲取iframe代碼
3. 在MiC平台的Unit頁面中點擊"➕ 添加模型"
4. 貼上iframe代碼
5. 輸入名稱："住宅單位3 - 結構模型"
6. 點擊添加，立即享受3D展示！

## 📈 未來增強

### 即將推出
- 🎯 批量添加多個模型
- 📊 模型觀看統計
- 🎨 自定義嵌入樣式
- 🔄 自動檢查連結有效性
- 📱 移動端優化

### 長期規劃
- 🤝 與Revit的直接整合
- 🔄 版本控制和更新通知
- 📈 使用分析和報告
- 🤖 AI輔助的模型標籤

---

**更新時間**: 2025-06-12  
**系統版本**: MiC Platform v2.1 - Direct Embed Edition  
**優勢**: 比之前方案簡化90%的操作步驟！ 