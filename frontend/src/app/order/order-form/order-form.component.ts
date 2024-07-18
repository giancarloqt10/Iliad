import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order.service';
import { ProductService } from '../../product/product.service';
import { Order } from '../order';
import { Product } from '../../product/product';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    MatAutocompleteModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatDatepickerModule, 
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    NgIf
  ],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.scss' 
})
export class OrderFormComponent implements OnInit {
  orderForm!: FormGroup;
  isEditing = false;
  orderId!: number;
  allProducts: Product[] = [];
  filteredProducts!: Observable<Product[]>;

  constructor(
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Carica tutti i prodotti
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.filteredProducts = of(this.allProducts);
      },
      error: (error) => {
        console.error('Errore nel recupero dei prodotti:', error);
        this.showError('Errore nel recupero dei prodotti.');
      }
    });

    // Controlla se stiamo modificando un ordine esistente
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditing = !!this.orderId;

    // Inizializza il form
    this.orderForm = this.formBuilder.group({
      customerName: ['', Validators.required],
      orderDate: [new Date(), Validators.required],
      description: [''],
      products: this.formBuilder.array([this.newProduct()]) 
    });

    // Se stiamo modificando, carica i dati dell'ordine
    if (this.isEditing) {
      this.orderService.getOrder(this.orderId).subscribe({
        next: (order) => {
          this.orderForm.patchValue({
            customerName: order.customerName,
            orderDate: new Date(order.orderDate),
            description: order.description
          });

          // Popola il FormArray dei prodotti
          const productFormGroups = order.orderProducts.map(op => this.formBuilder.group({
            id: op.product.id,
            name: new FormControl(op.product), // Usa FormControl per l'autocomplete
            quantity: op.quantity
          }));
          this.orderForm.setControl('products', this.formBuilder.array(productFormGroups));
        },
        error: (error) => {
          console.error('Errore nel recupero dell\'ordine:', error);
          this.showError('Errore nel recupero dei dettagli dell\'ordine.');
        }
      });
    }
  }

  get products(): FormArray {
    return this.orderForm.get('products') as FormArray;
  }

  newProduct(): FormGroup {
    return this.formBuilder.group({
      id: [''],
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addProduct() {
    this.products.push(this.newProduct());
  }

  removeProduct(index: number) {
    this.products.removeAt(index);
  }

  filterProducts(event: any): void {
    if (event.target instanceof HTMLInputElement) {
      const filterValue = event.target.value.toLowerCase();
      this.filteredProducts = this.productService.getProducts(filterValue).pipe(
        startWith(this.allProducts.filter(product => product.name.toLowerCase().includes(filterValue)))
      );
    }
  }

  displayProduct(product: Product): string {
    return product && product.name ? product.name : '';
  }

  onProductSelected(event: MatAutocompleteSelectedEvent, index: number) {
    const product = event.option.value as Product;
    this.products.at(index).patchValue({ id: product.id });
  }

  onSubmit() {
    if (this.orderForm.valid) {
      const orderData = this.orderForm.value;
      orderData.orderProducts = orderData.products.map((p: any) => ({ id: p.id, quantity: p.quantity }));

      if (this.isEditing) {
        this.orderService.updateOrder({ id: this.orderId, ...orderData }).subscribe({
          next: () => {
            this._snackBar.open('Ordine aggiornato con successo', 'Chiudi', { duration: 3000 });
            this.goBack();
          },
          error: (error) => {
            this._snackBar.open('Errore durante l\'aggiornamento dell\'ordine', 'Chiudi', { duration: 3000 });
            console.error('Errore durante l\'aggiornamento dell\'ordine:', error);
          }
        });
      } else {
        this.orderService.createOrder(orderData).subscribe({
          next: () => {
            this._snackBar.open('Ordine creato con successo', 'Chiudi', { duration: 3000 });
            this.goBack();
          },
          error: (error) => {
            this._snackBar.open('Errore durante la creazione dell\'ordine', 'Chiudi', { duration: 3000 });
            console.error('Errore durante la creazione dell\'ordine:', error);
          }
        });
      }
    }
  }

  goBack(): void {
    this.location.back();
  }

  showError(message: string) {
    this._snackBar.open(message, 'Chiudi', {
      duration: 5000,
    });
  }
}
