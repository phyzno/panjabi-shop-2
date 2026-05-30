import { Order } from './order.types';

export const MOCK_ORDERS: Order[] = [
    {
        id: "OLV-2026-001",
        customerName: "Md Shakib",
        customerPhone: "01711223344",
        customerAddress: "Mymensingh, Bangladesh",
        date: "2026-05-25",
        items: [
            {
                id: "ITEM-001",
                name: "Royal Olive Panjabi",
                productType: "readymade",
                quantity: 1,
                unitPrice: 2400,
                totalPrice: 2400,
                sizeMode: "numbered",
                sizeValue: "40"
            }
        ],
        subTotal: 2400,
        deliveryCharge: 100,
        discount: 0,
        grandTotal: 2500,
        orderStatus: "pending",
        paymentStatus: "unpaid",
        isArchived: false
    },
    {
        id: "OLV-2026-002",
        customerName: "Tamim Iqbal",
        customerPhone: "01811223344",
        customerAddress: "Dhaka, Bangladesh",
        date: "2026-05-20",
        items: [
            {
                id: "ITEM-002",
                name: "Classic White Set",
                productType: "readymade",
                quantity: 2,
                unitPrice: 3200,
                totalPrice: 6400,
                sizeMode: "preset",
                sizeValue: "L"
            }
        ],
        subTotal: 6400,
        deliveryCharge: 0,
        discount: 0,
        grandTotal: 6400,
        orderStatus: "delivered",
        paymentStatus: "paid",
        isArchived: false
    },
    {
        id: "OLV-2026-003",
        customerName: "Mushfiqur Rahim",
        customerPhone: "01911223344",
        customerAddress: "Chittagong, Bangladesh",
        date: "2026-05-15",
        items: [
            {
                id: "ITEM-003",
                name: "Egyptian Cotton Fabric",
                productType: "custom_fabric_only",
                quantity: 1,
                unitPrice: 1500,
                totalPrice: 7500,
                fabricYards: 5
            }
        ],
        subTotal: 7500,
        deliveryCharge: 100,
        discount: 100,
        grandTotal: 7500,
        orderStatus: "canceled",
        paymentStatus: "refunded",
        isArchived: false
    },
    {
        id: "OLV-2026-004",
        customerName: "Anik Ahmed",
        customerPhone: "01611223344",
        customerAddress: "Sylhet, Bangladesh",
        date: "2025-12-10",
        items: [
            {
                id: "ITEM-004",
                name: "Premium Silk Panjabi",
                productType: "custom_tailored",
                quantity: 1,
                unitPrice: 4400,
                totalPrice: 4400,
                sizeMode: "custom_measurements",
                measurements: { length: 42, chest: 38, shoulder: 17, sleeve: 24 },
                fabricYards: 4,
                collarType: "Band Collar"
            }
        ],
        subTotal: 4400,
        deliveryCharge: 100,
        discount: 0,
        grandTotal: 4500,
        orderStatus: "delivered",
        paymentStatus: "paid",
        isArchived: true
    },
    {
        id: "OLV-2026-005",
        customerName: "Ariful Islam",
        customerPhone: "01511223344",
        customerAddress: "Khulna, Bangladesh",
        date: "2026-05-26",
        items: [
            {
                id: "ITEM-005",
                name: "Kabli Suit Premium (Navy Blue)",
                productType: "custom_tailored",
                quantity: 1,
                unitPrice: 5200,
                totalPrice: 5200,
                sizeMode: "numbered",
                sizeValue: "42",
                fabricYards: 4.5,
                collarType: "Mandarin"
            }
        ],
        subTotal: 5200,
        deliveryCharge: 0,
        discount: 0,
        grandTotal: 5200,
        orderStatus: "processing",
        paymentStatus: "paid",
        isArchived: false
    },
    {
        id: "OLV-2026-006",
        customerName: "Nusrat Jahan",
        customerPhone: "01722334455",
        customerAddress: "Rajshahi, Bangladesh",
        date: "2026-05-26",
        items: [
            {
                id: "ITEM-006",
                name: "Semi-Formal Soft Cotton Panjabi",
                productType: "readymade",
                quantity: 1,
                unitPrice: 1750,
                totalPrice: 1750,
                sizeMode: "preset",
                sizeValue: "M"
            }
        ],
        subTotal: 1750,
        deliveryCharge: 100,
        discount: 0,
        grandTotal: 1850,
        orderStatus: "pending",
        paymentStatus: "unpaid",
        isArchived: false
    },
    {
        id: "OLV-2026-007",
        customerName: "Mahmudullah Riyad",
        customerPhone: "01822334455",
        customerAddress: "Barisal, Bangladesh",
        date: "2026-05-24",
        items: [
            {
                id: "ITEM-007A",
                name: "Royal Olive Panjabi",
                productType: "readymade",
                quantity: 1,
                unitPrice: 2500,
                totalPrice: 2500,
                sizeMode: "numbered",
                sizeValue: "42"
            },
            {
                id: "ITEM-007B",
                name: "Premium Koti",
                productType: "readymade",
                quantity: 1,
                unitPrice: 3000,
                totalPrice: 3000,
                sizeMode: "preset",
                sizeValue: "XL"
            }
        ],
        subTotal: 5500,
        deliveryCharge: 0,
        discount: 0,
        grandTotal: 5500,
        orderStatus: "shipped",
        paymentStatus: "paid",
        isArchived: false
    },
    {
        id: "OLV-2026-008",
        customerName: "Fahim Miah",
        customerPhone: "01922334455",
        customerAddress: "Rangpur, Bangladesh",
        date: "2026-05-22",
        items: [
            {
                id: "ITEM-008",
                name: "Indian Silk Fabric",
                productType: "custom_fabric_only",
                quantity: 1,
                unitPrice: 950,
                totalPrice: 3800,
                fabricYards: 4
            }
        ],
        subTotal: 3800,
        deliveryCharge: 0,
        discount: 0,
        grandTotal: 3800,
        orderStatus: "delivered",
        paymentStatus: "paid",
        isArchived: false
    },
    {
        id: "OLV-2026-009",
        customerName: "Sultana Kamal",
        customerPhone: "01622334455",
        customerAddress: "Comilla, Bangladesh",
        date: "2026-05-25",
        items: [
            {
                id: "ITEM-009",
                name: "Premium White Pajama",
                productType: "readymade",
                quantity: 3,
                unitPrice: 700,
                totalPrice: 2100,
                sizeMode: "numbered",
                sizeValue: "38"
            }
        ],
        subTotal: 2100,
        deliveryCharge: 0,
        discount: 0,
        grandTotal: 2100,
        orderStatus: "processing",
        paymentStatus: "paid",
        isArchived: false
    },
    {
        id: "OLV-2026-010",
        customerName: "Asif Rahman",
        customerPhone: "01522334455",
        customerAddress: "Gazipur, Bangladesh",
        date: "2026-05-25",
        items: [
            {
                id: "ITEM-010",
                name: "Luxury Eid Collection Panjabi",
                productType: "custom_tailored",
                quantity: 1,
                unitPrice: 8400,
                totalPrice: 8400,
                sizeMode: "custom_measurements",
                measurements: { length: 44, chest: 42, shoulder: 18.5, sleeve: 25 },
                fabricYards: 4,
                collarType: "Sherwani Collar"
            }
        ],
        subTotal: 8400,
        deliveryCharge: 100,
        discount: 0,
        grandTotal: 8500,
        orderStatus: "pending",
        paymentStatus: "unpaid",
        isArchived: false
    },
    {
        id: "OLV-2026-011",
        customerName: "Tanvir Hasan",
        customerPhone: "01733445566",
        customerAddress: "Narayanganj, Bangladesh",
        date: "2026-05-18",
        items: [
            {
                id: "ITEM-011",
                name: "Classic Black Panjabi",
                productType: "readymade",
                quantity: 1,
                unitPrice: 2700,
                totalPrice: 2700,
                sizeMode: "numbered",
                sizeValue: "44"
            }
        ],
        subTotal: 2700,
        deliveryCharge: 100,
        discount: 0,
        grandTotal: 2800,
        orderStatus: "delivered",
        paymentStatus: "paid",
        isArchived: false
    },
    {
        id: "OLV-2026-012",
        customerName: "Sajid Afridi",
        customerPhone: "01833445566",
        customerAddress: "Bogra, Bangladesh",
        date: "2026-05-14",
        items: [
            {
                id: "ITEM-012",
                name: "Designer Koti (Maroon)",
                productType: "readymade",
                quantity: 1,
                unitPrice: 3200,
                totalPrice: 3200,
                sizeMode: "preset",
                sizeValue: "L"
            }
        ],
        subTotal: 3200,
        deliveryCharge: 0,
        discount: 0,
        grandTotal: 3200,
        orderStatus: "canceled",
        paymentStatus: "unpaid",
        isArchived: false
    },
    {
        id: "OLV-2026-013",
        customerName: "Mehedi Hasan",
        customerPhone: "01933445566",
        customerAddress: "Mymensingh, Bangladesh",
        date: "2026-05-23",
        items: [
            {
                id: "ITEM-013",
                name: "Premium Cotton Panjabi Combo",
                productType: "readymade",
                quantity: 2,
                unitPrice: 2500,
                totalPrice: 5000,
                sizeMode: "numbered",
                sizeValue: "42"
            }
        ],
        subTotal: 5000,
        deliveryCharge: 0,
        discount: 0,
        grandTotal: 5000,
        orderStatus: "shipped",
        paymentStatus: "paid",
        isArchived: false
    },
    {
        id: "OLV-2026-014",
        customerName: "Farhana Chowdhury",
        customerPhone: "01633445566",
        customerAddress: "Dhaka, Bangladesh",
        date: "2026-05-19",
        items: [
            {
                id: "ITEM-014",
                name: "Gift Box - Royal Olive Special",
                productType: "readymade",
                quantity: 1,
                unitPrice: 4100,
                totalPrice: 4100,
                sizeMode: "preset",
                sizeValue: "M"
            }
        ],
        subTotal: 4100,
        deliveryCharge: 100,
        discount: 0,
        grandTotal: 4200,
        orderStatus: "delivered",
        paymentStatus: "paid",
        isArchived: false
    },
    {
        id: "OLV-2026-015",
        customerName: "Imran Khan",
        customerPhone: "01533445566",
        customerAddress: "Sylhet, Bangladesh",
        date: "2026-05-26",
        items: [
            {
                id: "ITEM-015",
                name: "Linen Slim-Fit Panjabi",
                productType: "readymade",
                quantity: 1,
                unitPrice: 2200,
                totalPrice: 2200,
                sizeMode: "preset",
                sizeValue: "S"
            }
        ],
        subTotal: 2200,
        deliveryCharge: 100,
        discount: 0,
        grandTotal: 2300,
        orderStatus: "pending",
        paymentStatus: "unpaid",
        isArchived: false
    },
    {
        id: "OLV-2026-016",
        customerName: "Taskin Ahmed",
        customerPhone: "01744556677",
        customerAddress: "Dhaka, Bangladesh",
        date: "2026-05-10",
        items: [
            {
                id: "ITEM-016",
                name: "Egyptian Cotton Fabric",
                productType: "custom_fabric_only",
                quantity: 1,
                unitPrice: 1500,
                totalPrice: 15000,
                fabricYards: 10
            }
        ],
        subTotal: 15000,
        deliveryCharge: 0,
        discount: 0,
        grandTotal: 15000,
        orderStatus: "delivered",
        paymentStatus: "paid",
        isArchived: false
    },
    {
        id: "OLV-2026-017",
        customerName: "Rakibul Hasan",
        customerPhone: "01844556677",
        customerAddress: "Feni, Bangladesh",
        date: "2026-05-25",
        items: [
            {
                id: "ITEM-017",
                name: "Classic White Set",
                productType: "readymade",
                quantity: 1,
                unitPrice: 3100,
                totalPrice: 3100,
                sizeMode: "numbered",
                sizeValue: "40"
            }
        ],
        subTotal: 3100,
        deliveryCharge: 100,
        discount: 0,
        grandTotal: 3200,
        orderStatus: "processing",
        paymentStatus: "paid",
        isArchived: false
    },
    {
        id: "OLV-2026-018",
        customerName: "Zainal Abedin",
        customerPhone: "01944556677",
        customerAddress: "Jessore, Bangladesh",
        date: "2026-05-12",
        items: [
            {
                id: "ITEM-018",
                name: "Premium Silk Panjabi (Gold)",
                productType: "custom_tailored",
                quantity: 1,
                unitPrice: 4800,
                totalPrice: 4800,
                sizeMode: "custom_measurements",
                measurements: { length: 41, chest: 39, shoulder: 17.5, sleeve: 23.5 },
                fabricYards: 3.5,
                collarType: "Semi-Sherwani"
            }
        ],
        subTotal: 4800,
        deliveryCharge: 100,
        discount: 100,
        grandTotal: 4800,
        orderStatus: "canceled",
        paymentStatus: "refunded",
        isArchived: false
    },
    {
        id: "OLV-2026-019",
        customerName: "Ahsan Habib",
        customerPhone: "01644556677",
        customerAddress: "Dinajpur, Bangladesh",
        date: "2026-05-24",
        items: [
            {
                id: "ITEM-019",
                name: "Semi-Formal Soft Cotton Panjabi",
                productType: "readymade",
                quantity: 1,
                unitPrice: 1750,
                totalPrice: 1750,
                sizeMode: "preset",
                sizeValue: "XL"
            }
        ],
        subTotal: 1750,
        deliveryCharge: 100,
        discount: 0,
        grandTotal: 1850,
        orderStatus: "shipped",
        paymentStatus: "paid",
        isArchived: false
    },
    {
        id: "OLV-2026-020",
        customerName: "Mustafizur R.",
        customerPhone: "01544556677",
        customerAddress: "Satkhira, Bangladesh",
        date: "2025-11-05",
        items: [
            {
                id: "ITEM-020",
                name: "Kabli Suit Premium (Black)",
                productType: "custom_tailored",
                quantity: 1,
                unitPrice: 5200,
                totalPrice: 5200,
                sizeMode: "numbered",
                sizeValue: "44",
                fabricYards: 5,
                collarType: "Mandarin"
            }
        ],
        subTotal: 5200,
        deliveryCharge: 0,
        discount: 0,
        grandTotal: 5200,
        orderStatus: "delivered",
        paymentStatus: "paid",
        isArchived: true
    }
];