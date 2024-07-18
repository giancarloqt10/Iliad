import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order.service';
import { Order } from '../order';
import { Location } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [MatListModule, MatButtonModule, MatIconModule, NgIf, NgFor],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
  order: Order | undefined;
  loading = true; // Flag per indicare se i dati sono in fase di caricamento
  error: string | undefined; // Messaggio di errore

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private location: Location,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getOrder();
  }

  getOrder(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrder(id)
      .subscribe({
        next: (order) => {
          this.order = order;
          this.loading = false; // I dati sono stati caricati
        },
        error: (error) => {
          console.error('Errore nel recupero dell\'ordine:', error);
          this.error = 'Errore nel recupero dei dettagli dell\'ordine.'; // Imposta il messaggio di errore
          this.loading = false; // I dati non sono stati caricati a causa di un errore
        }
      });
  }

  goBack(): void {
    this.location.back();
  }

  editOrder(orderId: number): void {
    this.router.navigate(['/orders', orderId, 'edit']);
  }

  deleteOrder(order: Order): void {
    if (confirm('Sei sicuro di voler eliminare questo ordine?')) {
      this.orderService.deleteOrder(order.id).subscribe({
        next: () => {
          this._snackBar.open('Ordine eliminato con successo', 'Chiudi', { duration: 3000 });
          this.goBack(); 
        },
        error: (error) => {
          console.error('Errore durante l\'eliminazione dell\'ordine:', error);
          this.showError('Errore durante l\'eliminazione dell\'ordine');
        }
      });
    }
  }

  showError(message: string) {
    this._snackBar.open(message, 'Chiudi', { duration: 5000 }); 
  }
}
