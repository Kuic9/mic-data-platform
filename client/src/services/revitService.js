import axios from 'axios';

class RevitService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  }

  /**
   * 上傳 Revit 文件並轉換為 Web 格式
   * @param {File} file - Revit 文件 (.rvt, .ifc, .glb)
   * @param {Object} options - 轉換選項
   */
  async uploadRevitFile(file, options = {}) {
    const formData = new FormData();
    formData.append('model', file);
    formData.append('projectId', options.projectId || 'PRJ001');
    formData.append('unitId', options.unitId || 'UNIT001');
    formData.append('fileName', file.name);

    try {
      const response = await axios.post(`${this.baseURL}/api/viewer/upload-model`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (options.onProgress) {
            options.onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Revit 文件上傳失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取已轉換的 3D 模型列表
   */
  async getConvertedModels() {
    try {
      const response = await axios.get(`${this.baseURL}/api/viewer/public-models`);
      return response.data;
    } catch (error) {
      console.error('獲取模型列表失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取特定模型的詳細信息
   * @param {string} modelId - 模型 ID
   */
  async getModelDetails(modelId) {
    try {
      const response = await axios.get(`${this.baseURL}/api/revit/models/${modelId}`);
      return response.data;
    } catch (error) {
      console.error('獲取模型詳情失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取模型的 MiC 模組信息
   * @param {string} modelId - 模型 ID
   */
  async getMicModules(modelId) {
    try {
      const response = await axios.get(`${this.baseURL}/api/viewer/public-models/${modelId}/mic-modules`);
      return response.data;
    } catch (error) {
      console.error('獲取 MiC 模組失敗:', error);
      throw error;
    }
  }

  /**
   * 更新 MiC 模組狀態
   * @param {string} modelId - 模型 ID
   * @param {string} moduleId - 模組 ID
   * @param {Object} updates - 更新數據
   */
  async updateMicModule(modelId, moduleId, updates) {
    try {
      const response = await axios.put(
        `${this.baseURL}/api/revit/models/${modelId}/mic-modules/${moduleId}`,
        updates
      );
      return response.data;
    } catch (error) {
      console.error('更新 MiC 模組失敗:', error);
      throw error;
    }
  }

  /**
   * 生成 VR 場景配置
   * @param {string} modelId - 模型 ID
   * @param {Object} vrOptions - VR 選項
   */
  async generateVRScene(modelId, vrOptions = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/api/revit/models/${modelId}/vr-scene`, {
        options: vrOptions
      });
      return response.data;
    } catch (error) {
      console.error('生成 VR 場景失敗:', error);
      throw error;
    }
  }

  /**
   * 導出模型為不同格式
   * @param {string} modelId - 模型 ID
   * @param {string} format - 導出格式 (glb, obj, fbx)
   */
  async exportModel(modelId, format = 'glb') {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/revit/models/${modelId}/export/${format}`,
        { responseType: 'blob' }
      );
      
      // 創建下載鏈接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `model.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('導出模型失敗:', error);
      throw error;
    }
  }

  /**
   * 解析 IFC 文件
   * @param {File} ifcFile - IFC 文件
   */
  async parseIFCFile(ifcFile) {
    const formData = new FormData();
    formData.append('ifcFile', ifcFile);

    try {
      const response = await axios.post(`${this.baseURL}/api/revit/parse-ifc`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('IFC 文件解析失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取建築構件信息
   * @param {string} modelId - 模型 ID
   * @param {string} elementId - 構件 ID
   */
  async getBuildingElement(modelId, elementId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/revit/models/${modelId}/elements/${elementId}`
      );
      return response.data;
    } catch (error) {
      console.error('獲取建築構件失敗:', error);
      throw error;
    }
  }

  /**
   * 搜索建築構件
   * @param {string} modelId - 模型 ID
   * @param {Object} searchCriteria - 搜索條件
   */
  async searchElements(modelId, searchCriteria) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/revit/models/${modelId}/search`,
        searchCriteria
      );
      return response.data;
    } catch (error) {
      console.error('搜索構件失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取材料庫
   */
  async getMaterialLibrary() {
    try {
      const response = await axios.get(`${this.baseURL}/api/revit/materials`);
      return response.data;
    } catch (error) {
      console.error('獲取材料庫失敗:', error);
      throw error;
    }
  }

  /**
   * 創建自定義 MiC 模組
   * @param {Object} moduleData - 模組數據
   */
  async createCustomMicModule(moduleData) {
    try {
      const response = await axios.post(`${this.baseURL}/api/revit/mic-modules`, moduleData);
      return response.data;
    } catch (error) {
      console.error('創建自定義模組失敗:', error);
      throw error;
    }
  }
}

export default new RevitService(); 