import { useEffect, useMemo, useState } from 'react';
import { listingService } from '../services/listing.service';
import ProductCard from '../components/marketplace/ProductCard';
import { logger } from '../lib/logger';

const CATEGORIES = ['All Produce', 'Vegetable', 'Fruit', 'Grain', 'Spice'];

const CATEGORY_MAP = {
  'All Produce': '',
  Vegetable: 'Vegetable',
  Fruit: 'Fruit',
  Grain: 'Grain',
  Spice: 'Spice',
};

const STATES = [
  { name: 'Maharashtra', districts: ['Nashik', 'Pune'] },
  { name: 'Punjab', districts: ['Amritsar', 'Ludhiana'] },
  { name: 'Tamil Nadu', districts: ['Coimbatore'] },
  { name: 'Karnataka', districts: ['Mysuru'] },
  { name: 'Andhra Pradesh', districts: ['Guntur'] },
  { name: 'Rajasthan', districts: ['Jaipur'] },
  { name: 'Madhya Pradesh', districts: ['Indore'] },
  { name: 'Uttar Pradesh', districts: ['Varanasi'] },
];

const CROPS = [
  'Tomato',
  'Onion',
  'Potato',
  'Rice',
  'Wheat',
  'Maize',
  'Chilli',
  'Turmeric',
  'Banana',
  'Mango',
  'Brinjal',
  'Cabbage',
  'Cauliflower',
  'Garlic',
  'Ginger',
  'Groundnut',
  'Soyabean',
  'Coconut',
  'Sugarcane',
  'Cotton',
];

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All Produce');
  const [query, setQuery] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    listingService
      .getAll({ page, limit: 12 })
      .then((res) => {
        if (cancelled) return;

        const data = res.data ?? res;

        const listingsData =
          data.listings ??
          data.items ??
          data.results ??
          data.data ??
          [];

        logger.info('MARKETPLACE', 'Listings loaded', {
          count: listingsData.length,
          page,
        });

        setListings(listingsData);
        setTotalPages(data.totalPages ?? data.total_pages ?? 1);
      })
      .catch((err) => {
        if (cancelled) return;

        logger.error('MARKETPLACE', 'Failed to load listings', err);
        setListings([]);
        setTotalPages(1);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const visible = useMemo(() => {
    let items = listings;

    const cat = CATEGORY_MAP[activeCategory];

    if (cat) {
      items = items.filter(
        (l) =>
          (l.crop_category || '').toLowerCase() === cat.toLowerCase()
      );
    }

    if (query) {
      items = items.filter((l) =>
        (l.crop_name || '')
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    }

    if (organicOnly) {
      items = items.filter((l) => l.is_organic);
    }

    if (stateFilter) {
      items = items.filter(
        (l) =>
          (l.state || '').toLowerCase() === stateFilter.toLowerCase()
      );
    }

    if (sortBy === 'price_asc') {
      items = [...items].sort(
        (a, b) => a.price_per_kg - b.price_per_kg
      );
    }

    if (sortBy === 'price_desc') {
      items = [...items].sort(
        (a, b) => b.price_per_kg - a.price_per_kg
      );
    }

    if (sortBy === 'freshness') {
      items = [...items].sort(
        (a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
      );
    }

    return items;
  }, [
    listings,
    activeCategory,
    query,
    organicOnly,
    sortBy,
    stateFilter,
  ]);

  // Material Symbols helper
  const symbol = (name, cls = '') => (
    <span
      className={`material-symbols ${cls}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8 lg:py-12">
          <div className="rounded-2xl bg-surface-container-highest px-6 lg:px-12 py-6 lg:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-container text-primary px-3 py-1 font-label-md text-label-md tracking-tight">
                  <span className="material-symbols text-base">
                    agriculture
                  </span>

                  Smart India Hackathon 2026 • SIH26033
                </span>

                <h1 className="mt-3 font-display-lg text-display-lg lg:text-headline-lg text-on-surface tracking-tight">
                  Khet Se Ghar Tak — Direct Farm-to-Market
                </h1>

                <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Browse fresh produce listed directly by farmers and
                  FPOs across 20 crops and 10 mandi districts. Prices
                  sourced from Agmarknet government data. No middlemen,
                  flat ₹30 delivery.
                </p>

                {/* Search */}
                <div className="mt-6 flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="flex-1 h-16 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant flex items-center gap-2 px-4">
                    {symbol('search', 'text-primary')}

                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search crops, varieties, locations..."
                      className="flex-1 h-full bg-transparent outline-none font-body-md text-body-md text-on-surface placeholder:text-outline"
                    />

                    <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors">
                      <span className="material-symbols text-base">
                        qr_code_scanner
                      </span>
                      Scan QR
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 hidden lg:flex justify-center">
                <div className="relative w-56 h-56">
                  <div className="absolute inset-0 rounded-full bg-surface-container-highest" />

                  <div className="absolute inset-4 rounded-full bg-surface-container-low flex flex-col items-center justify-center text-center">
                    <span className="material-symbols text-4xl text-primary">
                      query_stats
                    </span>

                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      20 crops tracked
                    </p>

                    <p className="font-data-metric text-data-metric text-on-surface">
                      10 mandi districts
                    </p>
                  </div>

                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-outline-variant" />
                </div>
              </div>
            </div>

            {/* Category pills */}
            <div className="mt-8 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`shrink-0 rounded-full px-4 py-2 font-label-md text-label-md transition-colors ${activeCategory === c
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MANDI COVERAGE */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Live Mandi Coverage
            </h2>

            <p className="font-body-md text-body-md text-on-surface-variant">
              Agmarknet price data across 20 crops and 10 districts in
              8 states
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant p-6">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Commodities covered
          </span>

          <div className="flex flex-wrap gap-2 mt-3">
            {CROPS.map((c) => (
              <span
                key={c}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md border border-outline-variant/30"
              >
                {c}
              </span>
            ))}
          </div>

          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold block mt-6">
            Mandi districts by state
          </span>

          <div className="flex flex-wrap gap-2 mt-3">
            {STATES.map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-label-md text-label-md"
              >
                <span className="font-semibold">{s.name}:</span>

                <span className="text-xs text-primary/80">
                  {s.districts.join(', ')}
                </span>
              </span>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-wrap items-center gap-4 text-body-sm text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              {symbol('verified', 'text-primary text-base')}
              Govt. Agmarknet source
            </span>

            <span className="flex items-center gap-1.5">
              {symbol('sync', 'text-tertiary text-base')}
              Daily forecast updates
            </span>

            <span className="flex items-center gap-1.5">
              {symbol('payments', 'text-secondary text-base')}
              Prices in ₹/quintal
            </span>
          </div>
        </div>
      </section>

      {/* LIVE LISTINGS GRID */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Live Listings
            </h2>

            <p className="font-body-md text-body-md text-on-surface-variant">
              Fresh produce from verified farmers and FPOs
            </p>
          </div>

          <span className="rounded-full bg-surface-container-highest px-3 py-1.5 font-label-md text-label-md text-on-surface-variant">
            {listings.length} active lots
          </span>
        </div>

        {/* Filters row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest shadow-xs border border-outline-variant px-3.5 py-2">
            {symbol('location_on', 'text-base text-primary')}

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-transparent outline-none font-body-sm text-body-sm text-on-surface"
            >
              <option value="">All States</option>

              {STATES.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => setOrganicOnly((o) => !o)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-label-md text-label-md transition-colors border ${organicOnly
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant'
              }`}
          >
            {symbol(
              organicOnly ? 'check_circle' : 'eco',
              'text-base'
            )}

            Organic Only
          </button>

          <button
            onClick={() => setOrganicOnly(false)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 font-label-sm text-label-sm text-primary bg-primary/10"
          >
            {symbol('schedule', 'text-sm')}
            Harvested &lt; 24h
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ml-auto h-10 rounded-lg bg-surface-container-lowest border border-outline-variant px-3 font-label-md text-label-md text-on-surface outline-none"
          >
            <option value="">Sort: Freshness</option>
            <option value="price_asc">
              Price: Low → High
            </option>
            <option value="price_desc">
              Price: High → Low
            </option>
            <option value="freshness">
              Harvest: Newest
            </option>
          </select>
        </div>

        {/* Product grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-surface-container-low animate-pulse h-72"
              />
            ))}

          {!loading &&
            visible.map((l) => (
              <ProductCard
                key={l.id}
                listing={l}
              />
            ))}

          {!loading && visible.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="font-body-md text-body-md text-on-surface-variant">
                No lots match your filters right now.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && listings.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              disabled={page <= 1}
              className="h-10 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant font-label-md text-label-md text-on-surface disabled:opacity-40 hover:bg-surface-container-low transition-colors"
            >
              Previous
            </button>

            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={page >= totalPages}
              className="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-40 hover:bg-primary-container hover:text-on-primary-container transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* PLATFORM ASSURANCE */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-6 pb-12">
        <div className="rounded-2xl bg-surface-container-highest p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 shrink-0 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center">
            {symbol('verified_user', 'text-3xl')}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Government-Backed Platform
            </h3>

            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Built for Smart India Hackathon 2026 under Ministry of
              Consumer Affairs (DoCA). Aadhaar OTP verification,
              Razorpay escrow payments, and full chain-of-custody
              tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="h-11 px-5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors">
              SIH26033 Details
            </button>

            <button className="h-11 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors">
              Ministry Portal
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}