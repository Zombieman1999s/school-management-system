const CACHE_NAME = "school-hub-v1";
const urlsToCache = [
  "/",
  "index.html",
  "dashboard.html",
  "repair_form.html",
  "technician_dashboard.html",
  "vehicle_form.html",
  "transport_dashboard.html",
  "leave_form.html",
  "personnel_dashboard.html",
  "outside_form.html",
  "manpower_form.html",
  "my_history.html",
  "admin_register.html",
  "admin_news.html",
  "admin_report.html",
  "manifest.json",
  "icon.png"
];

// ติดตั้ง Service Worker และเก็บไฟล์ลง Cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// ดึงข้อมูลจาก Cache (ถ้ามี) ทำให้โหลดไว
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// อัปเดต Cache เมื่อมีการเปลี่ยนเวอร์ชัน
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});