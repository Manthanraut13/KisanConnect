import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { driverService } from '../../services/driver.service';

const mockAssignments = [
  {
    id: 'assign-1',
    order: {
      id: 'ORDER-A1',
      items: [{ crop_name: 'Tomato', quantity_kg: 5 }, { crop_name: 'Onion', quantity_kg: 3 }],
    },
    delivery_location: {
      full_name: 'Priya Sharma',
      mobile: '9765432109',
      full_address: '12 MG Road, Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      pin_code: '422001',
      latitude: 20.01,
      longitude: 73.79,
    },
    status: 'in_transit',
  },
];

const ActiveDelivery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    try {
      const res = await driverService.getAssignments();
      const data = res?.data?.data || res?.data;
      const list = Array.isArray(data) ? data : [];
      setAssignment(list.find((a) => a.id === id) || null);
    } catch (err) {
      setAssignment(mockAssignments.find((a) => a.id === id) || null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!proofFile) {
      toast.error('Please take a proof photo');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('proof_image', proofFile);
      await driverService.confirmDelivery(id, formData);
      toast.success('Delivery confirmed!');
      navigate('/driver');
    } catch (err) {
      toast.error('Could not confirm delivery. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-kisan-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-lg mx-auto p-4">
        <p className="text-gray-600">Assignment not found.</p>
        <button onClick={() => navigate('/driver')} className="mt-4 text-kisan-700">
          ← Back
        </button>
      </div>
    );
  }

  const dl = assignment.delivery_location || {};
  const hasCoords = Number.isFinite(Number(dl.latitude)) && Number.isFinite(Number(dl.longitude));
  const items = assignment.order?.items || [];

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto p-4 pb-8">
      <button
        onClick={() => navigate('/driver')}
        className="flex items-center gap-1 text-kisan-700 text-base mb-4"
      >
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      <section className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <h2 className="text-xl font-bold mb-3">{dl.full_name}</h2>
        <a
          href={`tel:${dl.mobile}`}
          className="block w-full min-h-12 bg-kisan-700 text-white text-base rounded-lg flex items-center justify-center gap-2 mb-3 hover:bg-kisan-800"
        >
          <Phone className="h-5 w-5" /> Call Customer
        </a>
        <p className="flex items-start gap-2 text-gray-700 text-base mb-3">
          <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-1" />
          {dl.full_address}, {dl.district}, {dl.state} - {dl.pin_code}
        </p>
        <div className="border-t border-gray-100 pt-3">
          <p className="font-semibold mb-2">Items</p>
          <ul className="space-y-1 text-gray-700">
            {items.map((it, i) => (
              <li key={i} className="flex justify-between">
                <span>{it.crop_name}</span>
                <span>{it.quantity_kg} kg</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <h3 className="text-lg font-semibold p-4 pb-2">Map</h3>
        {hasCoords ? (
          <MapContainer
            center={[dl.latitude, dl.longitude]}
            zoom={14}
            className="h-48 w-full"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[dl.latitude, dl.longitude]}>
              <Popup>Deliver Here</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
            Map not available
          </div>
        )}
      </section>

      {assignment.status === 'in_transit' && (
        <section className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-1">Confirm Delivery</h3>
          <p className="text-gray-600 text-base mb-4">
            Take a photo of the delivered package as proof.
          </p>

          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-6 cursor-pointer mb-4">
            {proofFile ? (
              <img
                src={URL.createObjectURL(proofFile)}
                alt="Proof preview"
                className="h-40 w-full object-cover rounded-lg"
              />
            ) : (
              <>
                <Camera className="h-8 w-8 text-gray-400" />
                <span className="text-gray-500 text-base">{`Take / choose photo`}</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="camera"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          <button
            onClick={handleConfirm}
            disabled={uploading}
            className="w-full min-h-14 bg-kisan-700 text-white text-lg rounded-lg hover:bg-kisan-800 disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Confirm Delivery'}
          </button>
        </section>
      )}
    </div>
  );
};

export default ActiveDelivery;
