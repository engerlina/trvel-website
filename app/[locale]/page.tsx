import { Header, Footer } from '@/components/layout';
import {
  Hero,
  Plans,
  WhyTrvel,
  Comparison,
  HowItWorks,
  Testimonials,
  Destinations,
} from '@/components/sections';

export default async function HomePage() {
  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        <Hero />
        <Plans />
        <WhyTrvel />
        <Comparison />
        <HowItWorks />
        <Testimonials />
        <Destinations />
      </main>
      <Footer />
    </>
  );
}
