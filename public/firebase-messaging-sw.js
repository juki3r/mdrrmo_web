importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBEDM6XmZ-Z9l5HmeJ04B62pzK56vFoM_g",
  authDomain: "alertoph-6d47b.firebaseapp.com",
  projectId: "alertoph-6d47b",
  storageBucket: "alertoph-6d47b.firebasestorage.app",
  messagingSenderId: "220950485117",
  appId: "1:220950485117:web:9e3cc904a6048e3d83b914",
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log("BG:", payload);

  const title = payload.data?.title || "Notification";
  const body = payload.data?.body || "";

  self.registration.showNotification(title, {
    body,
    icon: "/drr.png",
    badge: "/drr.png",
    data: payload.data || {},
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url.includes(url)) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});