import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OrderListComponent } from './order-list.component';
import { OrderService } from '../order.service';
import { of } from 'rxjs';
import { Order } from '../order';
import { OrderProduct } from '../order-product';
import { Product } from '../../product/product';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let orderService: OrderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      declarations: [OrderListComponent],
      providers: [
        {
          provide: OrderService,
          useValue: {
            getOrders: (customerName?: string, description?: string, startDate?: string, endDate?: string) => of([])
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get orders on init', () => {
    const mockOrders: Order[] = [
      { id: 1, customerName: 'John Doe', orderDate: '15-07-2024 10:30:00', description: 'Order 1', orderProducts: [] },
      { id: 2, customerName: 'Jane Smith', orderDate: '16-07-2024 14:15:00', description: 'Order 2', orderProducts: [] }
    ];
    spyOn(orderService, 'getOrders').and.returnValue(of(mockOrders));

    fixture.detectChanges(); // Inizializza il componente e chiama ngOnInit

    expect(orderService.getOrders).toHaveBeenCalled();
    expect(component.orders).toEqual(mockOrders);
  });

  it('should filter by customer name', fakeAsync(() => {
    const mockOrders: Order[] = [
      { id: 1, customerName: 'John Doe', orderDate: '15-07-2024 10:30:00', description: 'Order 1', orderProducts: [] },
      { id: 2, customerName: 'Jane Smith', orderDate: '16-07-2024 14:15:00', description: 'Order 2', orderProducts: [] }
    ];
    spyOn(orderService, 'getOrders').and.returnValue(of(mockOrders));

    fixture.detectChanges();

    const customerNameInput: HTMLInputElement = fixture.debugElement.query(By.css('[formControlName="customerNameFilter"]')).nativeElement;
    customerNameInput.value = 'John';
    customerNameInput.dispatchEvent(new Event('input'));
    tick(400); // Attendi il debounceTime
    fixture.detectChanges();

    expect(orderService.getOrders).toHaveBeenCalledWith('John', undefined, undefined, undefined);
    expect(component.orders).toEqual([mockOrders[0]]); // Solo l'ordine di John Doe
  }));

  it('should filter by description', fakeAsync(() => {
    const mockOrders: Order[] = [
      { id: 1, customerName: 'John Doe', orderDate: '15-07-2024 10:30:00', description: 'Order 1', orderProducts: [] },
      { id: 2, customerName: 'Jane Smith', orderDate: '16-07-2024 14:15:00', description: 'Order 2', orderProducts: [] }
    ];
    spyOn(orderService, 'getOrders').and.returnValue(of(mockOrders));

    fixture.detectChanges();

    const descriptionInput: HTMLInputElement = fixture.debugElement.query(By.css('[formControlName="descriptionFilter"]')).nativeElement;
    descriptionInput.value = '2';
    descriptionInput.dispatchEvent(new Event('input'));
    tick(400); 
    fixture.detectChanges();

    expect(orderService.getOrders).toHaveBeenCalledWith(undefined, '2', undefined, undefined);
    expect(component.orders).toEqual([mockOrders[1]]); 
  }));

  it('should filter by start and end date', fakeAsync(() => {
    const mockOrders: Order[] = [
      { id: 1, customerName: 'John Doe', orderDate: '15-07-2024 10:30:00', description: 'Order 1', orderProducts: [] },
      { id: 2, customerName: 'Jane Smith', orderDate: '16-07-2024 14:15:00', description: 'Order 2', orderProducts: [] }
    ];
    spyOn(orderService, 'getOrders').and.returnValue(of(mockOrders));

    fixture.detectChanges();

    component.startDateFilter.setValue('15-07-2024');
    component.endDateFilter.setValue('15-07-2024');
    tick(400);
    fixture.detectChanges();

    expect(orderService.getOrders).toHaveBeenCalledWith(undefined, undefined, '15-07-2024', '15-07-2024');
    expect(component.orders).toEqual([mockOrders[0]]);
  }));

  it('should filter by all criteria', fakeAsync(() => {
    const mockOrders: Order[] = [
      { id: 1, customerName: 'John Doe', orderDate: '15-07-2024 10:30:00', description: 'Order 1', orderProducts: [] },
      { id: 2, customerName: 'Jane Smith', orderDate: '16-07-2024 14:15:00', description: 'Order 2', orderProducts: [] },
      { id: 3, customerName: 'Alice Johnson', orderDate: '15-07-2024 18:45:00', description: 'Order 3', orderProducts: [] }
    ];
    spyOn(orderService, 'getOrders').and.returnValue(of(mockOrders));

    fixture.detectChanges();

    component.customerNameFilter.setValue('Alice');
    component.descriptionFilter.setValue('3');
    component.startDateFilter.setValue('15-07-2024');
    component.endDateFilter.setValue('15-07-2024');
    tick(400); 
    fixture.detectChanges();

    expect(orderService.getOrders).toHaveBeenCalledWith('Alice', '3', '15-07-2024', '15-07-2024');
    expect(component.orders).toEqual([mockOrders[2]]); 
  }));
});
