import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../product.service';
import { of, throwError } from 'rxjs';
import { Product } from '../product';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productService: ProductService;
  let router: Router;
  let route: ActivatedRoute;
  let location: Location;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const routeStub = { 
      snapshot: { 
        paramMap: { 
          get: (param: string) => param === 'id' ? '1' : null 
        } 
      } 
    };
    const locationStub = jasmine.createSpyObj('Location', ['back']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatSnackBarModule
      ],
      declarations: [ProductFormComponent],
      providers: [
        { provide: ProductService, useValue: {
          createProduct: (product: Product) => of({product}),
          updateProduct: () => of({ id: 1, name: 'Updated Product', price: 12.99, description: 'Updated Description' }),
          getProduct: () => of({ id: 1, name: 'Product A', price: 10.99, description: 'Description A' })
        } },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: Location, useValue: locationStub },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
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

  it('should initialize form for new product', () => {
    expect(component.isEditing).toBeFalse();
    expect(component.productForm.value).toEqual({
      name: '',
      price: '',
      description: ''
    });
  });

  it('should initialize form for editing existing product', () => {
    component.ngOnInit(); // Simula l'inizializzazione con un ID

    expect(component.isEditing).toBeTrue();
    expect(component.productForm.value).toEqual({
      name: 'Product A',
      price: 10.99,
      description: 'Description A'
    });
  });

  it('should create a new product', () => {
    component.productForm.setValue({
      name: 'New Product',
      price: 10.99,
      description: 'New Description'
    });

    component.onSubmit();

    expect(productService.createProduct).toHaveBeenCalledWith({
      name: 'New Product',
      price: 10.99,
      description: 'New Description'
    });
    expect(snackBar.open).toHaveBeenCalledWith('Prodotto creato con successo', 'Chiudi', { duration: 3000 });
    expect(location.back).toHaveBeenCalled();
  });

  it('should update an existing product', () => {
    component.ngOnInit(); // Simula l'inizializzazione con un ID

    component.productForm.setValue({
      name: 'Updated Product',
      price: 12.99,
      description: 'Updated Description'
    });

    component.onSubmit();

    expect(productService.updateProduct).toHaveBeenCalledWith({
      id: 1,
      name: 'Updated Product',
      price: 12.99,
      description: 'Updated Description'
    });
    expect(snackBar.open).toHaveBeenCalledWith('Prodotto aggiornato con successo', 'Chiudi', { duration: 3000 });
    expect(location.back).toHaveBeenCalled();
  });

  it('should show error message if product creation fails', () => {
    spyOn(productService, 'createProduct').and.returnValue(throwError({ error: 'Error creating product' }));

    component.productForm.setValue({
      name: 'New Product',
      price: 10.99,
      description: 'New Description'
    });

    component.onSubmit();

    expect(snackBar.open).toHaveBeenCalledWith('Errore durante la creazione del prodotto', 'Chiudi', { duration: 3000 });
  });

  it('should show error message if product update fails', () => {
    spyOn(productService, 'updateProduct').and.returnValue(throwError({ error: 'Error updating product' }));

    component.ngOnInit(); // Simula l'inizializzazione con un ID

    component.productForm.setValue({
      name: 'Updated Product',
      price: 12.99,
      description: 'Updated Description'
    });

    component.onSubmit();

    expect(snackBar.open).toHaveBeenCalledWith('Errore durante l\'aggiornamento del prodotto', 'Chiudi', { duration: 3000 });
  });

  it('should go back when goBack is called', () => {
    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });
});
