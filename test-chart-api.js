const axios = require('axios');

async function testChartApi() {
  try {
    const response = await axios.post('http://localhost:3001/api/v1/chart-data', {
      dateOfBirth: '1990-01-01',
      timeOfBirth: '12:00',
      locationName: 'Chennai',
      latitude: 13.0827,
      longitude: 80.2707
    });
    
    console.log('API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.rasi && response.data.data.navamsa) {
      console.log('✅ Chart data received successfully!');
    } else {
      console.log('❌ Unexpected response format');
    }
  } catch (error) {
    console.error('Error testing chart API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testChartApi();
