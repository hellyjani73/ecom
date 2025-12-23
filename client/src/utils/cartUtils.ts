import { CartItem } from '../contexts/CartContext';

export const generateCartItemId = (item: CartItem): string => {
  if (item.variant) {
    return `${item.productId}-${item.variant.variantName}`;
  }
  return item.productId;
};

