import type { MetadataRoute } from "next";

interface ExtendedScreenshot {
  src: string;
  sizes?: string;
  type?: string;
  form_factor?: string;
}

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Papers: by CodeChefVIT",
    short_name: "Papers",
    description:
      "Discover previous year question papers created by CodeChef-VIT at Vellore Institute of Technology",
    start_url: "/",
    display: "standalone",
    background_color: "#10011a",
    theme_color: "#10011a",
    categories: [
      "education",
      "reference",
      "productivity",
      "technology"
    ],
    shortcuts: [
      {
        "name": "Upload",
        "short_name": "Upload",
        "description": "Upload a paper",
        "url": "/upload",
        "icons": [
          {
            "src": "/assets/icons/icon-192x192.webp",
            "sizes": "192x192",
            "type": "image/webp"
          }
        ]
      },
    ],
    icons: [
      { src: "/assets/icons/icon-192x192.webp", sizes: "192x192", type: "image/webp", purpose: "maskable" },
      { src: "/assets/icons/icon-196x196.webp", sizes: "196x196", type: "image/webp" },
      { src: "/assets/icons/icon-228x228.webp", sizes: "228x228", type: "image/webp" },
      { src: "/assets/icons/icon-256x256.webp", sizes: "256x256", type: "image/webp" },
      { src: "/assets/icons/icon-384x384.webp", sizes: "384x384", type: "image/webp" },
      { src: "/assets/icons/icon-512x512.webp", sizes: "512x512", type: "image/webp", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/screenshots/screenshot-hero.avif",
        sizes: "638x1380",
        type: "image/avif",
      },
      {
        src: "/screenshots/screenshot-prepare.avif",
        sizes: "638x1380",
        type: "image/avif",
      },
      {
        src: "/screenshots/screenshot-faq.avif",
        sizes: "638x1380",
        type: "image/avif",
      },
      {
        src: "/screenshots/screenshot-hero-wide.avif",
        sizes: "2880x1556",
        type: "image/avif",
        form_factor: "wide",
      },
      {
        src: "/screenshots/screenshot-prepare-wide.avif",
        sizes: "2880x1556",
        type: "image/avif",
        form_factor: "wide",
      },
      {
        src: "/screenshots/screenshot-faq-wide.avif",
        sizes: "2880x1556",
        type: "image/avif",
        form_factor: "wide",
      },
    ] as ExtendedScreenshot[],
  };
}
