'use server';

import { getUserById } from "@/services/user/user-service";
import { auth } from "@clerk/nextjs/server"

export async function getCurrentUser({ url = "" }: { url?: string }) {
  try {
    const resUsers = await auth()
    const { userId, redirectToSignIn } = resUsers
    console.log("Auth response:", { userId, sessionId: resUsers.sessionId })

    if (userId !== null) {
      try {
        const result = await getUserById(userId)
        
        if (result.success && result.user) {
          console.log(`Successfully retrieved user data for Clerk ID ${userId}`)
          return result.user
        } else {
          console.log(`User with Clerk ID ${userId} not found in database. Attempting to sync user...`)
          
          // 尝试自动同步用户
          const { syncCurrentUserToDatabase } = await import("@/services/user/user-service")
          const syncResult = await syncCurrentUserToDatabase()
          
          if (syncResult.success && 'user' in syncResult) {
            console.log(`✅ User ${userId} successfully synced to database`)
            return syncResult.user
          } else {
            console.error(`❌ Failed to sync user ${userId}:`, syncResult.error)
            return null
          }
        }
      } catch (error) {
        console.error(`Error fetching user with Clerk ID ${userId}:`, error)
        
        // 如果是连接错误，尝试同步用户作为备用方案
        if (error instanceof Error && error.message.includes('Connection')) {
          console.log('Database connection issue detected, attempting user sync...')
          try {
            const { syncCurrentUserToDatabase } = await import("@/services/user/user-service")
            const syncResult = await syncCurrentUserToDatabase()
            
            if (syncResult.success && 'user' in syncResult) {
              console.log(`✅ User ${userId} synced successfully after connection error`)
              return syncResult.user
            }
          } catch (syncError) {
            console.error('Sync attempt also failed:', syncError)
          }
        }
        
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
