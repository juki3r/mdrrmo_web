import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBEDM6XmZ-Z9l5HmeJ04B62pzK56vFoM_g",
  authDomain: "alertoph-6d47b.firebaseapp.com",
  projectId: "alertoph-6d47b",
  storageBucket: "alertoph-6d47b.firebasestorage.app",
  messagingSenderId: "220950485117",
  appId: "1:220950485117:web:9e3cc904a6048e3d83b914",
  measurementId: "G-LCW2DP32V6"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

export const generateToken = async () => {
  try {

    // ✅ register firebase service worker
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    // ✅ ask notification permission
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    // ✅ get FCM token
    const token = await getToken(messaging, {
      vapidKey:
        "BGGs2Lj4xXnlbijSkgUh9sDUrbCb4FvHqmbZVJgY9Cl-gxZywgXpArvKm730DOLbsjAt08swGPMi-fnrtVKMiQg",
      serviceWorkerRegistration: registration,
    });

    // console.log("FCM TOKEN:", token);

    if (!token) return;

    // ✅ save token to backend
    await fetch("https://ajcpisonet.com/api/save-web-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        fcm_token: token,
      }),
    });

  } catch (err) {
    console.error("FCM ERROR:", err);
  }
};