"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import useNotifications from "@/hooks/useNotifications";
import { createPortal } from "react-dom";

export default function NotificationBell() {
  const { notifications, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [bellPosition, setBellPosition] = useState<DOMRect | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  const handleOpenNotifications = (e: React.MouseEvent) => {
    const target = e.currentTarget.getBoundingClientRect();
    setBellPosition(target);
    setIsOpen((prev) => !prev);
  };

  const handleMarkAsRead = () => {
    markAllAsRead?.();
  };

  // Close on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      
      // Auto-focus the panel when opened for keyboard navigation
      panelRef.current?.focus();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  // Handle positioning to prevent off-screen issues
  const getPanelPosition = () => {
    if (!bellPosition) return {};
    
    const rightSpace = window.innerWidth - bellPosition.right;
    const leftSpace = bellPosition.left;
    const topPosition = bellPosition.bottom + 8;
    
    // Default to right-aligned, but switch to left if not enough space
    if (rightSpace < 256 && leftSpace > 256) {
      return {
        right: window.innerWidth - bellPosition.left,
        top: topPosition,
      };
    }
    
    return {
      left: Math.min(bellPosition.right - 256, window.innerWidth - 272), // 272 = 256 + 16 (margin)
      top: topPosition,
    };
  };

  return (
    <>
      {/* Bell button with better accessibility */}
      <button
        className={cn(
          "relative size-10 rounded-full inline-grid place-content-center",
          "dark:text-neutral-400 text-neutral-600",
          "dark:hover:bg-neutral-800 hover:bg-neutral-100",
          "transition-colors duration-200 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "dark:focus:ring-offset-neutral-900"
        )}
        onClick={handleOpenNotifications}
        type="button"
        aria-label={`Notifications ${unread > 0 ? `${unread} unread` : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 dark:bg-red-500" />
            <span className={cn(
              "relative inline-flex items-center justify-center rounded-full",
              "size-4 text-[10px] font-medium text-white bg-red-500",
              "dark:bg-red-600"
            )}>
              {unread > 9 ? "9+" : unread}
            </span>
          </span>
        )}
      </button>

      {/* Notification panel with animations and better positioning */}
      {isOpen && bellPosition &&
        createPortal(
          <div
            ref={panelRef}
            id="notification-panel"
            style={getPanelPosition()}
            className={cn(
              "z-50 w-80 max-w-[90vw] fixed",
              "bg-white dark:bg-neutral-900",
              "border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl",
              "transform transition-all duration-200 ease-out",
              "origin-top-right",
              isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0",
              "focus:outline-none" // For keyboard navigation
            )}
            tabIndex={-1} // Make focusable
          >
            <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-l font-semibold text-neutral-800 dark:text-neutral-200">
                  Notifications
                  {unread > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {unread} new
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2">
                  {/* <button
                    onClick={handleMarkAsRead}
                    disabled={unread === 0}
                    className={cn(
                      "text-xs px-2 py-1 rounded-md",
                      "text-blue-600 dark:text-blue-400 hover:underline",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "focus:outline-none focus:ring-1 focus:ring-blue-500"
                    )}
                  >
                    Mark all read
                  </button> */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "size-6 rounded-full inline-flex items-center justify-center",
                      "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200",
                      "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                      "focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    )}
                    aria-label="Close notifications"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="overflow-y-auto flex-1">
                {notifications.length > 0 ? (
                  <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={cn(
                          "p-4 transition-colors duration-150",
                          "hover:bg-neutral-50 dark:hover:bg-neutral-800",
                          notification.read
                            ? "bg-white dark:bg-neutral-900"
                            : "bg-blue-50 dark:bg-blue-900/30"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {!notification.read && (
                            <span className="mt-1 size-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className={cn(
                              "text-sm",
                              notification.read 
                                ? "text-neutral-600 dark:text-neutral-400"
                                : "font-medium text-neutral-900 dark:text-white"
                            )}>
                              {notification.message}
                            </p>
                            {notification.timestamp && (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {new Date(notification.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Bell className="w-8 h-8 text-neutral-400 dark:text-neutral-600 mb-2" />
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                      No notifications yet
                    </p>
                    <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                      We'll notify you when something arrives
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-2 border-t border-neutral-200 dark:border-neutral-700 text-center">
                  {/* <button
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={handleMarkAsRead}
                  >
                    Mark all as read
                  </button> */}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}