import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cartService from '../../services/cart.service';
import { useCartStore } from '../../stores/cartStore';
import { logger } from '../../lib/logger';

export default function ProductCard({ listing }) {
  const navigate = useNavigate();
  const setCart = useCartStore((s) => s.setCart);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);

  const {
    id,
    crop_name,
    images,
    price_per_kg,
    available_kg,
    farmer_name,
    district,
    is_organic,
    quality_grade,
    created_at,
  } = listing;

  const image = Array.isArray(images) && images.length > 0 ? images[0] : '/placeholder-crop.jpg';

  const farmLabel = (farmer_name || 'Local Farm').toUpperCase();
  const daysFresh = created_at
    ? Math.max(1, Math.floor((Date.now() - new Date(created_at).getTime()) / 86400000))
    : 1;

  const handleAdd = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await cartService.addItem(id, 1);
      const data = res.data?.data ?? res.data;
      const items = Array.isArray(data) ? data : data?.items ?? [];
      setCart(items);
      logger.info('CART', 'Item added', { id });
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    } catch (err) {
      logger.error('CART', 'Add to basket failed', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-1.5 shadow-xs transition-all hover:shadow-md">
      <div className="relative">
        <div className="w-full h-44 overflow-hidden rounded-md bg-surface-container">
          <img
            src={image}
            alt={crop_name}
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="px-1.5 py-0.5 bg-surface-container-lowest/90 rounded-sm font-label-sm text-label-sm text-on-surface">n={available_kg}</span>
          {quality_grade && (
            <span className="px-1.5 py-0.5 bg-surface-container-lowest/90 rounded-sm font-label-sm text-label-sm text-on-surface">
              Grade {quality_grade}
            </span>
          )}
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <span className="px-1.5 py-0.5 rounded-sm bg-surface-container-highest/90 font-label-sm text-label-sm text-on-surface-variant">LOTT #{String(id).slice(-3)}</span>
          <span className="px-1.5 py-0.5 rounded-sm bg-primary-fixed font-label-sm text-label-sm text-on-primary-fixed">{daysFresh}d FRESH</span>
        </div>
      </div>
      <p className="mt-2 px-1 font-label-sm text-label-sm text-primary">{farmLabel}</p>
      <div className="mt-0.5 px-1 flex items-center justify-between gap-2">
        <button onClick={() => navigate(`/marketplace/${id}`)} className="text-left">
          <h5 className="font-headline-sm text-headline-sm tracking-tight text-on-surface hover:underline">{crop_name}</h5>
        </button>
        {is_organic && (
          <span className="inline-flex items-center gap-0.5 shrink-0 rounded-sm bg-surface-container-low px-1 py-0.5 font-label-sm text-label-sm text-secondary">
            <span className="material-symbols text-xs">eco</span>Organic
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span>
          <p className="font-data-metric text-data-metric leading-none tracking-tight text-on-surface">
            ₹{price_per_kg}
            <span className="font-body-md text-body-md text-on-surface-variant">/kg</span>
          </p>
          <p className="mt-0.5 font-caption-light text-caption-light text-outline">{district}</p>
        </span>
        <button
          onClick={handleAdd}
          disabled={busy}
          className="inline-flex items-center gap-1.5 bg-primary text-on-primary h-9 px-4 rounded-md font-label-md text-label-md shadow-sm transition-all hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] disabled:opacity-60"
        >
          <span className="material-symbols text-sm">{added ? 'check' : 'add_shopping_cart'}</span>
          {added ? 'Added' : 'Add to Basket'}
        </button>
      </div>
    </div>
  );
}