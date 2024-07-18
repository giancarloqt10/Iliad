import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from './product';

describe('ProductService', () => {
  let service: ProductService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all products', () => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Product A', price: 10.99, description: 'Description A' },
      { id: 2, name: 'Product B', price: 19.99, description: 'Description B' }
    ];

    service.getProducts().subscribe(products => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/api/products');
    expect(req.request.method).toEqual('GET');
    req.flush(mockProducts);
  });

  it('should get a product by id', () => {
    const mockProduct: Product = { id: 1, name: 'Product A', price: 10.99, description: 'Description A' };

    service.getProduct(1).subscribe(product => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/api/products/1');
    expect(req.request.method).toEqual('GET');
    req.flush(mockProduct);
  });

  it('should create a new product', () => {
    const newProduct: Product = { id: 0, name: 'Product C', price: 24.99, description: 'Description C' };
    const mockProduct: Product = { id: 3, name: newProduct.name, price: newProduct.price, description: newProduct.description };
    service.createProduct(newProduct).subscribe(product => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/api/products/new');
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(newProduct);
    req.flush(mockProduct);
  });

  it('should update a product', () => {
    const updatedProduct: Product = { id: 1, name: 'Updated Product A', price: 12.99, description: 'Updated Description A' };

    service.updateProduct(updatedProduct).subscribe(product => {
      expect(product).toEqual(updatedProduct);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/api/products/1/edit');
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(updatedProduct);
    req.flush(updatedProduct);
  });

  it('should delete a product', () => {
    service.deleteProduct(1).subscribe(() => {
      // Verifica che il prodotto sia stato eliminato (puoi aggiungere ulteriori controlli se necessario)
    });

    const req = httpTestingController.expectOne('http://localhost:8000/api/products/1');
    expect(req.request.method).toEqual('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
