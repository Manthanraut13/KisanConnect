import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProductCard({
  id,
  crop_name,
  images,
  price_per_kg,
  available_kg,
  farmer_name,
  district,
  is_organic,
  quality_grade,
}) {
  const navigate = useNavigate();

  const image =
    Array.isArray(images) && images.length > 0 ? images[0] : '/placeholder-crop.jpg';

  return (
    <div className="group bg-white rounded-2xl ring-1 ring-linen shadow-card hover:shadow-card-hover hover:-translate-y-[3px] transition-all duration-200">
      <div className="aspect-square overflow-hidden rounded-t-2xl">
        <img
          src={image}
          alt={crop_name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            {is_organic && <Badge className="bg-forest">Organic</Badge>}
            {quality_grade && <Badge variant="outline">{quality_grade}</Badge>}
          </div>
        </div>
        <h3 className="font-serif text-lg font-semibold text-evergreen">{crop_name}</h3>
        <p className="font-mono text-2xl font-medium text-evergreen">₹{price_per_kg}/kg</p>
        <p className="font-mono text-sm text-mutedtext">
          {available_kg}kg available • {district}
        </p>
        <p className="font-mono text-xs text-mutedtext/70">by {farmer_name}</p>
        <Button
          className="w-full mt-3"
          onClick={() => navigate(`/marketplace/${id}`)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}