import { Component, Input, inject, output, input, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../../models/product.model';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);

  product = input<Product | null>(null);

  readonly isSubmitting = input(false);

  readonly save = output<Partial<Product>>();
  readonly cancel = output<void>();

  productForm: FormGroup;
  isEditing = computed(() => !!this.product());

  constructor() {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      image: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });

    effect(() => {
      const value = this.product();
      if (value) {
        this.productForm.patchValue({
          title: value.title,
          price: value.price,
          description: value.description,
          category: value.category,
          image: value.image
        });
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.save.emit(this.productForm.value);
    }
  }

  onCancel(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.cancel.emit();
  }
}