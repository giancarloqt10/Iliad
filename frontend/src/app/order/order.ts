// order.ts
import { OrderProduct } from './order-product'; // Importa l'interfaccia OrderProduct

export interface Order {
  id: number;
  customerName: string;
  orderDate: string; // Utilizza string per rappresentare la data nel formato desiderato (es. 'dd-mm-YYYY HH:mm:ss')
  description: string;
  orderProducts: OrderProduct[]; // Array di oggetti OrderProduct
}
