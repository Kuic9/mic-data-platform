import React, { useEffect, useRef, useState } from 'react';
import 'aframe';
import 'aframe-environment-component';
import 'aframe-extras';
import styled from 'styled-components';

const VRContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
`;

const VRControls = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 8px;
  color: white;
`;

const ControlButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

const VRViewer = ({ micModules = [], selectedModule = null }) => {
  const sceneRef = useRef(null);
  const [vrSupported, setVrSupported] = useState(false);
  const [currentView, setCurrentView] = useState('overview');

  useEffect(() => {
    // 檢查 WebXR 支持
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        setVrSupported(supported);
      }).catch(() => {
        setVrSupported(false);
      });
    }
  }, []);

  const enterVR = () => {
    const scene = sceneRef.current;
    if (scene && scene.enterVR) {
      scene.enterVR();
    }
  };

  const switchView = (viewType) => {
    setCurrentView(viewType);
    // 這裡可以添加相機位置切換邏輯
  };

  const generateMicModules = () => {
    return micModules.map((module, index) => {
      const position = `${index * 3} 0 ${-index * 2}`;
      const color = module.status === 'completed' ? '#4CAF50' : 
                   module.status === 'in-progress' ? '#FF9800' : '#F44336';
      
      return (
        <a-entity key={module.id} position={position}>
          {/* MiC 模組主體 */}
          <a-box 
            position="0 1 0"
            width="2.5"
            height="2"
            depth="6"
            color={color}
            material="roughness: 0.3; metalness: 0.1"
            className="clickable"
          />
          
          {/* 模組標籤 */}
          <a-text
            value={`${module.name || 'Module'}\n${module.type || 'Unknown'}\n狀態: ${module.status || 'Unknown'}`}
            position="0 3.5 0"
            align="center"
            color="#FFFFFF"
            width="6"
          />
          
          {/* 窗戶 */}
          <a-box 
            position="-1 1.2 3.1"
            width="0.8"
            height="0.6"
            depth="0.1"
            color="#87CEEB"
            material="transparent: true; opacity: 0.7"
          />
          <a-box 
            position="1 1.2 3.1"
            width="0.8"
            height="0.6"
            depth="0.1"
            color="#87CEEB"
            material="transparent: true; opacity: 0.7"
          />
          
          {/* 門 */}
          <a-box 
            position="0 0.9 3.1"
            width="0.8"
            height="1.8"
            depth="0.1"
            color="#8B4513"
          />
        </a-entity>
      );
    });
  };

  return (
    <VRContainer>
      <VRControls>
        <h3>MiC VR 查看器</h3>
        <div>
          <ControlButton onClick={() => switchView('overview')}>
            總覽視圖
          </ControlButton>
          <ControlButton onClick={() => switchView('detail')}>
            詳細視圖
          </ControlButton>
          {vrSupported && (
            <ControlButton onClick={enterVR}>
              進入 VR
            </ControlButton>
          )}
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px' }}>
          {vrSupported ? '✓ VR 支持' : '✗ VR 不支持'}
        </div>
      </VRControls>

      <a-scene 
        ref={sceneRef}
        embedded 
        style={{ height: '100%', width: '100%' }}
        vr-mode-ui="enabled: true"
        cursor="rayOrigin: mouse"
        background="color: #87CEEB"
      >
        {/* 資產預載 */}
        <a-assets>
          <a-mixin 
            id="clickable"
            geometry="primitive: box"
            material="color: blue"
          />
        </a-assets>

        {/* 地面 */}
        <a-plane 
          position="0 0 -4" 
          rotation="-90 0 0" 
          width="50" 
          height="50" 
          color="#7BC8A4"
          material="roughness: 0.8"
        />

        {/* 照明 */}
        <a-light type="ambient" color="#404040" intensity="0.4" />
        <a-light 
          type="directional" 
          position="5 10 5" 
          color="#FFFFFF" 
          intensity="0.8"
        />

        {/* MiC 模組 */}
        {generateMicModules()}

        {/* 建築效果預覽 */}
        {selectedModule && (
          <a-entity position="10 0 0">
            <a-text
              value="預期建築效果"
              position="0 4 0"
              align="center"
              color="#FFFFFF"
              width="8"
            />
            
            {/* 完整建築模型 */}
            <a-box 
              position="0 2 0"
              width="8"
              height="4"
              depth="12"
              color="#E0E0E0"
              material="roughness: 0.2; metalness: 0.3"
            />
            
            {/* 屋頂 */}
            <a-cone 
              position="0 4.5 0"
              radius-bottom="6"
              radius-top="0"
              height="2"
              color="#8B4513"
            />
          </a-entity>
        )}

        {/* 相機和控制器 */}
        <a-entity 
          id="cameraRig" 
          position="0 1.6 8"
        >
          <a-camera 
            look-controls="pointerLockEnabled: true"
            wasd-controls="acceleration: 20"
            cursor="fuse: false; rayOrigin: mouse"
          />
        </a-entity>

        {/* 互動提示 */}
        <a-text
          value="使用滑鼠點擊或 VR 控制器選擇 MiC 模組&#10;WASD 鍵移動，滑鼠環視"
          position="0 0.5 5"
          align="center"
          color="#FFFFFF"
          width="10"
        />
      </a-scene>
    </VRContainer>
  );
};

export default VRViewer; 