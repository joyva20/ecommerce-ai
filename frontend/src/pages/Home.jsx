import ForYou from "../components/ForYou";
import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import NewsletterBox from "../components/NewsletterBox";
import OurPolicy from "../components/OurPolicy";

const Home = () => {
  return (
    <div>
      <Hero />
      <LatestCollection />
      <ForYou />
      <OurPolicy />
      <NewsletterBox />
    </div>
  );
};

export default Home;
