import { useEffect, useState } from "react";
import { type MessagePayload, onMessage } from "firebase/messaging";
import useFCMToken from "./use-fcm-token";
import { toast } from "sonner";
import { messaging } from "./firebase";

const useFCM = () => {
  const fcmToken = useFCMToken();
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const fcmmessaging = messaging();

      const unsubscribe = onMessage(fcmmessaging, (payload) => {
        toast.success(payload.notification?.title, { duration: 5000 });
        setMessages((messages) => [...messages, payload]);
      });
      return () => unsubscribe();
    }
  }, [fcmToken]);
  return { fcmToken, messages };
};

export default useFCM;
