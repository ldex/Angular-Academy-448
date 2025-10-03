import {
  Component,
  Input,
  inject,
  input,
  numberAttribute,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { ProductFormComponent } from "../../components/product-form/product-form.component";
import { ProductService } from "../../../../services/product.service";
import { Product } from "../../../../models/product.model";

@Component({
  selector: "app-product-form-container",
  imports: [CommonModule, ProductFormComponent],
  template: `
    @if(loading()) {
      <div class="loading"></div>
    } @else {
      <app-product-form
        [product]="product()"
        [isSubmitting]="isSubmitting"
        (save)="onSave($event)"
        (cancel)="onCancel()"
      >
      </app-product-form>
    }
  `,
})
export class ProductFormContainerComponent {
  private router = inject(Router);
  private productService = inject(ProductService);

  //product$!: Observable<Product | null>;
  product = this.productService.selectedProduct
  loading = this.productService.loading;

  isSubmitting = false;
  private productId: number | null = null;

  id = input<number>();

  ngOnInit(): void {
    this.productId = this.id() ?? null;

    this.productService.clearSelectedProduct();

    if (this.productId) {
      this.productService.getProduct(this.productId);
    }
  }

  // @Input({ transform: numberAttribute })
  // set id(productId: number) {
  //   this.productId = productId ? Number(productId) : null;

  //   this.productService.clearSelectedProduct();

  //   if (this.productId) {
  //     this.productService.getProduct(this.productId)
  //   }
  // }

  onSave(formData: Partial<Product>): void {
    if (!this.validateFormData(formData)) {
      return;
    }

    this.isSubmitting = true;

    if (this.productId) {
      this.productService.updateProduct(this.productId, formData).subscribe({
        next: () => {
          this.router.navigate(["/products"]);
        },
        error: (error) => {
          console.error("Error updating product:", error);
          this.isSubmitting = false;
        },
      });
    } else {
      const newProduct = {
        title: formData.title!,
        price: formData.price!,
        description: formData.description!,
        category: formData.category!,
        image: formData.image!,
        rating: { rate: 0, count: 0 },
      };

      this.productService.createProduct(newProduct).subscribe({
        next: () => {
          this.router.navigate(["/products"]);
        },
        error: (error) => {
          console.error("Error creating product:", error);
          this.isSubmitting = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(["/products"]);
  }

  private validateFormData(formData: Partial<Product>): boolean {
    const requiredFields = [
      "title",
      "price",
      "description",
      "category",
      "image",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return false;
    }

    return true;
  }
}
