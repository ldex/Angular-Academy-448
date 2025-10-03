import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../../../models/cart-item.model';
import { Product } from '../../../../models/product.model';

interface CartItemWithProduct extends CartItem {
  productDetails: Product;
}

@Component({
  selector: 'app-shopping-cart',
  imports: [CommonModule],
  templateUrl: './shopping-cart.component.html'
})
export class ShoppingCartComponent {
  readonly items = input<CartItemWithProduct[]>([]);
  readonly updateQuantity = output<{
    productId: number;
    quantity: number;
}>();
  readonly removeItem = output<number>();
  readonly clearCart = output<void>();

  calculateTotal(items: CartItemWithProduct[]): number {
    return items.reduce((total, item) =>
      total + (item.productDetails.price * item.quantity), 0
    );
  }

  onUpdateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) return;
    this.updateQuantity.emit({ productId, quantity });
  }

  onRemoveItem(productId: number): void {
    this.removeItem.emit(productId);
  }

  onClearCart(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.clearCart.emit();
  }
}