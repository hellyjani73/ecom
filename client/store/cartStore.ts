import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem } from '@/types/cart.types';

interface CartState {
  cart: Cart;
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

const calculateCartTotals = (items: CartItem[]): Omit<Cart, 'items'> => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  return { subtotal, tax, shipping, total };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      },
      addItem: (item) => {
        const { cart } = get();
        const existingItemIndex = cart.items.findIndex(
          (i) => i.product._id === item.product._id
        );

        let newItems: CartItem[];
        if (existingItemIndex >= 0) {
          newItems = [...cart.items];
          newItems[existingItemIndex].quantity += item.quantity;
          newItems[existingItemIndex].subtotal =
            newItems[existingItemIndex].price * newItems[existingItemIndex].quantity;
        } else {
          newItems = [...cart.items, item];
        }

        const totals = calculateCartTotals(newItems);
        set({
          cart: {
            items: newItems,
            ...totals,
          },
        });
      },
      updateItem: (productId, quantity) => {
        const { cart } = get();
        const newItems = cart.items.map((item) => {
          if (item.product._id === productId) {
            return {
              ...item,
              quantity,
              subtotal: item.price * quantity,
            };
          }
          return item;
        });

        const totals = calculateCartTotals(newItems);
        set({
          cart: {
            items: newItems,
            ...totals,
          },
        });
      },
      removeItem: (productId) => {
        const { cart } = get();
        const newItems = cart.items.filter((item) => item.product._id !== productId);
        const totals = calculateCartTotals(newItems);
        set({
          cart: {
            items: newItems,
            ...totals,
          },
        });
      },
      clearCart: () => {
        set({
          cart: {
            items: [],
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0,
          },
        });
      },
      calculateTotals: () => {
        const { cart } = get();
        const totals = calculateCartTotals(cart.items);
        set({
          cart: {
            ...cart,
            ...totals,
          },
        });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

