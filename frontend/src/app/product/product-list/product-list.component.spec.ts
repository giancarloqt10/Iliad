import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../product.service';
import { of } from 'rxjs';
import { Product } from '../product';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: ProductService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      declarations: [ProductListComponent],
      providers: [
        {
          provide: ProductService,
          useValue: {
            getProducts: (name?: string, description?: string) => of([])
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
    fixture.detectChanges(); // Trigger ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get products on init', () => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Product A', price: 10.99, description: 'Description A' },
      { id: 2, name: 'Product B', price: 19.99, description: 'Description B' }
    ];
    spyOn(productService, 'getProducts').and.returnValue(of(mockProducts));

    component.ngOnInit();

    expect(productService.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
  });

  it('should filter by name', fakeAsync(() => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Product A', price: 10.99, description: 'Description A' },
      { id: 2, name: 'Product B', price: 19.99, description: 'Description B' }
    ];
    spyOn(productService, 'getProducts').and.returnValue(of(mockProducts));

    fixture.detectChanges();

    component.nameFilter.setValue('A');
    tick(400); // Attendi il debounceTime
    fixture.detectChanges();

    expect(productService.getProducts).toHaveBeenCalledWith('A', undefined);
    expect(component.products).toEqual([mockProducts[0]]);
  }));

  it('should filter by description', fakeAsync(() => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Product A', price: 10.99, description: 'Description A' },
      { id: 2, name: 'Product B', price: 19.99, description: 'Description B' }
    ];
    spyOn(productService, 'getProducts').and.returnValue(of(mockProducts));

    fixture.detectChanges();

    component.descriptionFilter.setValue('B');
    tick(400); // Attendi il debounceTime
    fixture.detectChanges();

    expect(productService.getProducts).toHaveBeenCalledWith(undefined, 'B');
    expect(component.products).toEqual([mockProducts[1]]);
  }));

  it('should filter by all criteria', fakeAsync(() => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Product A', price: 10.99, description: 'Description A' },
      { id: 2, name: 'Product B', price: 19.99, description: 'Description B' }
    ];
    spyOn(productService, 'getProducts').and.returnValue(of(mockProducts));

    fixture.detectChanges();

    component.nameFilter.setValue('A');
    component.descriptionFilter.setValue('A');
    tick(400); 
    fixture.detectChanges();

    expect(productService.getProducts).toHaveBeenCalledWith('A', 'A');
    expect(component.products).toEqual([mockProducts[0]]); 
  }));
});
