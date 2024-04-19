"use client";

import { api } from "@/trpc/react";
import useFCM from "@/utils/useFcm";
import React, { useEffect } from "react";

export const NotificationManager = () => {
  const { fcmToken } = useFCM();

  const addFCMToken = api.user.addFCMToken.useMutation();

  // TODO: Don't send the token every time
  // Only send it if it's different
  // Use some different logic to handle this
  // This will send the token every time the component is mounted
  useEffect(() => {
    if (fcmToken) {
      addFCMToken.mutate({ token: fcmToken });
    }
  }, [fcmToken]);

  return (
    <>
      {/* <h1>Notifications</h1>
      <p className="max-w-2xl">Token: {fcmToken}</p>
      <ul>
        {messages.map((message, i) => (
          <li key={i}>{JSON.stringify(message.data, null, 2)}</li>
        ))}
      </ul> */}
    </>
  );
};
