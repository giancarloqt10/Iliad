import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { Location } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, of } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, NgIf],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditing = false;
  productId!: number;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private _snackBar: MatSnackBar
  ) {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  ngOnInit() {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditing = !!this.productId;

    if (this.isEditing) {
      this.productService.getProduct(this.productId).pipe(
        catchError(error => {
          console.error('Errore nel recupero del prodotto:', error);
          this.showError('Errore nel recupero dei dettagli del prodotto.');
          return of(undefined); // Gestisci l'errore restituendo un observable vuoto
        })
      ).subscribe(product => {
        if (product) {
          this.productForm.patchValue(product);
        } else {
          this.goBack(); // Torna indietro se il prodotto non viene trovato
        }
      });
    }
  }

  onSubmit() {
    if (this.productForm.valid) {
      const productData = this.productForm.value;

      if (this.isEditing) {
        this.productService.updateProduct({ id: this.productId, ...productData }).subscribe({
          next: () => {
            this._snackBar.open('Prodotto aggiornato con successo', 'Chiudi', { duration: 3000 });
            this.goBack();
          },
          error: (error) => {
            this._snackBar.open('Errore durante l\'aggiornamento del prodotto', 'Chiudi', { duration: 3000 });
            console.error('Errore durante l\'aggiornamento del prodotto:', error);
          }
        });
      } else {
        this.productService.createProduct(productData).subscribe({
          next: () => {
            this._snackBar.open('Prodotto creato con successo', 'Chiudi', { duration: 3000 });
            this.goBack();
          },
          error: (error) => {
            this._snackBar.open('Errore durante la creazione del prodotto', 'Chiudi', { duration: 3000 });
            console.error('Errore durante la creazione del prodotto:', error);
          }
        });
      }
    }
  }

  goBack(): void {
    this.location.back();
  }

  showError(message: string) {
    this._snackBar.open(message, 'Chiudi', { duration: 5000 });
  }
}
