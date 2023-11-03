import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService, QueryParam } from '../product.service';
import { Subject, debounceTime, distinctUntilChanged, exhaustMap, startWith, switchMap, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>()
  products: any[] = [];
  isLoading: boolean = true;
  isLoaded: boolean = false;
  isLastPage: boolean = false;

  queryParams: Partial<QueryParam> = {
    page: 1,
    limit: 9
  }

  searchControl = new FormControl<string>('');
  private searchTerm$ = this.searchControl.valueChanges.pipe(
    takeUntil(this._destroy$),
    debounceTime(500),
    distinctUntilChanged(),
    startWith('')
  )

  private paginationEvent$ = new Subject<void>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Subscription to products
    this.searchTerm$
      .pipe(
        switchMap((searchTerm: string | null) => {
          console.log('term', searchTerm)
          this.queryParams = {
            page: 1,
            limit: 9
          }
          if (searchTerm !== null && searchTerm !== '') {
            this.queryParams['q'] = searchTerm
          }
          return this.paginationEvent$.pipe(
            startWith(undefined),
            exhaustMap(() => {
              this.isLoading = true;
              return this.productService.getProducts(this.queryParams)
            })
          )
        })
      )
      .subscribe({
        next: (res: Record<string, any>) => {
          this.products = res['data'];
          this.queryParams['page'] = res['metadata']?.currentPage;
          this.isLoading = false
          if (!this.isLoaded) {
            this.isLoaded = true;
          }
          this.isLastPage = res['metadata']?.currentPage === res['metadata']?.totalPages
        },
        error: (err: any) => {
          console.log(err)
          this.isLoading = false
        }
      })
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.subscribe();
  }

  setPage(pageNumber: number): void {
    this.queryParams.page = pageNumber;
    this.paginationEvent$.next();
  }
}
