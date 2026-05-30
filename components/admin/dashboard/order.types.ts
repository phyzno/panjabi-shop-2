// order.types.ts

export type ProductType = 'readymade' | 'custom_fabric_only' | 'custom_tailored';
export type SizeMode = 'preset' | 'numbered' | 'custom_measurements';

export interface CustomMeasurements {
    length?: number;
    chest?: number;
    shoulder?: number;
    sleeve?: number;
}

export interface OrderItem {
    id: string;
    name: string;
    productType: ProductType;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    
    // Sizing
    sizeMode?: SizeMode;
    sizeValue?: string; 
    measurements?: CustomMeasurements; 
    
    // Customization
    fabricYards?: number;
    collarType?: string;

    stitchingCharge?: number;
    fabricName?: string;
}

export interface Order {
    id: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    date: string;
    
    items: OrderItem[];
    
    subTotal: number;
    deliveryCharge: number;
    discount: number;
    grandTotal: number;

    orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'returned';
    paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'partially_refunded';
    isArchived: boolean;
}

// --- মক ডেটা ---
export const MOCK_ORDERS: Order[] = [
    {
        id: "OLV-2026-001",
        customerName: "Md Shakib",
        customerPhone: "017XXXXXXXX",
        customerAddress: "Mymensingh, Bangladesh",
        date: "2026-05-25",
        items: [
            {
                id: "ITEM-001",
                name: "Royal Olive Panjabi",
                productType: "readymade",
                quantity: 1,
                unitPrice: 2500,
                totalPrice: 2500,
                sizeMode: "numbered",
                sizeValue: "40"
            }
        ],
        subTotal: 2500,
        deliveryCharge: 100,
        discount: 0,
        grandTotal: 2600,
        orderStatus: "pending",
        paymentStatus: "unpaid",
        isArchived: false
    },
    {
        id: "OLV-2026-002",
        customerName: "Tamim Iqbal",
        customerPhone: "018XXXXXXXX",
        customerAddress: "Dhaka, Bangladesh",
        date: "2026-05-20",
        items: [
            {
                id: "ITEM-002",
                name: "Premium Silk Fabric",
                productType: "custom_fabric_only",
                quantity: 1,
                unitPrice: 800, // per yard
                totalPrice: 2400,
                fabricYards: 3
            },
            {
                id: "ITEM-003",
                name: "Tailored Kabli Suit",
                productType: "custom_tailored",
                quantity: 1,
                unitPrice: 1500, // making charge + fabric
                totalPrice: 4000,
                sizeMode: "custom_measurements",
                measurements: { length: 42, chest: 40, shoulder: 18, sleeve: 24 },
                fabricYards: 4,
                collarType: "Mandarin"
            }
        ],
        subTotal: 6400,
        deliveryCharge: 0,
        discount: 400,
        grandTotal: 6000,
        orderStatus: "delivered",
        paymentStatus: "paid",
        isArchived: false
    }
];