import { Link } from 'react-router-dom';
import { useCatalogue } from '../hooks/useCatalogue';
import heroSmall from '../assets/bg img/hero-640.jpg';
import heroLarge from '../assets/bg img/hero-1280.jpg';

function Hero() {
  const { items, isLoading } = useCatalogue();

  const categoryCount = new Set(items.map((product) => product.category)).size;
  const brandCount = new Set(items.map((product) => product.brand).filter(Boolean))
    .size;

  const stats = [
    { value: isLoading ? '—' : items.length, label: 'Curated pieces' },
    { value: isLoading ? '—' : categoryCount, label: 'Categories' },
    { value: isLoading ? '—' : brandCount, label: 'Brands' },
  ];

  return (
    <section className="bg-gray-100">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-14 md:px-10 lg:px-16 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            The ShirtStore collection
          </p>

          <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
            FIND CLOTHES THAT MATCH YOUR STYLE
          </h1>

          <p className="mt-6 max-w-lg text-gray-600">
            Shirts, dresses, tops, shoes, bags and sunglasses — a curated
            storefront with live product data from the connected catalogue API.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Shop the collection
            </Link>

            <Link
              to="/products?sort=newest"
              className="rounded-full border border-gray-300 bg-white px-8 py-3 text-sm font-semibold transition hover:border-black"
            >
              New arrivals
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-gray-300 pt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="order-2 mt-1 text-xs text-gray-500 md:text-sm">
                  {stat.label}
                </dt>
                <dd className="text-2xl font-bold md:text-3xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="w-full lg:h-[650px]">
          <img
            src={heroSmall}
            srcSet={`${heroSmall} 640w, ${heroLarge} 1280w`}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Models wearing pieces from the ShirtStore collection"
            width="640"
            height="960"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
