import type { Metadata } from "next";
import { ToolPage } from "@/components/tool/tool-page";
import { CompressTool } from "@/components/tools/compress-tool";
import { getTool } from "@/lib/tools";

const tool = getTool("compress");

export const metadata: Metadata = {
  title: tool.name,
  description: tool.description,
};

export default function CompressPage() {
  return (
    <ToolPage slug="compress">
      <CompressTool />
    </ToolPage>
  );
}
