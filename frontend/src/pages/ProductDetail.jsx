import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Info, Star, ShoppingCart, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { listingService } from '../services/listing.service';
import api from '../services/api';

function RatingStars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.round(rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="h-12 w-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState({
  id: "1",
  crop_name: "Tomato",
  crop_category: "Vegetable",
  images: [],
  price_per_kg: 22,
  ai_suggested_price: 20.5,
  available_kg: 350,
  quantity_kg: 500,
  min_order_kg: 5,
  quality_grade: "A",
  is_organic: true,
  harvest_date: "2026-08-20",
  expiry_date: "2026-09-05",
  lot_number: "KC-2026-MH-NAS-00012",
  qr_code_url: "",
  district: "Nashik",
  latitude: 20.0059,
  longitude: 73.7797,
  farmerProfile: { village: "Pimpalgaon", rating: 4.5, user: { full_name: "Ramesh Patil" } }
});
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedQty, setSelectedQty] = useState(0);
  const [adding, setAdding] = useState(false);

  /*useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listingService
      .getById(id)
      .then((res) => {
        if (cancelled) return;
        const data = res.data ?? res;
        setListing(data);
        const minQty = data.min_order_kg ?? 0;
        setSelectedQty(minQty);
        setSelectedImage(0);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load listing details');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);*/

  const handleAddToCart = async () => {
    if (!selectedQty || selectedQty < (listing.min_order_kg ?? 0)) return;
    setAdding(true);
    try {
      await api.post('/api/cart/add', {
        listingId: listing.id ?? id,
        quantityKg: Number(selectedQty),
      });
      toast.success('Added to cart');
    } catch {
      toast.error('Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Spinner />;

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Listing not found</p>
      </div>
    );
  }

  const images = Array.isArray(listing.images) ? listing.images : [];
  const displayImages = images.length > 0 ? images : ['/placeholder-crop.jpg'];
  const farmer = listing.farmer || {};
  const latitude = listing.latitude ?? farmer.latitude;
  const longitude = listing.longitude ?? farmer.longitude;
  const hasCoords = latitude != null && longitude != null;
  const minQty = listing.min_order_kg ?? 0;
  const maxQty = listing.available_kg ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <img
                src={displayImages[selectedImage]}
                alt={listing.crop_name}
                className="w-full aspect-square object-cover"
              />
              {displayImages.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {displayImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      className={`shrink-0 rounded-lg overflow-hidden border-2 ${
                        i === selectedImage ? 'border-green-600' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="h-20 w-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold mr-2">{listing.crop_name}</h1>
              {listing.quality_grade && (
                <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                  Quality {listing.quality_grade}
                </span>
              )}
              {listing.is_organic && (
                <span className="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded-full">
                  Organic
                </span>
              )}
            </div>

            <p className="text-4xl font-bold text-green-700 mt-3">
              ₹{listing.price_per_kg}/kg
            </p>
            <p className="text-gray-600 mt-1">{Math.max(0, maxQty)}kg available</p>

            {listing.ai_suggested_price != null && (
              <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-3">
                <Info className="h-5 w-5 shrink-0" />
                <p className="text-sm">
                  AI Suggests: ₹{listing.ai_suggested_price}/kg
                </p>
              </div>
            )}

            <div className="mt-4 space-y-1 text-sm text-gray-600">
              {listing.harvest_date && (
                <p>
                  Harvest date: <span className="font-medium">{listing.harvest_date}</span>
                </p>
              )}
              {listing.expiry_date && (
                <p>
                  Expiry date: <span className="font-medium">{listing.expiry_date}</span>
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <label className="text-sm text-gray-600">
                Quantity (kg) — min {minQty}
              </label>
              <input
                type="number"
                min={minQty}
                max={Math.max(minQty, maxQty)}
                value={selectedQty}
                onChange={(e) => setSelectedQty(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || !selectedQty || Number(selectedQty) < minQty}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-700 hover:bg-green-800 text-white text-lg font-medium rounded-lg disabled:opacity-50"
              >
                <ShoppingCart className="h-5 w-5" />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-3">Farmer</h2>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
                {(farmer.full_name || farmer.name || 'F').charAt(0)}
              </div>
              <div>
                <p className="font-medium">{farmer.full_name || farmer.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">
                  {farmer.village && `${farmer.village}, `}
                  {farmer.district}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <RatingStars rating={farmer.rating} />
              {farmer.rating != null && (
                <span className="text-sm text-gray-500">{farmer.rating}/5</span>
              )}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-700" /> Origin
            </h2>
            {hasCoords ? (
              <MapContainer
                center={[latitude, longitude]}
                zoom={13}
                className="h-48 w-full rounded-lg"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[latitude, longitude]}>
                  <Popup>{farmer.village || farmer.district || 'Farm'}</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                Map not available
              </div>
            )}
          </section>
        </div>

        <section className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <h2 className="text-lg font-semibold mb-3">Traceability</h2>
          {listing.lot_number && (
            <p className="text-sm text-gray-600 mb-3">
              Lot number: <span className="font-mono font-medium">{listing.lot_number}</span>
            </p>
          )}
          {listing.qr_code_url ? (
            <img
              src={listing.qr_code_url}
              alt="Traceability QR code"
              className="h-40 w-40 object-contain border border-gray-200 rounded-lg"
            />
          ) : (
            <p className="text-sm text-gray-400">No QR code available</p>
          )}
        </section>
      </div>
    </div>
  );
}