import { Suspense } from "react";
import { HomePageClient } from "../components/HomePageClient";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="site-shell">
          <section className="section">
            <p className="eyebrow">Loading</p>
            <h1 className="hero-title">Preparing the interactive migration simulation...</h1>
          </section>
        </main>
      }
    >
      <HomePageClient />
    </Suspense>
  );
}
