// eslint-disable-next-line no-undef
// @ts-ignore
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js");
// eslint-disable-next-line no-undef
// @ts-ignore
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "your_keys",
  authDomain: "your_keys",
  projectId: "your_keys",
  storageBucket: "your_keys",
  messagingSenderId: "your_keys",
  appId: "your_keys",
  measurementId: "your_keys",
};
// eslint-disable-next-line no-undef
// @ts-ignore
firebase.initializeApp(firebaseConfig);
// eslint-disable-next-line no-undef
// @ts-ignore
const messaging = firebase.messaging();

// @ts-ignore
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "./logo.png",
  };
  // @ts-ignore
  self.registration.showNotification(notificationTitle, notificationOptions);
});
