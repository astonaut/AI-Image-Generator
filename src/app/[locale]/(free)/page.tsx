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
    <main className="relative z-10 flex flex-col items-center px-1 md:px-0">
      <div className="w-full pt-6 md:pt-10">
        <TopHero multiLanguage={multiLanguage} locale={locale} />
      </div>

      <div id="features" className="w-full scroll-mt-20 pt-14 md:pt-20">
        <FeatureHero multiLanguage={multiLanguage} />
      </div>

      <div className="w-full pt-16 md:pt-24">
        <UserExample multiLanguage={multiLanguage} images={images} />
      </div>

      <div className="w-full pt-16 md:pt-24">
        <What multiLanguage={multiLanguage} image={whatImage} />
      </div>

      <div className="w-full pt-16 md:pt-24">
        <How multiLanguage={multiLanguage} image={howImage} />
      </div>

      <div className="w-full pt-16 md:pt-24">
        <Faq multiLanguage={multiLanguage} grid={true} />
      </div>

      <div className="w-full py-16 md:py-24">
        <Cta multiLanguage={multiLanguage} />
      </div>
    </main>
  );
}
