import { NextResponse } from "next/server";

export async function POST() {
    // In development mode, we can try to exit the process.
    // NOTE: This will kill the server. In production/Vercel this does nothing meaningful or kills the lambda.

    // We'll use a small timeout to allow the response to be sent back to the client first.
    setTimeout(() => {
        console.log("Shutting down server via API request...");
        process.exit(0);
    }, 1000);

    return NextResponse.json({ message: "Server shutting down..." });
}
