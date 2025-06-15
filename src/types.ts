
export interface ProductOption {
  id: string;
  name: string;
  image: string;
  costThb: number;
  sellingPrice: number;
  quantity: number;
  profit: number;
}

export interface Product {
  id?: number; // Made optional so local state "new product" can omit it
  sku: string;
  name: string;
  category: string;
  image: string;
  priceYuan: number;
  exchangeRate: number;
  priceThb: number;
  importCost: number;
  costThb: number;
  sellingPrice: number;
  status: string;
  shipmentDate: string;
  link: string;
  description: string;
  quantity?: number;
  options?: ProductOption[]; // เพิ่ม array ของตัวเลือก
}

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface Order {
  id: number;
  items: OrderItem[];
  totalSellingPrice: number;
  totalCost: number;
  shippingCost: number;
  deposit: number;
  discount: number;
  profit: number;
  status: string;
  orderDate: string;
  username: string;
  address: string;
}
