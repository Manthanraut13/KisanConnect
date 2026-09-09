import ProductCard from './ProductCard';

function SkeletonCard() {
  return (
    <div className="bg-surface-lowest rounded-2xl ring-1 ring-outline-variant/60 p-4 animate-pulse">
      <div className="aspect-square bg-surface-container rounded-xl" />
      <div className="space-y-2 mt-4">
        <div className="h-4 bg-surface-container rounded w-3/4" />
        <div className="h-6 bg-surface-container rounded w-1/2" />
        <div className="h-10 bg-surface-container rounded-lg mt-3" />
      </div>
    </div>
  );
}

export default function ProductGrid({ listings, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols text-6xl text-outline mb-4">grass</span>
        <p className="text-on-surface-variant">No listings found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {listings.map((listing) => (
        <ProductCard key={listing.id} {...listing} />
      ))}
    </div>
  );
}