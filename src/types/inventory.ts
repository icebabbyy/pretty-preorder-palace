
// Unified inventory/product/order interfaces

// ---- Product Variant (for products with options/variations like color/size) ----
export interface ProductVariant {
  variantId: number;
  productId: number;
  sku: string;
  name: string;    // Display name e.g. "Red / S"
  option: string;  // Additional detail e.g. "Red, Small"
  image: string;
  priceThb: number;
  costThb: number;
  sellingPrice: number;
  quantity: number;
}

// ---- Product ----
export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  image: string;
  priceYuan?: number;
  exchangeRate?: number;
  priceThb?: number;
  importCost?: number;
  costThb: number | null; // always defined
  sellingPrice: number | null; // always defined
  status: string;
  shipmentDate?: string;
  link: string;
  description?: string;
  quantity?: number;
  variants: ProductVariant[];
}

// ---- Order Item ----
export interface OrderItem {
  productId: number;
  variantId?: number;
  productName: string;
  variantName?: string;
  productImage: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

// ---- Order ----
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
