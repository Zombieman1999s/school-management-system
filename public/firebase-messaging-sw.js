importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ⚠️ ใส่ Config ของอาร์มตรงนี้ (ต้องตรงกับ index.html)
firebase.initializeApp({
  apiKey: "AIzaSyDYqVJFyuge_4PcObIBMB9h5oIT3fYWuHM",
            authDomain: "school-management-system-10cbb.firebaseapp.com",
            projectId: "school-management-system-10cbb",
            storageBucket: "school-management-system-10cbb.firebasestorage.app",
            messagingSenderId: "674779385916",
            appId: "1:674779385916:web:9a26e4d25282dc23a6f339"
});

const messaging = firebase.messaging();

// รับข้อความตอนปิดแอป (Background)
messaging.onBackgroundMessage((payload) => {
  console.log('ได้รับข้อความขณะปิดแอป:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});