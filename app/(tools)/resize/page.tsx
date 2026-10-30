import type { Metadata } from "next";
import { ToolPage } from "@/components/tool/tool-page";
import { ResizeTool } from "@/components/tools/resize-tool";
import { getTool } from "@/lib/tools";

const tool = getTool("resize");

export const metadata: Metadata = {
  title: tool.name,
  description: tool.description,
};

export default function ResizePage() {
  return (
    <ToolPage slug="resize">
      <ResizeTool />
    </ToolPage>
  );
}
