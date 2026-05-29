// src/notifications.js

import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./notifications/firebase";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BGGs2Lj4xXnlbijSkgUh9sDUrbCb4FvHqmbZVJgY9Cl-gxZywgXpArvKm730DOLbsjAt08swGPMi-fnrtVKMiQg",
      });

      console.log("FCM TOKEN:", token);

      // SAVE TOKEN TO BACKEND
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
    }
  } catch (err) {
    console.log("Notification Error:", err);
  }
};

// FOREGROUND MESSAGE
export const listenNotifications = () => {
  onMessage(messaging, payload => {
    console.log("MESSAGE RECEIVED:", payload);

    alert(payload.notification?.title + "\n" + payload.notification?.body);
  });
};