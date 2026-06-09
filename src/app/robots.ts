import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/profile/", "/create/", "/recipient-setup/"],
    },
    sitemap: "https://everafter-love.vercel.app/sitemap.xml", // Make sure to replace this with your custom domain if you connect one
  };
}
