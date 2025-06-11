import React from 'react';
import './RevitGuide.css';

const RevitGuide = () => {
  return (
    <div className="revit-guide-container">
      <div className="guide-header">
        <h1>📋 Revit模型集成指南</h1>
        <p>學習如何將您的Revit設計集成到MiC數據平台</p>
      </div>

      <div className="guide-content">
        <section className="guide-section">
          <h2>🎯 步驟一：在Revit中準備您的模型</h2>
          <div className="step-content">
            <div className="step-text">
              <h3>確保模型品質</h3>
              <ul>
                <li>清理不需要的元件和視圖</li>
                <li>檢查模型幾何完整性</li>
                <li>確保樓層和房間標記正確</li>
                <li>優化模型大小（建議小於100MB）</li>
              </ul>
            </div>
            <div className="step-image">
              <div className="placeholder-image">
                <svg viewBox="0 0 400 300" className="guide-svg">
                  <rect x="20" y="20" width="360" height="260" fill="#f0f3f7" stroke="#ddd"/>
                  <rect x="40" y="60" width="100" height="80" fill="#667eea" opacity="0.7"/>
                  <rect x="160" y="60" width="100" height="80" fill="#48bb78" opacity="0.7"/>
                  <rect x="280" y="60" width="80" height="80" fill="#ed8936" opacity="0.7"/>
                  <text x="200" y="200" textAnchor="middle" fill="#666" fontSize="16">Revit 3D Model</text>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <h2>📤 步驟二：從Revit導出模型</h2>
          <div className="export-options">
            <div className="export-option recommended">
              <div className="option-header">
                <h3>🌟 推薦：IFC格式</h3>
                <span className="badge">建議</span>
              </div>
              <div className="option-content">
                <h4>導出步驟：</h4>
                <ol>
                  <li>檔案 → 導出 → IFC</li>
                  <li>選擇IFC 2x3或4.0版本</li>
                  <li>設置導出範圍為整個項目</li>
                  <li>點擊導出並選擇儲存位置</li>
                </ol>
                <div className="format-benefits">
                  <h4>優點：</h4>
                  <ul>
                    <li>工業標準BIM格式</li>
                    <li>保留詳細的建築信息</li>
                    <li>支持屬性和材料信息</li>
                    <li>平台原生支持</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="export-option">
              <div className="option-header">
                <h3>🎮 替代方案：3D格式</h3>
              </div>
              <div className="option-content">
                <h4>支持的格式：</h4>
                <div className="format-grid">
                  <div className="format-item">
                    <span className="format-name">GLB</span>
                    <span className="format-desc">二進制glTF，優化的Web3D</span>
                  </div>
                  <div className="format-item">
                    <span className="format-name">glTF</span>
                    <span className="format-desc">JSON格式的3D場景</span>
                  </div>
                  <div className="format-item">
                    <span className="format-name">FBX</span>
                    <span className="format-desc">Autodesk交換格式</span>
                  </div>
                </div>
                <p className="format-note">
                  <strong>注意：</strong>需要第三方插件或轉換工具將Revit導出為這些格式
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <h2>⬆️ 步驟三：上傳到平台</h2>
          <div className="upload-steps">
            <div className="upload-step">
              <div className="step-number">1</div>
              <div className="step-description">
                <h4>導航到單位頁面</h4>
                <p>選擇您要添加模型的具體單位</p>
              </div>
            </div>
            <div className="upload-step">
              <div className="step-number">2</div>
              <div className="step-description">
                <h4>點擊"Upload 3D Model"</h4>
                <p>在單位詳情頁面找到上傳按鈕</p>
              </div>
            </div>
            <div className="upload-step">
              <div className="step-number">3</div>
              <div className="step-description">
                <h4>拖拽或選擇文件</h4>
                <p>將您的Revit導出文件拖到上傳區域</p>
              </div>
            </div>
            <div className="upload-step">
              <div className="step-number">4</div>
              <div className="step-description">
                <h4>等待處理完成</h4>
                <p>系統會自動處理並生成預覽</p>
              </div>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <h2>🔍 步驟四：查看和使用模型</h2>
          <div className="usage-features">
            <div className="feature-card">
              <div className="feature-icon">👁️</div>
              <h4>3D預覽</h4>
              <p>直接在瀏覽器中查看您的3D模型，支持旋轉、縮放和平移</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🥽</div>
              <h4>VR體驗</h4>
              <p>點擊"Full View"按鈕進入沉浸式VR環境瀏覽您的設計</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>模型信息</h4>
              <p>查看模型的詳細信息，包括格式、大小和上傳時間</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h4>集成管理</h4>
              <p>模型與項目、單位和模組數據無縫集成</p>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <h2>💡 最佳實踐建議</h2>
          <div className="best-practices">
            <div className="practice-group">
              <h4>⚡ 性能優化</h4>
              <ul>
                <li>保持模型文件小於100MB</li>
                <li>移除不必要的細節和裝飾元件</li>
                <li>使用適當的細節層級（LOD）</li>
                <li>優化材質和紋理</li>
              </ul>
            </div>
            <div className="practice-group">
              <h4>📋 命名規範</h4>
              <ul>
                <li>使用清晰的項目和單位編號</li>
                <li>包含版本信息（如v1.0, v2.0）</li>
                <li>添加日期戳記</li>
                <li>避免特殊字符和空格</li>
              </ul>
            </div>
            <div className="practice-group">
              <h4>🔍 品質檢查</h4>
              <ul>
                <li>導出前檢查模型警告</li>
                <li>確認樓層標高正確</li>
                <li>驗證房間和空間標記</li>
                <li>測試導出的文件完整性</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="guide-section troubleshooting">
          <h2>🔧 常見問題排解</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h4>❓ 文件上傳失敗怎麼辦？</h4>
              <p>檢查文件大小是否超過100MB，確認網絡連接穩定，嘗試重新上傳。</p>
            </div>
            <div className="faq-item">
              <h4>❓ 模型顯示不正確？</h4>
              <p>可能是模型幾何問題，回到Revit檢查模型完整性，重新導出。</p>
            </div>
            <div className="faq-item">
              <h4>❓ IFC文件無法預覽？</h4>
              <p>確保瀏覽器支持WebGL，清除瀏覽器緩存，嘗試使用Chrome或Firefox。</p>
            </div>
            <div className="faq-item">
              <h4>❓ 需要特殊軟件嗎？</h4>
              <p>不需要，平台支持原生的Web瀏覽器查看，無需安裝額外軟件。</p>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <h2>🎓 進階功能</h2>
          <div className="advanced-features">
            <div className="advanced-feature">
              <h4>🏗️ BIM數據提取</h4>
              <p>從IFC文件中自動提取建築元件信息，包括材料、尺寸和屬性。</p>
            </div>
            <div className="advanced-feature">
              <h4>📐 尺寸測量</h4>
              <p>在3D查看器中進行實時尺寸測量和標註。</p>
            </div>
            <div className="advanced-feature">
              <h4>🔄 版本控制</h4>
              <p>支持同一單位的多個模型版本，便於設計迭代管理。</p>
            </div>
            <div className="advanced-feature">
              <h4>📱 移動兼容</h4>
              <p>所有功能在移動設備和平板電腦上完全兼容。</p>
            </div>
          </div>
        </section>
      </div>

      <div className="guide-footer">
        <div className="footer-content">
          <h3>🚀 準備開始了嗎？</h3>
          <p>現在您已經了解了完整的流程，開始將您的Revit設計集成到MiC數據平台吧！</p>
          <div className="footer-actions">
            <button className="btn-primary" onClick={() => window.history.back()}>
              返回並開始上傳
            </button>
            <button className="btn-secondary" onClick={() => window.open('/projects', '_blank')}>
              瀏覽項目
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevitGuide; 