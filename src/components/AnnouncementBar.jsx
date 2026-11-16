import { useState } from 'react';
import { Link } from 'react-router-dom';

function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-black px-4 py-2 text-center text-xs text-white sm:text-sm">
      <p>
        Products and prices are sourced from the connected catalogue API.
        <Link to="/products" className="ml-1 font-semibold underline">
          Browse products
        </Link>
      </p>

      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss announcement"
        className="ml-2 text-white/70 transition hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}

export default AnnouncementBar;
