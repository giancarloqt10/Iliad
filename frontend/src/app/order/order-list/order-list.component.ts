import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { Order } from '../order';
import { MatTableModule } from '@angular/material/table';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { startWith, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [MatTableModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  displayedColumns: string[] = ['id', 'customerName', 'orderDate', 'description', 'actions'];
  
  // Filtri
  customerNameFilter = new FormControl('');
  descriptionFilter = new FormControl('');
  startDateFilter = new FormControl('');
  endDateFilter = new FormControl('');

  constructor(
    private orderService: OrderService,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getOrders();

    // Applica i filtri
    this.customerNameFilter.valueChanges
      .pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(value => this.orderService.getOrders(value || undefined, this.descriptionFilter.value || undefined, this.startDateFilter.value || undefined, this.endDateFilter.value || undefined)),
        catchError(error => {
          console.error('Errore nel recupero degli ordini:', error);
          this.showError('Errore nel recupero degli ordini');
          return of([]);
        })
      )
      .subscribe(orders => this.orders = orders);

    this.descriptionFilter.valueChanges
      .pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(value => this.orderService.getOrders(this.customerNameFilter.value || undefined, value || undefined, this.startDateFilter.value || undefined, this.endDateFilter.value || undefined))
      )
      .subscribe(orders => this.orders = orders);

    this.startDateFilter.valueChanges
      .pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(value => this.orderService.getOrders(this.customerNameFilter.value || undefined, this.descriptionFilter.value || undefined, value || undefined, this.endDateFilter.value || undefined))
      )
      .subscribe(orders => this.orders = orders);

    this.endDateFilter.valueChanges
      .pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(value => this.orderService.getOrders(this.customerNameFilter.value || undefined, this.descriptionFilter.value || undefined, this.startDateFilter.value || undefined, value || undefined))
      )
      .subscribe(orders => this.orders = orders);
  }

  getOrders(): void {
    this.orderService.getOrders()
      .pipe(
        catchError(error => {
          console.error('Errore nel recupero degli ordini:', error);
          this.showError('Errore nel recupero degli ordini');
          return of([]);
        })
      )
      .subscribe(orders => this.orders = orders);
  }

  deleteOrder(order: Order): void {
    if (confirm('Sei sicuro di voler eliminare questo ordine?')) {
      this.orderService.deleteOrder(order.id).subscribe({
        next: () => {
          this._snackBar.open('Ordine eliminato con successo', 'Chiudi', { duration: 3000 });
          this.getOrders();
        },
        error: (error) => {
          console.error('Errore durante l\'eliminazione dell\'ordine:', error);
          this.showError('Errore durante l\'eliminazione dell\'ordine');
        }
      });
    }
  }

  showError(message: string) {
    this._snackBar.open(message, 'Chiudi', {
      duration: 5000, // Durata del messaggio di errore (5 secondi)
    });
  }

  addOrder() {
    this.router.navigate(['/orders/new']);
  }
}
