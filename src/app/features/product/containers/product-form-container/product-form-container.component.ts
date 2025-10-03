import {
  Component,
  Input,
  inject,
  input,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { ProductFormComponent } from "../../components/product-form/product-form.component";
import { Product } from "../../../../models/product.model";
import { ProductStore } from "../../../../stores/product.store";

@Component({
  selector: "app-product-form-container",
  imports: [CommonModule, ProductFormComponent],
  template: `
    @if(loading()) {
      <div class="loading"></div>
    } @else {
      <app-product-form
        [product]="product()"
        [isSubmitting]="isSubmitting()"
        (save)="onSave($event)"
        (cancel)="onCancel()"
      >
      </app-product-form>
    }
  `,
})
export class ProductFormContainerComponent {
  private router = inject(Router);

 private store = inject(ProductStore)

  product = this.store.selectedProduct
  loading = this.store.loading;

  isSubmitting = this.store.loading;
  private productId: number | null = null;

  id = input<number>();

  ngOnInit(): void {
    this.productId = this.id() ?? null;

    this.store.clearSelectedProduct();

    if (this.productId) {
      this.store.loadProduct(this.productId);
    }
  }

  onSave(formData: Partial<Product>): void {
    if (!this.validateFormData(formData)) {
      return;
    }

    if (this.productId) {
      this.store.updateProduct({ id: this.productId, product: formData})
    } else {
      const newProduct = {
        title: formData.title!,
        price: formData.price!,
        description: formData.description!,
        category: formData.category!,
        image: formData.image!,
        rating: { rate: 0, count: 0 },
      };

      this.store.createProduct(newProduct);
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
