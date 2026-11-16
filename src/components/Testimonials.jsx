const reviews = [
  {
    name: 'Sarah M.',
    review:
      'I am blown away by the quality and style of the clothes I received. From casual wear to elegant dresses, every piece has exceeded my expectations.',
  },
  {
    name: 'Alex K.',
    review:
      'Finding clothes that align with my personal style used to be a challenge. The range of options here is genuinely impressive.',
  },
  {
    name: 'James L.',
    review:
      'As someone who is always looking for unique fashion pieces, I am thrilled to have found this store. The selection is diverse and always on trend.',
  },
];

function Testimonials() {
  return (
    <section className="px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-2">
          <h2 className="text-3xl font-black md:text-4xl">
            WHAT CUSTOMERS SAY
          </h2>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="rounded-2xl border border-gray-200 p-6"
            >
              <div className="mb-4 text-yellow-400">
                <span aria-hidden="true">★★★★★</span>
                <span className="sr-only">Rated 5 out of 5</span>
              </div>

              <h3 className="mb-3 font-bold">{review.name}</h3>

              <p className="text-sm leading-6 text-gray-500">
                “{review.review}”
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
