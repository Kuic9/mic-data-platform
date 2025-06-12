// 測試服務器是否正常運行
const http = require('http');

const testServer = () => {
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/sketchfab/models',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test_token'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`狀態碼: ${res.statusCode}`);
    console.log(`響應頭: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('響應數據:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ 服務器運行正常，API可以訪問');
      } else if (res.statusCode === 401) {
        console.log('⚠️ 服務器運行正常，但需要認證（這是正常的）');
      } else {
        console.log('❌ 服務器響應異常');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`請求遇到問題: ${e.message}`);
    console.log('❌ 服務器可能沒有運行，請啟動服務器：node server.js');
  });

  req.end();
};

console.log('正在測試服務器連接...');
testServer(); 