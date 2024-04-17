import { env } from "@/env";
import { remember } from "@epic-web/remember";

import admin from "firebase-admin";

export const firebase_admin = remember("firebase-admin", () => {
  return admin.initializeApp({
    credential: admin.credential.cert({
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
      projectId: env.FIREBASE_PROJECT_ID,
    }),
  });
});

firebase_admin.appCheck();

// firebase_admin.messaging().sendEachForMulticast({tokens})

// // Initialize Firebase Admin SDK with appropriate credentials
// export const firebase_admin = admin.initializeApp(
//   {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-var-requires
//     credential: admin.cert(require("./service_account.json")),
//   },
//   "firebase-admin",
// );

// we can now use this client to interact with Firebase services
// so whenever a group-post is created
// we can send a notification to all users in that group
// to notify them of the new post

// format of the notification
// {title: title of post, excerpt: short detail of post,
// postId: id of post, username: group-username}
