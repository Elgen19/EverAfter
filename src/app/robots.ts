import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/create", "/login", "/coming-soon"],
      disallow: [
        "/dashboard", 
        "/dashboard/", 
        "/profile", 
        "/profile/", 
        "/recipient-setup", 
        "/recipient-setup/",
        "/letter",
        "/letter/",
        "/animation",
        "/animation/"
      ],
    },
    sitemap: "https://everafterletters.xyz/sitemap.xml",
  };
}
