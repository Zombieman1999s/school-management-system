/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const nodemailer = require("nodemailer"); 

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

// ============================================================
// 📧 ตั้งค่าอีเมลคนส่ง (Gmail ของอาร์ม)
// ============================================================
// 👇 1. ใส่อีเมลจริงของอาร์มตรงนี้
const MY_EMAIL = "armvbn.123my4@gmail.com"; 

// 👇 2. ใส่รหัส 16 หลักที่เพิ่งได้มา (เว้นวรรคหรือไม่เว้นก็ได้)
const MY_PASSWORD = "xhsh pwsi tshz dwsf";   

// 👇 3. อีเมลปลายทาง (ใครจะเป็นคนรับแจ้งเตือน? ใส่อีเมลตัวเองก็ได้เพื่อเทส)
const ADMIN_EMAIL = "armvbn.123my4@gmail.com"; 


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: MY_EMAIL,
        pass: MY_PASSWORD,
    },
});

// ============================================================
// 🔥 ฟังก์ชันหลัก: แจ้งเตือนซ่อม (ทำงานเมื่อมีเอกสารใหม่)
// ============================================================
exports.notifyRepair = onDocumentCreated("repair_requests/{docId}", async (event) => {
    // 1. ดึงข้อมูลที่เพิ่งแจ้งเข้ามา
    const data = event.data?.data();
    if (!data) return;

    console.log("🛠️ มีรายการแจ้งซ่อมใหม่:", data.location);

    // ------------------------------------------------
    // 📨 ส่วนที่ 1: ส่งอีเมลหา Admin
    // ------------------------------------------------
    const mailOptions = {
        from: `"ระบบแจ้งซ่อม HQU2" <${MY_EMAIL}>`,
        to: ADMIN_EMAIL, 
        subject: `🔥 งานเข้าใหม่! สถานที่: ${data.location}`,
        html: `
            <div style="font-family: 'Sarabun', sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #d9534f;">🔧 มีรายการแจ้งซ่อมใหม่</h2>
                <hr>
                <p><strong>📍 สถานที่:</strong> ${data.location}</p>
                <p><strong>📦 อุปกรณ์:</strong> ${data.equipment || "-"}</p>
                <p><strong>📝 อาการ:</strong> ${data.description}</p>
                <p><strong>👤 ผู้แจ้ง:</strong> ${data.reporterName || "ไม่ระบุ"}</p>
                <p><strong>⏰ เวลา:</strong> ${new Date().toLocaleString('th-TH')}</p>
                <br>
                <a href="https://school-management-system-10cbb.web.app/" style="background: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">เปิดดูรายละเอียด</a>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ ส่งอีเมลสำเร็จ!");
    } catch (error) {
        console.error("❌ ส่งอีเมลล้มเหลว:", error);
    }

    // ------------------------------------------------
    // 📱 ส่วนที่ 2: ส่ง Notification เข้ามือถือ (แถมให้)
    // ------------------------------------------------
    try {
        // หาคนที่เป็นช่าง (technician) หรือแอดมิน (admin)
        const usersSnapshot = await db.collection("users")
            .where("role", "in", ["technician", "admin"])
            .get();

        const tokens = [];
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.fcmToken) {
                tokens.push(userData.fcmToken);
            }
        });

        if (tokens.length > 0) {
            await messaging.sendEachForMulticast({
                tokens: tokens,
                notification: {
                    title: "🔧 มีแจ้งซ่อมใหม่!",
                    body: `ที่ ${data.location}: ${data.description}`,
                },
                data: {
                    url: "/technician_dashboard.html"
                }
            });
            console.log(`📲 ส่งแจ้งเตือนแอปไปหา ${tokens.length} เครื่อง`);
        }
    } catch (error) {
        console.error("❌ ส่งแจ้งเตือนแอปล้มเหลว:", error);
    }
});