import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([
  {
    id: "1",
    crop_name: "Tomato",
    images: [],
    available_kg: 350,
    quantity_kg: 500,
    price_per_kg: 22,
    quality_grade: "A",
    status: "active",
  },
  {
    id: "2",
    crop_name: "Onion",
    images: [],
    available_kg: 0,
    quantity_kg: 200,
    price_per_kg: 18,
    quality_grade: "B",
    status: "inactive",
  },
]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  /*useEffect(() => {
    let cancelled = false;
    api
      .get('/api/listings/farmer/mine')
      .then((res) => {
        if (cancelled) return;
        const data = res.data ?? res;
        setListings(data.listings ?? data.items ?? data.results ?? data.data ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load your listings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);*/

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingInProgress(true);
    try {
      //await api.delete(`/api/listings/${deleting.id}`);
      setListings((prev) => prev.filter((l) => l.id !== deleting.id));
      toast.success('Listing deleted');
      setDeleting(null);
    } catch {
      toast.error('Could not delete listing');
    } finally {
      setDeletingInProgress(false);
    }
  };

  const thumbnail = (listing) =>
    Array.isArray(listing.images) && listing.images.length > 0
      ? listing.images[0]
      : '/placeholder-crop.jpg';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Button onClick={() => navigate('/farmer/listings/new')}>
          <Plus /> Add New Listing
        </Button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-100">
          <Sprout className="h-16 w-16 text-green-600 mb-4" />
          <p className="text-gray-600 mb-6">You have no listings yet</p>
          <Button onClick={() => navigate('/farmer/listings/new')}>
            <Plus /> Add New Listing
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Crop Name</TableHead>
                <TableHead>Available / Total</TableHead>
                <TableHead>Price/kg</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <img
                      src={thumbnail(listing)}
                      alt={listing.crop_name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{listing.crop_name}</TableCell>
                  <TableCell>
                    {listing.available_kg} / {listing.total_kg ?? listing.available_kg} kg
                  </TableCell>
                  <TableCell>₹{listing.price_per_kg}/kg</TableCell>
                  <TableCell>
                    {listing.quality_grade ? (
                      <Badge variant="outline">{listing.quality_grade}</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        listing.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }
                    >
                      {listing.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/farmer/listings/${listing.id}/edit`)}
                      >
                        <Pencil /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleting(listing)}
                      >
                        <Trash2 /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete listing?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleting?.crop_name || 'this listing'}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingInProgress}
            >
              {deletingInProgress ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}