import { CartItem, Cart, AddToCartRequest, UpdateCartItemRequest } from '@/types/cart.types';

// Cart service using localStorage (can be replaced with API calls)
export const cartService = {
  getCart(): Cart {
    if (typeof window === 'undefined') {
      return { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 };
    }

    const cartJson = localStorage.getItem('cart');
    if (!cartJson) {
      return { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 };
    }

    const cart: Cart = JSON.parse(cartJson);
    return cart;
  },

  addToCart(item: AddToCartRequest & { product: any; price: number }): Cart {
    const cart = this.getCart();
    const existingItemIndex = cart.items.findIndex(
      (i) => i.product._id === item.productId
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += item.quantity;
      cart.items[existingItemIndex].subtotal =
        cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
    } else {
      cart.items.push({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      });
    }

    this.calculateTotals(cart);
    this.saveCart(cart);
    return cart;
  },

  updateCartItem(productId: string, data: UpdateCartItemRequest): Cart {
    const cart = this.getCart();
    const itemIndex = cart.items.findIndex((i) => i.product._id === productId);

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity = data.quantity;
      cart.items[itemIndex].subtotal = cart.items[itemIndex].price * data.quantity;
    }

    this.calculateTotals(cart);
    this.saveCart(cart);
    return cart;
  },

  removeFromCart(productId: string): Cart {
    const cart = this.getCart();
    cart.items = cart.items.filter((i) => i.product._id !== productId);
    this.calculateTotals(cart);
    this.saveCart(cart);
    return cart;
  },

  clearCart(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
  },

  calculateTotals(cart: Cart): void {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    cart.tax = cart.subtotal * 0.1; // 10% tax (adjust as needed)
    cart.shipping = cart.subtotal > 100 ? 0 : 10; // Free shipping over $100
    cart.total = cart.subtotal + cart.tax + cart.shipping;
  },

  saveCart(cart: Cart): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  },
};

