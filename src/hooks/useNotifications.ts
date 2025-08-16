import { toast } from "@/hooks/use-toast";
import type { Notification } from "@/types/notification";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const shownNotificationIds = useRef<Set<string>>(new Set());

  // Function to display toast sequentially with consistent timing
  const showSequentialToasts = async (unreadNotifs: Notification[]) => {
    const toastDuration = 5000; // Duration for each toast to stay visible (in ms)
    
    // Loop through each unread notification
    for (const notif of unreadNotifs) {
      if (!shownNotificationIds.current.has(notif.id)) {
        shownNotificationIds.current.add(notif.id);

        // Show the toast with the defined duration
        toast({
          title: "New Notification",
          description: notif.message,
          variant: "default",
          duration: toastDuration, // Ensure each toast lasts for the same time
        });

        // Wait for the current toast's duration to finish before showing the next
        await new Promise((resolve) => setTimeout(resolve, toastDuration + 500)); // Adding slight delay after the toast disappears
      }
    }
  };
  

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications");
      const fetched = res.data as Notification[];

      setNotifications(fetched);

      // Filter for unread notifications that haven't been shown yet
      const unreadNotifs = fetched.filter(
        (notif) => !notif.read && !shownNotificationIds.current.has(notif.id)
      );

      await showSequentialToasts(unreadNotifs);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 15 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return { notifications, fetchNotifications, markAllAsRead };
};

export default useNotifications;