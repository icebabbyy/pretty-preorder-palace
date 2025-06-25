
export interface ProductOption {
  id: string;
  name: string;
  image: string;
  costThb: number;
  sellingPrice: number;
  quantity: number;
  profit: number;
}

export interface ProductImage {
  id?: number;
  product_id?: number;
  image_url: string;
  order?: number;
  created_at?: string;
  variant_id?: string | null;
  variant_name?: string | null;
  file?: File; // Add optional file property for temporary storage during upload
}

export interface Product {
  id?: number; // Made optional so local state "new product" can omit it
  sku: string;
  name: string;
  category: string;
  categories: string[];
  productType: string;
  image: string;
  images?: ProductImage[]; // Add images array
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
  options?: ProductOption[];
  tags?: string[];
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
  paymentDate?: string | null;
  paymentSlip?: string | null;
  username: string;
  address: string;
}
