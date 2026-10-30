import type { Metadata } from "next";
import { ToolPage } from "@/components/tool/tool-page";
import { ImageInfoTool } from "@/components/tools/image-info-tool";
import { getTool } from "@/lib/tools";

const tool = getTool("image-info");

export const metadata: Metadata = {
  title: tool.name,
  description: tool.description,
};

export default function ImageInfoPage() {
  return (
    <ToolPage slug="image-info">
      <ImageInfoTool />
    </ToolPage>
  );
}
