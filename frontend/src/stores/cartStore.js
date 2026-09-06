import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      deliveryCharge: 0,
      gstAmount: 0,
      totalAmount: 0,

      addToCart: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.listing_id === item.listing_id);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.listing_id === item.listing_id
                ? { ...i, quantity_kg: i.quantity_kg + item.quantity_kg }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
        get().calculateTotals();
      },

      removeFromCart: (listingId) => {
        set({ items: get().items.filter((i) => i.listing_id !== listingId) });
        get().calculateTotals();
      },

      updateQuantity: (listingId, quantityKg) => {
        set({
          items: get().items.map((i) =>
            i.listing_id === listingId ? { ...i, quantity_kg: quantityKg } : i
          ),
        });
        get().calculateTotals();
      },

      clearCart: () => set({ items: [] }),

      calculateTotals: () => {
        const { items } = get();
        const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
        const deliveryCharge = subtotal > 500 ? 0 : 50;
        const gstAmount = subtotal * 0.05;
        const totalAmount = subtotal + deliveryCharge + gstAmount;

        set({
          subtotal,
          deliveryCharge,
          gstAmount,
          totalAmount,
          totalItems: items.reduce((sum, item) => sum + item.quantity_kg, 0),
        });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
