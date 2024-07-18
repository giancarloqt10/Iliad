import { Component, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { MatTableModule } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, startWith, switchMap } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [MatTableModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatSnackBarModule, MatIconModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['id', 'name', 'price', 'description', 'actions'];

  // Filtri
  nameFilter = new FormControl('');
  descriptionFilter = new FormControl('');

  constructor(
    private productService: ProductService,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getProducts();

    // Applica i filtri
    this.nameFilter.valueChanges
      .pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(value => this.productService.getProducts(value || undefined, this.descriptionFilter.value || undefined)),
        catchError(error => {
          console.error('Errore nel recupero dei prodotti:', error);
          this.showError('Errore nel recupero dei prodotti');
          return EMPTY; // Restituisce un Observable vuoto in caso di errore
        })
      )
      .subscribe(products => this.products = products);

    this.descriptionFilter.valueChanges
      .pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(value => this.productService.getProducts(this.nameFilter.value || undefined, value || undefined)),
        catchError(error => {
          console.error('Errore nel recupero dei prodotti:', error);
          this.showError('Errore nel recupero dei prodotti');
          return EMPTY; // Restituisce un Observable vuoto in caso di errore
        })
      )
      .subscribe(products => this.products = products);
  }

  getProducts(): void {
    this.productService.getProducts()
      .pipe(
        catchError(error => {
          console.error('Errore nel recupero dei prodotti:', error);
          this.showError('Errore nel recupero dei prodotti');
          return EMPTY;
        })
      )
      .subscribe(products => this.products = products);
  }

  deleteProduct(product: Product): void {
    if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      this.productService.deleteProduct(product.id!).subscribe({ // Usa ! per indicare che product.id non è null
        next: () => {
          this._snackBar.open('Prodotto eliminato con successo', 'Chiudi', { duration: 3000 });
          this.getProducts();
        },
        error: (error) => {
          console.error('Errore durante l\'eliminazione del prodotto:', error);
          this.showError('Errore durante l\'eliminazione del prodotto');
        }
      });
    }
  }

  showError(message: string) {
    this._snackBar.open(message, 'Chiudi', {
      duration: 5000, // Durata del messaggio di errore (5 secondi)
    });
  }

  addProduct() {
    this.router.navigate(['/products/new']);
  }
}
