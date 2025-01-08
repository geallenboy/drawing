import { NextResponse } from "next/server"


export async function POST(req: Request) {
    // const body = await req.json()
    // console.log(body)

    try {
        return NextResponse.json({
            success: true
        }, {
            status: 201
        })
    } catch (error) {
        console.log("Webhooks error:", error)
        return new NextResponse("Internal server error", { status: 500 })
    }
}