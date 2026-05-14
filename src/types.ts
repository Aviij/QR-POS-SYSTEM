export interface Product {
    id: string;
    qrCode: string;
    name: string;
    brand: string;
    category: 'FRAME' | 'LENS';
    price: number;
    stock: number;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Transaction {
    id: string;
    date: string;
    items: CartItem[];
    total: number;
}

export type BottomSheetState = 'COLLAPSED' | 'EXPANDED';

