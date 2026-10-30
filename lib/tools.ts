import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  Binary,
  Eraser,
  FileImage,
  FilePen,
  FileText,
  Images,
  Info,
  Minimize2,
  PenTool,
  QrCode,
  Repeat2,
  Scaling,
  Smartphone,
} from "lucide-react";

export type ToolCategory = "image" | "ai" | "pdf" | "utility";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: ToolCategory;
  /** Roadmap stage that delivers the tool (docs/ROADMAP.md). */
  stage: string;
  /** Only available tools get a link; planned ones are listed without one. */
  available: boolean;
};

export const tools: Tool[] = [
  {
    slug: "image-info",
    name: "Image info",
    description: "Real format, dimensions, transparency, animation and EXIF, including GPS.",
    icon: Info,
    category: "image",
    stage: "W1",
    available: true,
  },
  {
    slug: "compress",
    name: "Compress",
    description: "Smaller JPEG, PNG, WebP and AVIF files, with the savings shown.",
    icon: Minimize2,
    category: "image",
    stage: "W2",
    available: true,
  },
  {
    slug: "resize",
    name: "Resize",
    description: "Exact sizes with contain, cover or fill, without upscaling by accident.",
    icon: Scaling,
    category: "image",
    stage: "W2",
    available: true,
  },
  {
    slug: "convert",
    name: "Convert",
    description: "Between PNG, JPEG, WebP, AVIF, BMP, TIFF and GIF. Also opens ICO.",
    icon: Repeat2,
    category: "image",
    stage: "W2",
    available: true,
  },
  {
    slug: "favicon",
    name: "ICO & favicon",
    description: "Multi-size ICO files and a complete favicon package.",
    icon: AppWindow,
    category: "image",
    stage: "W3",
    available: false,
  },
  {
    slug: "store-screenshots",
    name: "Store screenshots",
    description: "Every official App Store and Google Play size, without alpha.",
    icon: Smartphone,
    category: "image",
    stage: "W3",
    available: false,
  },
  {
    slug: "remove-background",
    name: "Remove background",
    description: "AI background removal on your own GPU. The photo stays on your device.",
    icon: Eraser,
    category: "ai",
    stage: "W4",
    available: false,
  },
  {
    slug: "svg-to-png",
    name: "SVG to PNG",
    description: "Rasterize SVG at any size, keeping transparency.",
    icon: FileImage,
    category: "image",
    stage: "W5",
    available: false,
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    description: "Combine images into one PDF with page size and margins.",
    icon: Images,
    category: "pdf",
    stage: "W6",
    available: false,
  },
  {
    slug: "pdf-to-images",
    name: "PDF to images",
    description: "Export pages as PNG or JPEG at the resolution you choose.",
    icon: FileText,
    category: "pdf",
    stage: "W6",
    available: false,
  },
  {
    slug: "png-to-svg",
    name: "PNG to SVG",
    description: "Trace logos into real vectors, or embed the image as-is.",
    icon: PenTool,
    category: "utility",
    stage: "W7",
    available: false,
  },
  {
    slug: "qr-code",
    name: "QR code",
    description: "Links, Wi-Fi, contacts and more, as PNG or SVG.",
    icon: QrCode,
    category: "utility",
    stage: "W7",
    available: false,
  },
  {
    slug: "base64",
    name: "Base64",
    description: "Encode and decode text and files, with real type detection.",
    icon: Binary,
    category: "utility",
    stage: "W7",
    available: false,
  },
  {
    slug: "pdf-editor",
    name: "PDF editor",
    description: "Merge, reorder, sign and truly redact PDFs.",
    icon: FilePen,
    category: "pdf",
    stage: "W8",
    available: false,
  },
];

export function getTool(slug: string): Tool {
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}
