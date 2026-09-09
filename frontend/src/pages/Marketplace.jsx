import { useEffect, useRef, useState } from 'react';
import { listingService } from '../services/listing.service';
import FilterSidebar from '../components/marketplace/FilterSidebar';
import ProductGrid from '../components/marketplace/ProductGrid';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { logger } from '../lib/logger';

const DEFAULT_FILTERS = {
  crop_category: '',
  quality_grade: '',
  is_organic: false,
  min_price: '',
  max_price: '',
};

export default function Marketplace() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const debounceTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    listingService
      .getAll({ ...filters, page, limit: 12, search: searchQuery })
      .then((res) => {
        if (cancelled) return;
        const data = res.data ?? res;
        const listingsData = data.listings ?? data.items ?? data.results ?? data.data ?? [];
        logger.info('MARKETPLACE', 'Listings loaded', { count: listingsData.length, page, filters });
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
  }, [filters, page, searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(e.target.value.trim());
      setPage(1);
    }, 500);
  };

  const handleFilterChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-canvas border-b border-linen sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search crops or farmers..."
            className="flex-1"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className="md:hidden px-4 py-2.5 text-sm font-medium text-evergreen bg-white border border-linen rounded-xl hover:bg-wash-muted"
            >
              {showFilters ? 'Hide' : 'Filter'}
            </button>
            <span className="text-sm text-mutedtext whitespace-nowrap">
              {loading ? 'Loading...' : `${listings.length} result(s)`}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside
            className={`w-full md:w-1/4 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}
          >
            <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
          </aside>

          <div className="w-full md:w-3/4">
            <ProductGrid listings={listings} loading={loading} />

            {!loading && listings.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-mutedtext">
                  Page {page} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}