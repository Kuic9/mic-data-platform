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
    // Check WebXR support
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
    // Camera position switching logic can be added here
  };

  const generateMicModules = () => {
    return micModules.map((module, index) => {
      const position = `${index * 3} 0 ${-index * 2}`;
      const color = module.status === 'completed' ? '#4CAF50' : 
                   module.status === 'in-progress' ? '#FF9800' : '#F44336';
      
      return (
        <a-entity key={module.id} position={position}>
          {/* MiC Module Main Body */}
          <a-box 
            position="0 1 0"
            width="2.5"
            height="2"
            depth="6"
            color={color}
            material="roughness: 0.3; metalness: 0.1"
            className="clickable"
          />
          
          {/* Module Label */}
          <a-text
            value={`${module.name || 'Module'}\n${module.type || 'Unknown'}\nStatus: ${module.status || 'Unknown'}`}
            position="0 3.5 0"
            align="center"
            color="#FFFFFF"
            width="6"
          />
          
          {/* Windows */}
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
          
          {/* Door */}
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
        <h3>MiC VR Viewer</h3>
        <div>
          <ControlButton onClick={() => switchView('overview')}>
            Overview
          </ControlButton>
          <ControlButton onClick={() => switchView('detail')}>
            Detail View
          </ControlButton>
          {vrSupported && (
            <ControlButton onClick={enterVR}>
              Enter VR
            </ControlButton>
          )}
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px' }}>
          {vrSupported ? '✓ VR Supported' : '✗ VR Not Supported'}
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
        {/* Asset Preload */}
        <a-assets>
          <a-mixin 
            id="clickable"
            geometry="primitive: box"
            material="color: blue"
          />
        </a-assets>

        {/* Ground */}
        <a-plane 
          position="0 0 -4" 
          rotation="-90 0 0" 
          width="50" 
          height="50" 
          color="#7BC8A4"
          material="roughness: 0.8"
        />

        {/* Lighting */}
        <a-light type="ambient" color="#404040" intensity="0.4" />
        <a-light 
          type="directional" 
          position="5 10 5" 
          color="#FFFFFF" 
          intensity="0.8"
        />

        {/* MiC Modules */}
        {generateMicModules()}

        {/* Building Effect Preview */}
        {selectedModule && (
          <a-entity position="10 0 0">
            <a-text
              value="Expected Building Effect"
              position="0 4 0"
              align="center"
              color="#FFFFFF"
              width="8"
            />
            
            {/* Complete Building Model */}
            <a-box 
              position="0 2 0"
              width="8"
              height="4"
              depth="12"
              color="#E0E0E0"
              material="roughness: 0.2; metalness: 0.3"
            />
            
            {/* Roof */}
            <a-cone 
              position="0 4.5 0"
              radius-bottom="6"
              radius-top="0"
              height="2"
              color="#8B4513"
            />
          </a-entity>
        )}

        {/* Camera and Controller */}
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

        {/* Interactive Tips */}
        <a-text
          value="Use mouse click or VR controller to select MiC modules&#10;WASD keys to move, mouse to look around"
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