import Hero from '../components/Hero';
import NewArrivals from '../components/NewArrivals';
import RecentlyViewed from '../components/RecentlyViewed';
import ShopByCategory from '../components/ShopByCategory';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/NewsLetter';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

function Home() {
  useDocumentTitle('ShirtStore — Modern clothing for everyday style');
  const { items: recentlyViewed, clear } = useRecentlyViewed();

  return (
    <main>
      <Hero />
      <NewArrivals />
      {recentlyViewed.length > 0 && (
        <section className="px-6 pb-4 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <RecentlyViewed items={recentlyViewed} onClear={clear} />
          </div>
        </section>
      )}
      <ShopByCategory />
      <Testimonials />
      <Newsletter />
    </main>
  );
}

export default Home;
