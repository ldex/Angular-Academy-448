import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);

  private readonly apiUrl = 'https://fakestoreapi.com/products';
  private readonly CACHE_KEY_ALL = 'all_products';
  private readonly CACHE_KEY_PREFIX = 'product_';

  getProducts(): Observable<Product[]> {
    const cachedData = this.cache.get(this.CACHE_KEY_ALL) as Product[] | null;
    if (cachedData) {
      return of(cachedData);
    }

    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(products => this.cache.set(this.CACHE_KEY_ALL, products))
    );
  }

  getProduct(id: number): Observable<Product> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
    const cachedProduct = this.cache.get(cacheKey) as Product | null;

    if (cachedProduct) {
      return of(cachedProduct);
    }

    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      tap(product => this.cache.set(cacheKey, product))
    );
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(() => this.invalidateCache())
    );
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
      tap(() => this.invalidateCache())
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  private invalidateCache(): void {
    this.cache.clear();
  }

  refreshCache(): void {
    this.invalidateCache();
  }
}