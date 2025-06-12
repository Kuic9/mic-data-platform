const { default: fetch } = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testNamCheongProject() {
  console.log('🧪 測試Nam Cheong項目數據...\n');

  try {
    // 1. 測試獲取所有項目
    console.log('1. 測試獲取所有項目...');
    const projectsResponse = await fetch(`${BASE_URL}/api/projects`);
    if (projectsResponse.ok) {
      const projects = await projectsResponse.json();
      const namCheongProject = projects.find(p => p.project_id === 'NC220');
      
      if (namCheongProject) {
        console.log('✅ 找到Nam Cheong項目:');
        console.log(`   - 項目名稱: ${namCheongProject.project_name}`);
        console.log(`   - 位置: ${namCheongProject.location}`);
        console.log(`   - 總單元數: ${namCheongProject.total_units}`);
        console.log(`   - 戶型: ${namCheongProject.unit_types}`);
        console.log(`   - 狀態: ${namCheongProject.project_status}`);
      } else {
        console.log('❌ 未找到Nam Cheong項目');
      }
    } else {
      console.log('❌ 無法獲取項目列表');
    }

    // 2. 測試獲取NC220項目詳情
    console.log('\n2. 測試獲取NC220項目詳情...');
    const projectDetailResponse = await fetch(`${BASE_URL}/api/projects/NC220`);
    if (projectDetailResponse.ok) {
      const project = await projectDetailResponse.json();
      console.log('✅ 成功獲取項目詳情:');
      console.log(`   - 描述: ${project.description.substring(0, 100)}...`);
    } else {
      console.log('❌ 無法獲取項目詳情');
    }

    // 3. 測試獲取NC220項目的單元
    console.log('\n3. 測試獲取NC220項目的單元...');
    const unitsResponse = await fetch(`${BASE_URL}/api/projects/NC220/units`);
    if (unitsResponse.ok) {
      const units = await unitsResponse.json();
      console.log(`✅ 找到 ${units.length} 個單元:`);
      units.forEach((unit, index) => {
        console.log(`   ${index + 1}. ${unit.unit_type} (${unit.unit_id})`);
        console.log(`      - 面積: ${unit.area}m²`);
        console.log(`      - 房間數: ${unit.bedrooms}房${unit.bathrooms}衛`);
        console.log(`      - 狀態: ${unit.status}`);
      });
    } else {
      console.log('❌ 無法獲取單元列表');
    }

    // 4. 測試獲取特定單元的模塊
    console.log('\n4. 測試獲取單元模塊...');
    const unitModulesResponse = await fetch(`${BASE_URL}/api/units/NC220-U001/modules`);
    if (unitModulesResponse.ok) {
      const modules = await unitModulesResponse.json();
      console.log(`✅ 單元 NC220-U001 有 ${modules.length} 個模塊:`);
      modules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.module_type} (${module.module_id})`);
        console.log(`      - 尺寸: ${module.dimensions_length}×${module.dimensions_width}×${module.dimensions_height}m`);
        console.log(`      - 重量: ${module.weight}kg`);
        console.log(`      - 用途: ${module.intended_use}`);
      });
    } else {
      console.log('❌ 無法獲取單元模塊');
    }

    // 5. 測試Sketchfab模型
    console.log('\n5. 測試Sketchfab模型...');
    const sketchfabModelsResponse = await fetch(`${BASE_URL}/api/sketchfab/units/NC220-U001/models`);
    if (sketchfabModelsResponse.ok) {
      const models = await sketchfabModelsResponse.json();
      console.log(`✅ 單元 NC220-U001 有 ${models.length} 個Sketchfab模型:`);
      models.forEach((model, index) => {
        console.log(`   ${index + 1}. ${model.modelName}`);
        console.log(`      - Sketchfab ID: ${model.sketchfabModelId}`);
        console.log(`      - 創建時間: ${new Date(model.createdAt).toLocaleDateString()}`);
      });
    } else {
      console.log('❌ 無法獲取Sketchfab模型');
    }

    console.log('\n🎉 測試完成！');

  } catch (error) {
    console.error('❌ 測試過程中出現錯誤:', error.message);
  }
}

// 執行測試
testNamCheongProject(); 