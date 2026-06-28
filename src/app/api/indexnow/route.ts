import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { urls } = body;

    // Validate that urls are provided and is an array of strings
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'urls' array parameter." },
        { status: 400 }
      );
    }

    const host = request.headers.get("host") || "everafterletters.xyz";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const key = "c8a24b17f56b48d2bc3911c75c00e12d";
    
    // Construct the absolute urls and absolute key location
    const absoluteKeyLocation = `${protocol}://${host}/${key}.txt`;
    const absoluteUrls = urls.map((url: string) => {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
      // Strip leading slash if present
      const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
      return `${protocol}://${host}/${cleanUrl}`;
    });

    const indexNowPayload = {
      host: host,
      key: key,
      keyLocation: absoluteKeyLocation,
      urlList: absoluteUrls
    };

    console.log("Submitting to IndexNow:", indexNowPayload);

    // Call the IndexNow API
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(indexNowPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IndexNow API responded with status ${response.status}: ${errorText}`);
    }

    return NextResponse.json({
      success: true,
      message: "URLs successfully submitted to IndexNow.",
      submittedUrls: absoluteUrls
    });
  } catch (error: any) {
    console.error("IndexNow submission failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit URLs to IndexNow." },
      { status: 500 }
    );
  }
}
