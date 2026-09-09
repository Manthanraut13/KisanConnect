import { useEffect, useMemo, useState } from 'react';
import { listingService } from '../services/listing.service';
import ProductCard from '../components/marketplace/ProductCard';
import { logger } from '../lib/logger';

const CATEGORIES = ['All Produce', 'Crisp Vegetables', 'Field Fruits', 'Legacy Grains', 'Assorted Spices'];

const CATEGORY_MAP = {
  'All Produce': '',
  'Crisp Vegetables': 'Vegetable',
  'Field Fruits': 'Fruit',
  'Legacy Grains': 'Grain',
  'Assorted Spices': 'Spice',
};

const NODES = ['Received', 'Quality Screened', 'In Transit', 'Out for Delivery', 'Delivered'];

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All Produce');
  const [query, setQuery] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [radius, setRadius] = useState(100);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listingService
      .getAll({ page, limit: 12 })
      .then((res) => {
        if (cancelled) return;
        const data = res.data ?? res;
        const listingsData = data.listings ?? data.items ?? data.results ?? data.data ?? [];
        logger.info('MARKETPLACE', 'Listings loaded', { count: listingsData.length, page });
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
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const visible = useMemo(() => {
    let items = listings;
    const cat = CATEGORY_MAP[activeCategory];
    if (cat) items = items.filter((l) => (l.crop_category || '').toLowerCase() === cat.toLowerCase());
    if (query) items = items.filter((l) => (l.crop_name || '').toLowerCase().includes(query.toLowerCase()));
    if (organicOnly) items = items.filter((l) => l.is_organic);
    if (sortBy === 'price_asc') items = [...items].sort((a, b) => a.price_per_kg - b.price_per_kg);
    if (sortBy === 'price_desc') items = [...items].sort((a, b) => b.price_per_kg - a.price_per_kg);
    if (sortBy === 'freshness') items = [...items].sort((a, b) => (new Date(b.created_at) - new Date(a.created_at)));
    return items;
  }, [listings, activeCategory, query, organicOnly, sortBy]);

  const symbol = (name, cls = '') => (
    <span className={`material-symbols ${cls}`} aria-hidden="true">{name}</span>
  );

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto px-space-lg lg:px-space-2xl py-space-xl lg:py-space-2xl">
          <div className="rounded-2xl bg-surface-container-highest px-6 lg:px-12 py-6 lg:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-container text-primary px-3 py-1 font-label-md text-label-md tracking-tight">
                  <span className="material-symbols text-base">percent</span>
                  Direct Field-to-Fork Protocol
                </span>
                <h1 className="mt-3 font-display-lg text-display-lg lg:text-headline-lg text-on-surface tracking-tight">
                  Agricultural Spot Procurement
                </h1>
                <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  The premier breakout marketplace for just-harvested lots, live-bid warehouse
                  movements, and commodity-grade receivables. Every listing is telemetry-verified
                  and quality-scored by independent graders.
                </p>
                {/* Live inventory stat + search */}
                <div className="mt-6 flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="sm:w-[190px] h-16 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant flex items-center gap-3 px-4">
                    <span className="material-symbols text-primary">inventory_2</span>
                    <div>
                      <p className="font-data-metric text-data-metric leading-none text-on-surface">
                        {loading ? '…' : listings.length}
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Sofeed lots live</p>
                    </div>
                  </div>
                  <div className="flex-1 h-16 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant flex items-center gap-2 px-4">
                    {symbol('search', 'text-primary')}
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search high-yield grains, fresh lots..."
                      className="flex-1 h-full bg-transparent outline-none font-body-md text-body-md text-on-surface placeholder:text-outline"
                    />
                    <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors">
                      <span className="material-symbols text-base">qr_code_scanner</span>
                      Scan Lots
                    </button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 hidden lg:flex justify-center">
                {/* Stylized freshness wheel */}
                <div className="relative w-56 h-56">
                  <div className="absolute inset-0 rounded-full bg-surface-container-highest" />
                  <div className="absolute inset-4 rounded-full bg-surface-container-low flex flex-col items-center justify-center text-center">
                    <span className="material-symbols text-4xl text-primary">spa</span>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Avg. harvest age</p>
                    <p className="font-data-metric text-data-metric text-on-surface">5.2 hrs</p>
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
                  className={`shrink-0 rounded-full px-4 py-2 font-label-md text-label-md transition-colors ${
                    activeCategory === c
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

      {/* DISPATCH & ESCROW TRACKER */}
      <section className="max-w-[1440px] mx-auto px-space-lg lg:px-space-2xl py-space-lg">
        <div className="rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Order card */}
            <div className="lg:col-span-4 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-outline-variant">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-2.5 py-1 font-label-sm text-label-sm text-secondary">
                <span className="material-symbols text-sm">integration_instructions</span>
                Smart Contract Active
              </span>
              <div className="mt-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols text-2xl">local_shipping</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">ORDER #AGX-220114-029</p>
                  <p className="font-headline-md text-headline-md text-on-surface">₹2,845.00 · Escrow</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-body-md text-body-md text-on-surface-variant">ETA</p>
                <p className="font-label-md text-label-md text-on-surface">6:14 PM · NH-12-AX-4402</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-body-md text-body-md text-on-surface-variant">Payload 840 lbs · 18 crates · Maple Basin</p>
                <button className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:underline">
                  Track on Map
                  <span className="material-symbols text-sm">map</span>
                </button>
              </div>
            </div>
            {/* Timeline stepper */}
            <div className="lg:col-span-8 p-6 lg:p-8">
              <p className="font-label-sm text-label-sm text-on-surface-variant">LIVE PROGRESS</p>
              <div className="mt-6 flex items-center">
                {NODES.map((n, i) => {
                  const done = i < 2;
                  const active = i === 2;
                  return (
                    <div key={n} className="flex-1 flex flex-col items-center">
                      <div className="h-8 w-full relative">
                        {i < NODES.length - 1 && (
                          <div className={`absolute top-1/2 -translate-y-1/2 left-2 right-2 h-px bg-outline-variant`} />
                        )}
                        <div
                          className={`relative z-10 mx-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            done
                              ? 'bg-primary border-primary'
                              : active
                              ? 'bg-primary-fixed border-primary'
                              : 'bg-surface-container-lowest border-outline-variant'
                          }`}
                        >
                          {done && <span className="material-symbols text-[11px] text-on-primary">check</span>}
                          {active && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        </div>
                      </div>
                      <p className={`mt-1.5 font-label-sm text-label-sm text-center ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {n.toUpperCase()}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 rounded-lg bg-surface-container-low px-4 py-2.5 flex items-center gap-2">
                <span className="material-symbols text-base text-primary animate-pulse">radar</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Automated hand-off complete ·<span className="text-primary"> Escrow released</span> at checkpoint 2 / 5
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE FIELD HARVESTS GRID */}
      <section className="max-w-[1440px] mx-auto px-space-lg lg:px-space-2xl py-space-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Live Field Harvests</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Quality-graded lots streamed from origin telemetry</p>
          </div>
          <span className="rounded-full bg-surface-container-highest px-3 py-1.5 font-label-md text-label-md text-on-surface-variant">
            Federal Grade Scorecard: {loading ? '—' : '8.96/10'}
          </span>
        </div>

        {/* Filters row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest shadow-xs border border-outline-variant px-3.5 py-2">
            <span className="material-symbols text-base text-primary">radar</span>
            <input
              type="range"
              min="10"
              max="250"
              step="10"
              value={radius}
              onChange={(e) => setRadius(+e.target.value)}
              className="w-28 accent-primary"
            />
            <span className="font-label-sm text-label-sm text-on-surface-variant">{radius} km</span>
          </label>
          <button
            onClick={() => setOrganicOnly((o) => !o)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-label-md text-label-md transition-colors border ${
              organicOnly
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant'
            }`}
          >
            <span className="material-symbols text-base">{organicOnly ? 'check_circle' : 'eco'}</span>
            Organic Certified
          </button>
          <button
            onClick={() => setOrganicOnly(false)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 font-label-sm text-label-sm text-primary bg-primary/10"
          >
            <span className="material-symbols text-sm">schedule</span>
            Harvested &lt; 24h
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ml-auto h-10 rounded-lg bg-surface-container-lowest border border-outline-variant px-3 font-label-md text-label-md text-on-surface outline-none"
          >
            <option value="">Sort: Freshness</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="freshness">Harvest: Newest</option>
          </select>
        </div>

        {/* Product grid incl. bundle highlight box */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-lg">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-surface-container-low animate-pulse h-72" />
            ))}

          {!loading &&
            visible.map((l, i) => (
              <ProductCard key={l.id} listing={l} />
            ))}

          {/* Produce Bundle Highlight Box (design's adjacent slot) */}
          <div className="lg:col-span-2 sm:col-span-2 rounded-2xl bg-surface-container-low p-6 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-32 h-32 shrink-0 rounded-xl bg-surface-container-lowest flex items-center justify-center">
              <span className="material-symbols text-5xl text-primary">eco</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-headline-sm text-headline-sm text-on-surface">Rotation Essentials Crate</h4>
              <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                +10 varieties · 40 lbs total · Budget-friendly (save 34%)
              </p>
              <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary text-on-primary h-10 px-4 font-label-md text-label-md shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors">
                Get This Basket
              </button>
            </div>
          </div>
        </div>

        {!loading && visible.length === 0 && (
          <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
            No lots match your filters right now.
          </p>
        )}

        {/* Pagination */}
        {!loading && listings.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-10 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant font-label-md text-label-md text-on-surface disabled:opacity-40 hover:bg-surface-container-low transition-colors"
            >
              Previous
            </button>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-40 hover:bg-primary-container hover:text-on-primary-container transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* NUTRITIONAL TELEMETRY */}
      <section className="max-w-[1440px] mx-auto px-space-lg lg:px-space-2xl py-space-lg">
        <div className="rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Nutritional Telemetry</h2>
            <span className="rounded-full bg-primary-container text-on-primary-container px-3 py-1.5 font-label-md text-label-md">AI Health Panel</span>
          </div>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Rings */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-4">
              {[
                { label: 'Vitamin C', val: 92, cls: 'text-primary', track: 'stroke-primary/20', stroke: 'stroke-primary', pct: '92%' },
                { label: 'Dietary Fiber', val: 78, cls: 'text-tertiary', track: 'stroke-tertiary/20', stroke: 'stroke-tertiary', pct: '78%' },
                { label: 'Antioxidants', val: 88, cls: 'text-secondary', track: 'stroke-secondary/20', stroke: 'stroke-secondary', pct: '88%' },
              ].map((r) => (
                <div key={r.label} className="flex flex-col items-center">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" className={`w-full h-full -rotate-90`}>
                      <circle cx="18" cy="18" r="15.9" fill="none" className={`stroke-current ${r.track}`} strokeWidth="3.5" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${r.val} ${100 - r.val}`}
                        className={`stroke-current ${r.stroke}`}
                        strokeWidth="3.5"
                      />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center font-data-metric text-data-metric ${r.cls}`}>{r.pct}</span>
                  </div>
                  <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">{r.label}</p>
                </div>
              ))}
            </div>
            {/* Weekly intake bars */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between">
                <p className="font-label-sm text-label-sm text-on-surface-variant">WEEKLY INTAKE vs TARGET</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed text-on-primary-fixed px-2.5 py-1 font-label-sm text-label-sm">
                  <span className="material-symbols text-sm">neurology</span>Scioinformatic Score 8.4
                </span>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-2 h-40 items-end">
                {(['M', 'T', 'W', 'T', 'F', 'S', 'S']).map((d, i) => {
                  const h = [78, 64, 90, 70, 84, 58, 72][i];
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className="w-full flex flex-col-reverse items-center" style={{ height: '100%' }}>
                        <div className="w-full rounded-t bg-primary-container" style={{ height: `${h * 0.45}%` }} />
                        <div className="w-full bg-primary" style={{ height: `${h * 0.55}%` }} />
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{d}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ASSURANCE BANNER */}
      <section className="max-w-[1440px] mx-auto px-space-lg lg:px-space-2xl py-space-lg pb-space-2xl">
        <div className="rounded-2xl bg-surface-container-highest p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 shrink-0 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center">
            <span className="material-symbols text-3xl">verified_user</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-headline-md text-headline-md text-on-surface">Regulated &amp; Audited by CGIA</h3>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Every transaction maintains full chain-of-custody — from seeding to settlement — through CGIA-grade escrow &amp; arbitration.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-11 px-5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors">
              Audit Protocols
            </button>
            <button className="h-11 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors">
              Buyer Guarantee Terms
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}