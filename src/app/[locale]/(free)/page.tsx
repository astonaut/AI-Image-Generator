import WorkerWrapper from "@/components/replicate/img-to-video/worker-wraper";
import TopHero from "@/components/landingpage/top";
import What from "@/components/landingpage/what";
import How from "@/components/landingpage/how";
import Faq from "@/components/landingpage/faq";
import FeatureHero from "@/components/landingpage/feature";
import { getMetadata } from "@/components/seo/seo";
import UserExample from "@/components/landingpage/example";
import Cta from "@/components/landingpage/cta";

export async function generateMetadata({
  params,
}: {
  params: { locale?: string };
}) {
  return await getMetadata(params?.locale || "", "HomePage.seo", "");
}

export default function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const images = [
    {
      img: "/resources/example1.webp",
      video: "/resources/example1.mp4",
    },
    {
      img: "/resources/example2.webp",
      video: "/resources/example2.mp4",
    },
    {
      img: "/resources/example5.webp",
      video: "/resources/example5.mp4",
    },
  ];

  const whatImage = "/resources/example3.webp";
  const howImage = "/resources/example2.webp";

  const multiLanguage = "HomePage";

  return (
    <main className="flex flex-col items-center rounded-2xl px-3 md:rounded-3xl md:px-0">
      {/* Hero Section */}
      <div className="py-10 w-full">
        <TopHero multiLanguage={multiLanguage} locale={locale} />
      </div>

      {/* Features Section - with ID for navigation */}
      <div id="features" className="pt-16 md:pt-24 w-full scroll-mt-20">
        <FeatureHero multiLanguage={multiLanguage} />
      </div>

      {/* User Examples Gallery */}
      <div className="pt-20 md:pt-32">
        <UserExample multiLanguage={multiLanguage} images={images} />
      </div>

      {/* What Section */}
      <div className="pt-20 md:pt-32 w-full">
        <What multiLanguage={multiLanguage} image={whatImage} />
      </div>

      {/* How It Works */}
      <div className="pt-20 md:pt-32 w-full">
        <How multiLanguage={multiLanguage} image={howImage} />
      </div>

      {/* FAQ Section */}
      <div className="pt-20 md:pt-32 w-full">
        <Faq multiLanguage={multiLanguage} grid={true} />
      </div>

      {/* CTA Section */}
      <div className="py-20 md:py-32 w-full">
        <Cta multiLanguage={multiLanguage} />
      </div>
    </main>
  );
}
