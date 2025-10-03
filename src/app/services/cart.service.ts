import { Injectable, Signal, signal } from '@angular/core';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);

  getCartItems(): Signal<CartItem[]> {
    return this.cartItems.asReadonly();
  }

  addToCart(productId: number): void {
    this.cartItems.update(items => {
      const existingItem = items.find(item => item.product === productId);
      if (existingItem) {
        return items.map(item =>
          item.product === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...items, { product: productId, quantity: 1 }];
    });
  }

  removeFromCart(productId: number): void {
    this.cartItems.update(items =>
      items.filter(item => item.product !== productId)
    );
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartItems.update(items =>
      items.map(item =>
        item.product === productId ? { ...item, quantity } : item
      )
    );
  }

  clearCart(): void {
    this.cartItems.set([]);
  }
}