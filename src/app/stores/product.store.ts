import {
    patchState,
    signalStore,
    withComputed,
    withMethods,
    withState,
    withHooks,
    withProps,
  } from "@ngrx/signals";
import { computed } from "@angular/core";
import { Product } from "../models/product.model";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { of, pipe, switchMap, tap } from "rxjs";
import { ProductService } from "../services/product.service";
import { Router } from "@angular/router";
import { rxResource } from "@angular/core/rxjs-interop";

  export interface ProductsState {
    _id: number,
    _loading: boolean;
    _error: string | null;
  }

  const initialState: ProductsState = {
    _id: 0,
    _loading: false,
    _error: null,
  };

  export const ProductStore = signalStore(
    { providedIn: "root" },
    withState(initialState),
    withProps(() => ({
      _productService: inject(ProductService),
      _router: inject(Router),
    })),
    withProps((store) => ({
      _productsResource: rxResource({
        stream: () => {
          return store._productService.getProducts();
        },
        defaultValue: [] as Product[],
      }),
      _productResource: rxResource({
        params: store._id,
        stream: ({params:id}) => {
          if(id == 0) { return of(null); }
          return store._productService.getProduct(id);
        },
        defaultValue: { id: 0, title: '', price: 0, description: '', category: '', image: '', rating: { rate: 0, count: 0 } } as Product,
      }),
    })),
    withComputed((store) => ({
      products: computed(() => store._productsResource.value() ?? []),
      selectedProduct: computed(() => store._productResource.value() ?? null),
      error: computed(() =>
        store._productsResource.error()?.message as string ||
        store._productResource.error()?.message as string ||
        store._error() as string
      ),
      loading: computed(() =>
          store._productsResource.isLoading() ||
          store._productResource.isLoading() ||
          store._loading()
      )
    })),
    withMethods((store) => ({
      loadProducts: () => {
        store._productsResource.reload()
      },
      loadProduct: (id: number) => {
        patchState(store, { _id: id });
        store._productResource.reload()
      },
      createProduct: rxMethod<Omit<Product, "id">>(
        pipe(
          tap(() => patchState(store, { _loading: true })),
          switchMap((product) =>
            store._productService.createProduct(product).pipe(
              tap({
                next: (newProduct) => {
                  newProduct.rating = { rate: 0, count : 0};

                  store._productsResource.update((products) =>
                    products ? [...products, newProduct] : [newProduct]
                  );

                  patchState(store, {
                    _loading: false,
                    _error: null,
                  });

                  store._router.navigate(['/products']);
                },
                error: (error) => {
                  patchState(store, {
                    _loading: false,
                    _error: error.message || "Failed to create product",
                  });
                },
              })
            )
          )
        )
      ),

      updateProduct: rxMethod<{ id: number; product: Partial<Product> }>(
        pipe(
          tap(() => patchState(store, { _loading: true })),
          switchMap(({ id, product }) =>
            store._productService.updateProduct(id, product).pipe(
              tap({
                next: (updatedProduct) => {
                  updatedProduct.rating = { rate: 3.2, count : 120}; // Fake rating as PUT API doesn't return rating...

                  store._productsResource.update(products =>
                    products?.map(product => product.id == id ? updatedProduct : product)
                  );

                  patchState(store, {
                    _loading: false,
                    _error: null,
                  });

                  store._router.navigate(['/products']);
                },
                error: (error) => {
                  patchState(store, {
                    _loading: false,
                    _error: error.message || "Failed to update product",
                  });
                },
              })
            )
          )
        )
      ),

      deleteProduct: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { _loading: true })),
          switchMap((id) =>
            store._productService.deleteProduct(id).pipe(
              tap({
                next: () => {
                  store._productsResource.update(products =>
                    products?.filter(product =>
                      product.id !== id
                    )
                  );
                  patchState(store, {
                    _loading: false,
                    _error: null,
                  });
                  store._router.navigate(['/products']);
                },
                error: (error) => {
                  patchState(store, {
                    _loading: false,
                    _error: error.message || "Failed to delete product",
                  });
                },
              })
            )
          )
        )
      ),

      clearSelectedProduct() {
        patchState(store, { _id: 0 });
      },

      refreshCache() {
        store._productService.refreshCache();
        this.loadProducts();
      },
    })),
  );
