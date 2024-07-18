import { Component, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { MatTableModule } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [MatTableModule, MatFormFieldModule, MatInputModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['id', 'name', 'price', 'description', 'actions'];

  // Filtri
  nameFilter = new FormControl('');
  descriptionFilter = new FormControl('');

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.getProducts();

    // Applica i filtri
    this.nameFilter.valueChanges
      .pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(value => this.productService.getProducts(value || undefined, this.descriptionFilter.value || undefined))
      )
      .subscribe(products => this.products = products);

    this.descriptionFilter.valueChanges
      .pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(value => this.productService.getProducts(this.nameFilter.value || undefined, value || undefined))
      )
      .subscribe(products => this.products = products);
  }

  getProducts(): void {
    this.productService.getProducts()
      .subscribe(products => this.products = products);
  }
}
