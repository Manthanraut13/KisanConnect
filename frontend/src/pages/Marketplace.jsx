import { useEffect, useRef, useState } from 'react';
import { listingService } from '../services/listing.service';
import FilterSidebar from '../components/marketplace/FilterSidebar';
import ProductGrid from '../components/marketplace/ProductGrid';

const DEFAULT_FILTERS = {
  crop_category: '',
  quality_grade: '',
  is_organic: false,
  min_price: '',
  max_price: '',
};

export default function Marketplace() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [listings, setListings] = useState([ { id: "1", crop_name: "Tomato", images: [], price_per_kg: 22, available_kg: 350, farmer_name: "Ramesh Patil", district: "Nashik", is_organic: true, quality_grade: "A" },
  { id: "2", crop_name: "Onion", images: [], price_per_kg: 18, available_kg: 200, farmer_name: "Suresh Sharma", district: "Pune", is_organic: false, quality_grade: "B" },
  { id: "3", crop_name: "Potato", images: [], price_per_kg: 15, available_kg: 500, farmer_name: "Vijay Kumar", district: "Nashik", is_organic: true, quality_grade: "A" },
  { id: "4", crop_name: "Wheat", images: [], price_per_kg: 28, available_kg: 800, farmer_name: "Anil Deshmukh", district: "Pune", is_organic: false, quality_grade: "A" },]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const debounceTimer = useRef(null);

  /*useEffect(() => {
    let cancelled = false;

    setLoading(true);
    listingService
      .getAll({ ...filters, page, limit: 12, search: searchQuery })
      .then((res) => {
        if (cancelled) return;
        const data = res.data ?? res;
        setListings(data.listings ?? data.items ?? data.results ?? data.data ?? []);
        setTotalPages(data.totalPages ?? data.total_pages ?? 1);
      })
      .catch(() => {
        if (cancelled) return;
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
  }, []);*/

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search crops or farmers..."
            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className="md:hidden px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg"
            >
              {showFilters ? 'Hide' : 'Filter'}
            </button>
            <span className="text-sm text-gray-500 whitespace-nowrap">
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
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}