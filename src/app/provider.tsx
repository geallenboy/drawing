"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/clerk";
import { useAuth } from "@clerk/nextjs";
import { UserSync } from "@/components/custom/user-sync";

export default function Provider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useUserStore();
  const pathname = usePathname();
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  console.log(userId, 33);
  // Maximum number of retries and exponential backoff delay
  const MAX_RETRIES = 5;
  const getRetryDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000);

  const init = useCallback(async () => {
    if (!isAuthLoaded) return;

    if (userId) {
      try {
        setLoading(true);
        setLastError(null);
        console.log(`Attempting to fetch user data (attempt ${retryCount + 1}/${MAX_RETRIES})`);

        const data = await getCurrentUser({ url: "/" });
        console.log(data, 33);
        if (data) {
          console.log(`Successfully loaded user data for ${data.fullName} (${data.email})`);
          setUser({
            id: data.id,
            email: data.email,
            fullName: data.fullName,
            avatarUrl: data.avatarUrl,
            bio: data.bio || null,
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date(),
          });
        } else if (retryCount < MAX_RETRIES) {
          // If user data is not found, retry with exponential backoff
          const delay = getRetryDelay(retryCount);
          console.log(
            `User data not found, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`
          );

          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, delay);

          // Keep loading state true while we're retrying
          return;
        } else {
          console.error(`Failed to load user data after ${MAX_RETRIES} attempts`);
          setLastError("Failed to load user data. Please refresh the page or try again later.");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error fetching user data:", errorMessage);
        setLastError(errorMessage);

        // Retry on certain errors, especially database connection issues
        if (
          retryCount < MAX_RETRIES &&
          (errorMessage.includes("Connection terminated") ||
            errorMessage.includes("database") ||
            errorMessage.includes("timeout"))
        ) {
          const delay = getRetryDelay(retryCount);
          console.log(
            `Database error, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`
          );

          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, delay);

          // Keep loading state true while we're retrying
          return;
        }
      } finally {
        setLoading(false);
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [userId, isAuthLoaded, setUser, setLoading, retryCount, MAX_RETRIES]);

  useEffect(() => {
    console.log(11133);
    if (pathname !== "/sign-in" && pathname !== "/sign-up" && isAuthLoaded) {
      init();
    } else {
      console.log("Sign-in/Sign-up page or auth not loaded yet");
      setLoading(false);
    }
  }, [init, pathname, isAuthLoaded, retryCount, setLoading]);

  // Reset retry count when userId changes
  useEffect(() => {
    if (userId) {
      setRetryCount(0);
      setLastError(null);
    }
  }, [userId]);

  return (
    <>
      <UserSync />
      {children}
    </>
  );
}
