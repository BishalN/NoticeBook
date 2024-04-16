"use client";

import { useEffect, useState } from "react";

const useNotificationPermissionStatus = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    const handler = () => setPermission(Notification.permission);
    handler();
    void Notification.requestPermission().then(handler);

    void navigator.permissions.query({ name: "notifications" }).then((notificationPerm) => {
      notificationPerm.onchange = handler;
    });
  }, []);

  return permission;
};

export default useNotificationPermissionStatus;
