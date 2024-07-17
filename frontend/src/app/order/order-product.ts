// order-product.ts
import { Product } from '../product/product'; // Importa l'interfaccia Product

export interface OrderProduct {
  product: Product; // Oggetto Product associato
  quantity: number; // Quantità del prodotto nell'ordine
}
