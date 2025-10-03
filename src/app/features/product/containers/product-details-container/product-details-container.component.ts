import { Component, Input, numberAttribute, inject, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductDetailsComponent } from '../../components/product-details/product-details.component';
import { CartService } from '../../../../services/cart.service';
import { AuthService } from '../../../../services/auth.service';
import { Product } from '../../../../models/product.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductStore } from '../../../../stores/product.store';

@Component({
  selector: 'app-product-details-container',
  imports: [CommonModule, ProductDetailsComponent],
  template: `
    <app-product-details
      [product]="product()"
      [error]="error()"
      [loading]="loading()"
      [isAuthenticated]="isAuthenticated()"
      (addToCart)="onAddToCart($event)"
      (delete)="onDelete($event)">
    </app-product-details>
  `
})
export class ProductDetailsContainerComponent {
  private router = inject(Router);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  private store = inject(ProductStore)

  product = this.store.selectedProduct
  error = this.store.error;
  loading = this.store.loading;

  private authState = toSignal(this.authService.getAuthState());
  isAuthenticated = computed(() => this.authState()?.isAuthenticated ?? false);

  id = input.required<number>();

  ngOnInit(): void {
    this.store.clearSelectedProduct()
    this.store.loadProduct(this.id())
  }

  onAddToCart(productId: number): void {
    this.cartService.addToCart(productId);
  }

  onDelete(productId: number): void {
      this.store.deleteProduct(productId)
  }
}