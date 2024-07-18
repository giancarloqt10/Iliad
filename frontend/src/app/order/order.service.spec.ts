import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { Order } from './order';
import { OrderProduct } from './order-product';
import { Product } from '../product/product';

describe('OrderService', () => {
  let service: OrderService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService]
    });
    service = TestBed.inject(OrderService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Verifica che non ci siano richieste in sospeso
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all orders', () => {
    const mockOrders: Order[] = [
      { id: 1, customerName: 'John Doe', orderDate: '15-07-2024 10:30:00', description: 'Order 1', orderProducts: [] },
      { id: 2, customerName: 'Jane Smith', orderDate: '16-07-2024 14:15:00', description: 'Order 2', orderProducts: [] }
    ];

    service.getOrders().subscribe(orders => {
      expect(orders).toEqual(mockOrders);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/api/orders');
    expect(req.request.method).toEqual('GET');
    req.flush(mockOrders);
  });

  it('should get an order by id', () => {
    const mockOrder: Order = { id: 1, customerName: 'John Doe', orderDate: '15-07-2024 10:30:00', description: 'Order 1', orderProducts: [] };

    service.getOrder(1).subscribe(order => {
      expect(order).toEqual(mockOrder);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/api/orders/1');
    expect(req.request.method).toEqual('GET');
    req.flush(mockOrder);
  });

  it('should create a new order', () => {
    const newOrder: Order = {id: 0, customerName: 'Giancarlo Quin', orderDate: '17-07-2024 09:00:00', description: 'Nuovo ordine', orderProducts: [] };
    const mockOrder: Order = {
      id: 3,
      customerName: newOrder.customerName,
      orderDate: newOrder.orderDate,
      description: newOrder.description,
      orderProducts: newOrder.orderProducts
  };

    service.createOrder(newOrder).subscribe(order => {
      expect(order).toEqual(mockOrder);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/api/orders/new');
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(newOrder); 
    req.flush(mockOrder);
  });

  it('should update an order', () => {
    const updatedOrder: Order = { id: 1, customerName: 'John Doe', orderDate: '15-07-2024 12:00:00', description: 'Updated Order 1', orderProducts: [] };

    service.updateOrder(updatedOrder).subscribe(order => {
      expect(order).toEqual(updatedOrder);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/api/orders/1/edit');
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(updatedOrder);
    req.flush(updatedOrder);
  });

  it('should delete an order', () => {
    service.deleteOrder(1).subscribe(() => {
      // Verifica che l'ordine sia stato eliminato (puoi aggiungere ulteriori controlli se necessario)
    });

    const req = httpTestingController.expectOne('http://localhost:8000/api/orders/1');
    expect(req.request.method).toEqual('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
