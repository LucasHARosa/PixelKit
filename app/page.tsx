import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-4 py-24">
      <h1 className="text-3xl font-semibold">PixelKit</h1>
      <p className="text-neutral-600">
        Image and PDF tools that run entirely in your browser. Work in progress.
      </p>
      <Link href="/lab" className="underline underline-offset-4">
        Feasibility spike (W0)
      </Link>
    </main>
  );
}
