const axios = require('axios');

async function verify() {
  const baseURL = 'http://localhost:5001/api';
  
  try {
    console.log('1. Logging in as student...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'test@university.edu',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('✅ Login successful');

    console.log('1.5. Fetching events...');
    const eventsRes = await axios.get(`${baseURL}/events`);
    const eventId = eventsRes.data[0]._id;
    console.log(`✅ Using event: ${eventsRes.data[0].title}`);

    console.log('2. Submitting feedback...');
    const feedbackRes = await axios.post(`${baseURL}/feedback`, {
      message: 'The event was fantastic! The organizers did a great job, though the food ran out a bit early.',
      rating: 5,
      eventId: eventId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Feedback submitted');
    console.log('AI Sentiment:', feedbackRes.data.sentiment);
    console.log('AI Suggested Reply:', feedbackRes.data.aiSuggestedReply);

    console.log('3. Verifying in dashboard (Organizer)...');
    const adminLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@university.edu',
      password: 'password123'
    });
    const adminToken = adminLogin.data.token;
    
    const dashboardRes = await axios.get(`${baseURL}/feedback`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const latest = dashboardRes.data[dashboardRes.data.length - 1];
    console.log('✅ Found feedback in dashboard');
    console.log('Dashboard Entry Sentiment:', latest.sentiment);
    
    if (latest.sentiment && latest.aiSuggestedReply) {
      console.log('🚀 WORKFLOW VERIFIED: AI Analysis is operational!');
    } else {
      console.log('❌ AI Analysis fields missing!');
    }

  } catch (err) {
    console.error('❌ Verification failed:', err.response?.data || err.message);
  }
}

verify();
