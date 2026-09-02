import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Graphood", short_name: "Graphood", description: "Modular business systems for ambitious teams",
        start_url: "/en", display: "standalone", background_color: "#0d0407", theme_color: "#0d0407",
        icons: [{ src: "/icon.png", sizes: "any", type: "image/png", purpose: "any" }, { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    };
}
