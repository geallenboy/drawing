'use server';

import { getUserByClerkId } from "@/services/user/user-service";
import { auth } from "@clerk/nextjs/server"

export async function getCurrentUser({ url = "" }: { url?: string }) {
  try {
    const resUsers = await auth()
    const { userId, redirectToSignIn } = resUsers
    console.log("Auth response:", { userId, sessionId: resUsers.sessionId })

    if (userId !== null) {
      try {
        const user = await getUserByClerkId(userId)

        if (!user) {
          console.log(`User with Clerk ID ${userId} not found in database. This may be due to a webhook delay or database connection issue.`)
        } else {
          console.log(`Successfully retrieved user data for Clerk ID ${userId}`)
        }

        return user
      } catch (error) {
        console.error(`Error fetching user with Clerk ID ${userId}:`, error)
        return null
      }
    } else {
      if (url === "") {
        return redirectToSignIn()
      } else {
        return null
      }
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}
