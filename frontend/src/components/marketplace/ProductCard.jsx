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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden rounded-t-xl">
        <img
          src={image}
          alt={crop_name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            {is_organic && <Badge className="bg-green-600">Organic</Badge>}
            {quality_grade && <Badge variant="outline">{quality_grade}</Badge>}
          </div>
        </div>
        <h3 className="font-semibold text-lg">{crop_name}</h3>
        <p className="text-2xl font-bold text-green-700">₹{price_per_kg}/kg</p>
        <p className="text-sm text-gray-500">
          {available_kg}kg available • {district}
        </p>
        <p className="text-xs text-gray-400">by {farmer_name}</p>
        <Button
          className="w-full mt-3 bg-green-700 hover:bg-green-800"
          onClick={() => navigate(`/marketplace/${id}`)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
