import Hero from '../components/Hero';
import NewArrivals from '../components/NewArrivals';
import ShopByCategory from '../components/ShopByCategory';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/NewsLetter';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function Home() {
  useDocumentTitle('ShirtStore — Modern clothing for everyday style');

  return (
    <main>
      <Hero />
      <NewArrivals />
      <ShopByCategory />
      <Testimonials />
      <Newsletter />
    </main>
  );
}

export default Home;
