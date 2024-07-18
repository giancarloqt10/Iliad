import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderDetailComponent } from './order-detail.component';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { of } from 'rxjs';
import { Order } from '../order';
import { Location } from '@angular/common';
import { OrderProduct } from '../order-product';
import { Product } from '../../product/product';

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let orderService: OrderService;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } } // Simula l'ID dell'ordine passato come parametro
          }
        },
        {
          provide: OrderService,
          useValue: {
            getOrder: () => of({
              id: 1,
              customerName: 'John Doe',
              orderDate: '15-07-2024 10:30:00',
              description: 'Order 1',
              orderProducts: [
                { product: { id: 1, name: 'Product A', price: 10.99, description: 'Description A' }, quantity: 2 } as OrderProduct
              ]
            })
          }
        },
        { provide: Location, useValue: { back: () => { } } } // Mock del servizio Location
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService);
    location = TestBed.inject(Location);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch order details on init', () => {
    const mockOrder: Order = {
      id: 1,
      customerName: 'John Doe',
      orderDate: '15-07-2024 10:30:00',
      description: 'Order 1',
      orderProducts: [
        { product: { id: 1, name: 'Product A', price: 10.99, description: 'Description A' }, quantity: 2 }
      ]
    };
    spyOn(orderService, 'getOrder').and.returnValue(of(mockOrder));

    component.ngOnInit();

    expect(orderService.getOrder).toHaveBeenCalledWith(1);
    expect(component.order).toEqual(mockOrder);
  });

  it('should go back when goBack is called', () => {
    spyOn(location, 'back');

    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });
});
