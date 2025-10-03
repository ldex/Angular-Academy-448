import { Component, Input, numberAttribute, inject, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize, Observable } from 'rxjs';
import { ProductDetailsComponent } from '../../components/product-details/product-details.component';
import { ProductService } from '../../../../services/product.service';
import { CartService } from '../../../../services/cart.service';
import { AuthService } from '../../../../services/auth.service';
import { Product } from '../../../../models/product.model';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  // product$!: Observable<Product>;
  // error: string | null = null;
  // loading: boolean = false;

  product = this.productService.selectedProduct
  error = this.productService.error;
  loading = this.productService.loading;

  //authState$ = this.authService.getAuthState();
  private authState = toSignal(this.authService.getAuthState());
  isAuthenticated = computed(() => this.authState()?.isAuthenticated ?? false);

  id = input.required<number>();

  ngOnInit(): void {
    this.productService.getProduct(this.id())
  }

  // @Input({ transform: numberAttribute })
  // set id(productId: number)
  // {
  //   this.productService.getProduct(productId)
  // }

  onAddToCart(productId: number): void {
    this.cartService.addToCart(productId);
  }

  onDelete(productId: number): void {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
  }
}