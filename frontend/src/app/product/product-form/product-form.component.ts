import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { Location } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
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
      this.productService.getProduct(this.productId).subscribe({
        next: (product) => this.productForm.patchValue(product),
        error: (error) => console.error('Errore nel recupero del prodotto:', error)
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
}
