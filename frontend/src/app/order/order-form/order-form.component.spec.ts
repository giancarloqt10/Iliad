import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OrderFormComponent } from './order-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../order.service';
import { ProductService } from '../../product/product.service';
import { of } from 'rxjs';
import { Order } from '../order';
import { Product } from '../../product/product';
import { throwError } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { OrderProduct } from '../order-product'; // Importa l'interfaccia OrderProduct

describe('OrderFormComponent', () => {
  let component: OrderFormComponent;
  let fixture: ComponentFixture<OrderFormComponent>;
  let orderService: OrderService;
  let productService: ProductService;
  let router: Router;
  let route: ActivatedRoute;
  let location: Location;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const routeStub = { 
      snapshot: { 
        paramMap: { get: (param: string) => param === 'id' ? '123' : null } 
      } 
    };
    const locationStub = jasmine.createSpyObj('Location', ['back']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        BrowserAnimationsModule,
        MatSnackBarModule
      ],
      declarations: [OrderFormComponent],
      providers: [
        { provide: OrderService, useValue: { createOrder: () => of({}), updateOrder: () => of({}), getOrder: () => of({}) } },
        { provide: ProductService, useValue: { getProducts: () => of([]) } },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: Location, useValue: locationStub },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderFormComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService);
    productService = TestBed.inject(ProductService);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    location = TestBed.inject(Location);
    snackBar = TestBed.inject(MatSnackBar);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a new order', () => {
    const newOrder: Order = {
      id: 0,
      customerName: 'Alice Johnson',
      orderDate: '17-07-2024 09:00:00',
      description: 'New Order',
      orderProducts: [
        { product: { id: 1, name: 'Product A', price: 10.99, description: 'Description A' }, quantity: 2 }
      ]
    };
    const mockOrder: Order = { ...newOrder };
    spyOn(orderService, 'createOrder').and.returnValue(of(mockOrder));
    component.orderForm.setValue({
      customerName: newOrder.customerName,
      orderDate: newOrder.orderDate,
      description: newOrder.description,
      products: newOrder.orderProducts
    });

    component.onSubmit();

    expect(orderService.createOrder).toHaveBeenCalledWith(newOrder);
    expect(snackBar.open).toHaveBeenCalledWith('Ordine creato con successo', 'Chiudi', { duration: 3000 });
    expect(location.back).toHaveBeenCalled();
  });

  it('should update an existing order', () => {
    const orderId = 123;
    const updatedOrder: Order = {
      id: orderId,
      customerName: 'John Doe Updated',
      orderDate: '18-07-2024 15:30:00',
      description: 'Updated Order',
      orderProducts: [
        { product: { id: 2, name: 'Product B', price: 19.99, description: 'Description B' }, quantity: 3 }
      ]
    };
    spyOn(orderService, 'getOrder').and.returnValue(of(updatedOrder));
    spyOn(orderService, 'updateOrder').and.returnValue(of(updatedOrder));

    component.ngOnInit(); // Simula l'inizializzazione per la modifica
    
    component.onSubmit();

    expect(orderService.updateOrder).toHaveBeenCalledWith(updatedOrder);
    expect(snackBar.open).toHaveBeenCalledWith('Ordine aggiornato con successo', 'Chiudi', { duration: 3000 });
    expect(location.back).toHaveBeenCalled();
  });

  it('should show error message if order creation fails', () => {
    spyOn(orderService, 'createOrder').and.returnValue(throwError(() => {
      throw new Error('Error creating order'); // Simula un errore durante la creazione dell'ordine
    }));

    component.orderForm.setValue({
      customerName: 'Alice Johnson',
      orderDate: '17-07-2024 09:00:00',
      description: 'New Order',
      products: [
        { product: { id: 1, name: 'Product A', price: 10.99, description: 'Description A' }, quantity: 2 }
      ]
    });

    component.onSubmit();

    expect(snackBar.open).toHaveBeenCalledWith('Errore durante la creazione dell\'ordine', 'Chiudi', { duration: 3000 });
  });

  it('should show error message if order update fails', () => {
    spyOn(orderService, 'updateOrder').and.returnValue(throwError(() => {
      throw new Error('Error updating order'); // Simula un errore durante l'aggiornamento dell'ordine
    }));

    const orderId = 123;
    const updatedOrder: Order = {
      id: orderId,
      customerName: 'John Doe Updated',
      orderDate: '18-07-2024 15:30:00',
      description: 'Updated Order',
      orderProducts: [
        { product: { id: 2, name: 'Product B', price: 19.99, description: 'Description B' }, quantity: 3 }
      ]
    };
    spyOn(orderService, 'getOrder').and.returnValue(of(updatedOrder));

    component.ngOnInit(); // Simula l'inizializzazione per la modifica
    component.onSubmit();

    expect(snackBar.open).toHaveBeenCalledWith('Errore durante l\'aggiornamento dell\'ordine', 'Chiudi', { duration: 3000 });
  });

  it('should go back when goBack is called', () => {
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });
});
