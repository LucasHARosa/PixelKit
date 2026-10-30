import type { Metadata } from "next";
import { ToolPage } from "@/components/tool/tool-page";
import { ConvertTool } from "@/components/tools/convert-tool";
import { getTool } from "@/lib/tools";

const tool = getTool("convert");

export const metadata: Metadata = {
  title: tool.name,
  description: tool.description,
};

export default function ConvertPage() {
  return (
    <ToolPage slug="convert">
      <ConvertTool />
    </ToolPage>
  );
}
