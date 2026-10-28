import type { Metadata } from "next";
import { Lab } from "./lab";

export const metadata: Metadata = {
  title: "Lab — feasibility spike",
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return <Lab />;
}
