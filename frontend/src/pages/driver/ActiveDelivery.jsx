import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { driverService } from '../../services/driver.service';
import { logger } from '../../lib/logger';

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
      const found = list.find((a) => a.id === id) || null;
      logger.info('DRIVER_DELIVERY', 'Delivery loaded', { id, found: !!found });
      setAssignment(found);
    } catch (err) {
      logger.error('DRIVER_DELIVERY', 'Failed to load delivery', err);
      setAssignment(null);
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
      formData.append('proof', proofFile);
      await driverService.confirmDelivery(id, formData);
      logger.info('DRIVER_DELIVERY', 'Delivery confirmed', { deliveryId: id });
      toast.success('Delivery confirmed!');
      navigate('/driver');
    } catch (err) {
      logger.error('DRIVER_DELIVERY', 'Failed to confirm delivery', err);
      toast.error('Could not confirm delivery. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-kisan-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-surface max-w-lg mx-auto p-4">
        <p className="text-on-surface-variant">Assignment not found.</p>
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
    <div className="min-h-screen bg-surface max-w-lg mx-auto p-4 pb-8">
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
          className="block w-full min-h-12 bg-kisan-700 text-white text-base rounded-xl flex items-center justify-center gap-2 mb-3 hover:bg-kisan-800"
        >
          <Phone className="h-5 w-5" /> Call Customer
        </a>
        <p className="flex items-start gap-2 text-on-surface text-base mb-3">
          <MapPin className="h-5 w-5 text-on-surface-variant/70 shrink-0 mt-1" />
          {dl.full_address}, {dl.district}, {dl.state} - {dl.pin_code}
        </p>
        <div className="border-t border-outline-variant/60 pt-3">
          <p className="font-semibold mb-2">Items</p>
          <ul className="space-y-1 text-on-surface">
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
          <div className="h-48 bg-surface-container flex items-center justify-center text-on-surface-variant/70">
            Map not available
          </div>
        )}
      </section>

      {assignment.status === 'in_transit' && (
        <section className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-1">Confirm Delivery</h3>
          <p className="text-on-surface-variant text-base mb-4">
            Take a photo of the delivered package as proof.
          </p>

          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-outline rounded-xl py-6 cursor-pointer mb-4">
            {proofFile ? (
              <img
                src={URL.createObjectURL(proofFile)}
                alt="Proof preview"
                className="h-40 w-full object-cover rounded-xl"
              />
            ) : (
              <>
                <Camera className="h-8 w-8 text-on-surface-variant/70" />
                <span className="text-on-surface-variant text-base">{`Take / choose photo`}</span>
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
            className="w-full min-h-14 bg-kisan-700 text-white text-lg rounded-xl hover:bg-kisan-800 disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Confirm Delivery'}
          </button>
        </section>
      )}
    </div>
  );
};

export default ActiveDelivery;
