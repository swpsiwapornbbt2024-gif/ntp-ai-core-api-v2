Const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

// 1. CONFIGURATION & SETUP
// ********** IMPORTANT: CONNECTION STRING **********
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const app = express();

// Server ที่ Deploy บน Render จะใช้ PORT ที่ระบบกำหนด
const port = process.env.PORT || 3000; 
// กำหนด Host เป็น 0.0.0.0 ตามคำแนะนำของ Render
const host = '0.0.0.0'; 

// 2. MIDDLEWARE (ต้องอยู่ก่อน API Endpoints และ app.listen)
app.use(cors());
app.use(express.json());

// 3. API ENDPOINTS
// API Endpoint: Health Check
app.get('/', (req, res) => {
    res.send('NTP AI Core API V2 is Online and ready to serve!');
});

// API Endpoint หลัก: ดึงข้อมูลเชื่อมโยงเพื่อสร้างรายได้
app.get('/api/social_impact_data', async (req, res) => {
    try {
        // แนะนำให้ connect() ในทุก request หรือจัดการ Connection pool ใน Production
        await client.connect();
        
        const logisticsDB = client.db('logistics'); 
        const ntpLogisticsDB = client.db('ntp_logistics'); 

        // ดึงข้อมูล
        const latestJobs = await logisticsDB.collection('jobs').find({}).sort({ date: -1 }).limit(5).toArray();
        const maintenanceAlerts = await ntpLogisticsDB.collection('maintenance').find({ status: 'pending' }).limit(5).toArray();
        
        res.status(200).json({
            status: "success",
            message: "Core data synchronized and ready for AI analysis.",
            latest_jobs: latestJobs,
            maintenance_alerts: maintenanceAlerts 
        });
    } catch (error) {
        console.error("Connection or Data Retrieval Error:", error);
        res.status(500).json({ status: "error", message: "Internal server error. Failed to connect or retrieve data." });
    } finally {
        // ควร close client หรือจัดการ connection pool ที่นี่
    }
});

// 4. START SERVER (เรียกใช้เพียงครั้งเดียว พร้อมกำหนด host)
app.listen(port, host, () => { 
    console.log(`Server listening on ${host}:${port}`);
});
