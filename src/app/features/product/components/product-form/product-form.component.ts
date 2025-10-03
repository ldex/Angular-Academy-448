import { Component, Input, inject, output, input } from '@angular/core';
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

  @Input() set product(value: Product | null) {
    if (value) {
      this.isEditing = true;
      this.productForm.patchValue({
        title: value.title,
        price: value.price,
        description: value.description,
        category: value.category,
        image: value.image
      });
    }
  }
  readonly isSubmitting = input(false);

  readonly save = output<Partial<Product>>();
  readonly cancel = output<void>();

  productForm: FormGroup;
  isEditing = false;

  constructor() {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      image: ['', [Validators.required, Validators.pattern('https?://.+')]]
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