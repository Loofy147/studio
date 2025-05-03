
import { v4 as uuidv4 } from 'uuid';

// Expanded store categories
export type StoreCategory = 'electronics' | 'clothing' | 'groceries' | 'books' | 'home goods' | 'toys' | 'restaurants' | 'coffee shops' | 'other';

// Categories eligible for daily offers
export const dailyOfferEligibleCategories: StoreCategory[] = ['groceries', 'restaurants', 'coffee shops'];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string; // e.g., 'laptops', 'shirts', 'vegetables', 'coffee beans', 'prepared meals'
  storeId: string; // Link back to the store (Required for product management)
  storeName?: string; // Optional: Denormalized store name
  sales?: number; // Optional: Mock sales count
  // Add specific fields if needed, e.g., ingredients for restaurants
  ingredients?: string[]; // Example for restaurants/groceries
  size?: string; // Example for clothing/coffee
}

// Interface for Promotions
export type PromotionScope = 'all_products' | 'specific_products' | 'specific_categories';
export type DiscountType = 'percentage' | 'fixed_amount';

export interface Promotion {
    id: string;
    storeId: string;
    name: string; // e.g., "Summer Sale", "Weekend Special"
    description?: string;
    discountType: DiscountType;
    discountValue: number; // Percentage (e.g., 10 for 10%) or fixed amount (e.g., 5 for $5)
    scope: PromotionScope;
    applicableIds?: string[]; // Product IDs or Category names depending on scope
    startDate?: Date;
    endDate?: Date;
    promoCode?: string; // Optional code needed to redeem
    isActive: boolean;
}


export interface Store {
  id: string;
  name: string;
  description: string;
  category: StoreCategory;
  imageUrl?: string; // Optional banner image for the store
  products: Product[]; // Products associated with the store
  rating?: number; // Optional average rating
  ownerId?: string; // Link to the user who owns the store
  dailyOffers: DailyOffer[]; // Specific offers for this store
  promotions: Promotion[]; // Promotions offered by the store
  // Add store-specific details if needed
  openingHours?: string; // Example for restaurants/shops
  address?: string; // Example for physical locations
  // Admin related fields (added via declaration merging later or directly)
  isActive?: boolean; // Managed by admin
  createdAt?: Date; // When the store was created/approved
}

// Interface for Daily Subscription Offers
export interface DailyOffer {
    id: string;
    storeId: string;
    name: string; // e.g., "Daily Lunch Special", "Weekly Veggie Box"
    description: string;
    // Can be a single product or a bundle
    items: { productId: string; quantity: number }[];
    price: number; // Price per delivery/cycle
    frequency: 'daily' | 'weekly'; // How often the offer repeats
    isActive: boolean; // Whether the offer is currently available for subscription
    imageUrl?: string; // Optional image for the offer
}

// Interface for User Subscriptions
export interface Subscription {
    id: string;
    userId: string;
    offerId: string;
    storeId: string;
    storeName: string; // Denormalized
    offerName: string; // Denormalized
    startDate: Date;
    status: 'active' | 'paused' | 'cancelled';
    // Optional: next delivery date, payment details etc.
    nextDeliveryDate?: Date;
}

// Interface for Delivery Address
export interface DeliveryAddress {
    id: string;
    label: 'Home' | 'Work' | 'Friend' | string; // e.g., 'Home', 'Work', 'Mom's House'
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string; // Optional
    isDefault?: boolean;
}


// Interface and function for user profile (placeholder)
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    // address?: string; // Deprecated, use addresses array
    addresses: DeliveryAddress[]; // Use an array for multiple addresses
    phone?: string;
    loyaltyPoints: number;
    // Admin related fields (added via declaration merging later or directly)
    role?: 'customer' | 'store_owner' | 'driver' | 'admin' | string; // User role
    status?: 'active' | 'disabled' | 'pending' | string; // User account status
    joinedAt?: Date; // When the user joined
}

export interface Order {
    id: string;
    userId: string; // Link to user profile
    storeId: string;
    storeName: string; // Denormalized for easy display
    items: { productId: string; name: string; quantity: number; price: number }[];
    totalAmount: number;
    orderDate: Date;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    trackingNumber?: string;
    deliveryAddress: string; // Store the full address string used for this order
    // Add driver ID if assigned
    driverId?: string;
}


// --- Mock Data Store ---
let mockStores: Store[] | null = null;
let mockProducts: Product[] | null = null;
let mockDailyOffers: DailyOffer[] | null = null;
let mockPromotions: Promotion[] | null = null; // Add mock promotions store
let mockSubscriptions: Subscription[] | null = null;
let mockUserProfiles: UserProfile[] | null = null; // Add mock users store
let mockOrders: Order[] | null = null; // Add mock orders store


// --- Mock Data Generation ---

function generateMockStores(): Store[] {
     return [
        {
          id: "store-1", name: "ElectroMart", description: "Your one-stop shop for the latest electronics.", category: "electronics",
          imageUrl: `https://picsum.photos/seed/electromart/400/300`, rating: 4.5, ownerId: 'owner-001', products: [], dailyOffers: [], promotions: []
        },
        {
          id: "store-2", name: "Fashionista Boutique", description: "Trendy clothing and accessories.", category: "clothing",
          imageUrl: `https://picsum.photos/seed/fashionista/400/300`, rating: 4.2, ownerId: 'owner-002', products: [], dailyOffers: [], promotions: []
        },
        {
          id: "store-3", name: "FreshGrocer", description: "Quality groceries and fresh produce.", category: "groceries",
          imageUrl: `https://picsum.photos/seed/freshgrocer/400/300`, rating: 4.8, openingHours: "7 AM - 9 PM", address: "100 Grocery Lane", ownerId: 'owner-003', products: [], dailyOffers: [], promotions: []
        },
        {
          id: "store-4", name: "The Book Nook", description: "Discover your next favorite read.", category: "books",
          imageUrl: `https://picsum.photos/seed/booknook/400/300`, rating: 4.6, ownerId: 'owner-004', products: [], dailyOffers: [], promotions: []
        },
        {
          id: "store-5", name: "Cozy Home", description: "Everything for your home.", category: "home goods",
          imageUrl: `https://picsum.photos/seed/cozyhome/400/300`, rating: 4.3, ownerId: 'owner-005', products: [], dailyOffers: [], promotions: []
        },
        {
          id: "store-6", name: "Toy Galaxy", description: "Fun and educational toys.", category: "toys",
          imageUrl: `https://picsum.photos/seed/toygalaxy/400/300`, rating: 4.0, ownerId: 'owner-006', products: [], dailyOffers: [], promotions: []
        },
        {
          id: "store-7", name: "Gadget Hub", description: "Cutting-edge tech.", category: "electronics",
          imageUrl: `https://picsum.photos/seed/gadgethub/400/300`, rating: 4.7, ownerId: 'owner-001', products: [], dailyOffers: [], promotions: [] // Reused owner
        },
        {
          id: "store-8", name: "Style Threads", description: "Affordable and stylish clothing.", category: "clothing",
          imageUrl: `https://picsum.photos/seed/stylethreads/400/300`, rating: 3.9, ownerId: 'owner-007', products: [], dailyOffers: [], promotions: []
        },
        {
            id: "store-9", name: "The Daily Grind", description: "Artisan coffee, pastries, and light bites.", category: "coffee shops",
            imageUrl: `https://picsum.photos/seed/dailygrind/400/300`, rating: 4.9, openingHours: "6 AM - 6 PM", address: "25 Coffee Bean Blvd", ownerId: 'owner-008', products: [], dailyOffers: [], promotions: []
        },
        {
            id: "store-10", name: "Mama Mia Pizzeria", description: "Authentic Italian pizza and pasta dishes.", category: "restaurants",
            imageUrl: `https://picsum.photos/seed/mamamia/400/300`, rating: 4.5, openingHours: "11 AM - 10 PM", address: "50 Pizza Plaza", ownerId: 'owner-009', products: [], dailyOffers: [], promotions: []
        },
        {
            id: "store-11", name: "GreenBasket Organics", description: "Certified organic fruits, vegetables, and pantry staples.", category: "groceries",
            imageUrl: `https://picsum.photos/seed/greenbasket/400/300`, rating: 4.7, openingHours: "8 AM - 8 PM", address: "75 Organic Way", ownerId: 'owner-010', products: [], dailyOffers: [], promotions: []
        },
         { // Example inactive store
          id: "store-12", name: "Vintage Finds", description: "Closed for renovation.", category: "other",
          imageUrl: `https://picsum.photos/seed/vintagefinds/400/300`, rating: 4.1, ownerId: 'owner-011', isActive: false, products: [], dailyOffers: [], promotions: []
        },
      ].map(s => ({ // Add default active status and creation date
          ...s,
          isActive: s.isActive === undefined ? true : s.isActive,
          createdAt: s.createdAt ?? new Date(Date.now() - Math.random() * 90 * 86400000) // Within last 3 months
      }));
}

function generateAllMockProducts(stores: Store[]): Product[] {
    let allProducts: Product[] = [];
    stores.forEach(store => {
        if (!store.isActive) return; // Don't generate products for inactive stores
        let count = 10 + Math.floor(Math.random() * 15);
        if (store.category === 'groceries') count = 30 + Math.floor(Math.random() * 40);
        if (store.category === 'restaurants') count = 15 + Math.floor(Math.random() * 20);
        if (store.category === 'coffee shops') count = 10 + Math.floor(Math.random() * 10);

         const storeProducts = generateMockProductsStore(store.id, store.category, count);
         storeProducts.forEach(p => {
             p.storeId = store.id;
             p.storeName = store.name;
             p.sales = Math.floor(Math.random() * 500);
         });
         allProducts = allProducts.concat(storeProducts);
    });
    return allProducts;
}

function generateMockProductsStore(storeId: string, category: StoreCategory, count: number): Product[] {
    // (Keep the existing generateMockProductsStore logic as it is good)
    const products: Product[] = [];
    const baseNames: Record<StoreCategory, string[]> = {
        electronics: ["Laptop", "Smartphone", "Headphones", "Monitor", "Keyboard", "Mouse", "Charger", "Tablet", "Smartwatch", "Camera"],
        clothing: ["T-Shirt", "Jeans", "Jacket", "Dress", "Sweater", "Shoes", "Hat", "Scarf", "Socks", "Belt"],
        groceries: ["Apple", "Banana", "Milk", "Bread", "Eggs", "Cheese", "Yogurt", "Chicken Breast", "Rice", "Pasta", "Tomato", "Spinach", "Orange Juice", "Cereal"],
        books: ["Novel", "Biography", "Cookbook", "History Book", "Sci-Fi Novel", "Mystery Thriller", "Poetry Collection", "Fantasy Saga", "Self-Help Guide"],
        'home goods': ["Lamp", "Cushion", "Vase", "Picture Frame", "Towel Set", "Cutlery Set", "Mug", "Dinner Plate", "Scented Candle", "Throw Blanket"],
        toys: ["Action Figure", "Building Blocks", "Board Game", "Fashion Doll", "Jigsaw Puzzle", "Toy Car", "Plush Animal", "Art Set", "Science Kit"],
        restaurants: ["Margherita Pizza", "Cheeseburger", "Caesar Salad", "Spaghetti Bolognese", "Chicken Curry", "Sushi Roll", "Pad Thai", "Burrito Bowl", "Club Sandwich"],
        'coffee shops': ["Espresso", "Cappuccino", "Latte", "Iced Coffee", "Croissant", "Muffin", "Bagel", "Tea", "Cold Brew", "Mocha"],
        other: ["Generic Product"]
    };
    const adjectives: Record<StoreCategory, string[]> = {
        electronics: ["Premium", "Ultra", "Smart", "Wireless", "Gaming", "Portable", "HD", "4K"],
        clothing: ["Classic", "Modern", "Vintage", "Slim Fit", "Oversized", "Embroidered", "Silk", "Cotton"],
        groceries: ["Organic", "Fresh", "Artisan", "Imported", "Local", "Whole Wheat", "Free-Range", "Low Fat"],
        books: ["Hardcover", "Paperback", "Illustrated", "Signed", "First Edition", "Bestselling", "Classic"],
        'home goods': ["Cozy", "Modern", "Rustic", "Minimalist", "Handmade", "Decorative", "Scented", "Large"],
        toys: ["Interactive", "Educational", "Collectible", "Remote Control", "Wooden", "Soft", "Musical"],
        restaurants: ["Gourmet", "Classic", "Spicy", "Vegetarian", "Family Size", "Chef's Special", "Authentic"],
        'coffee shops': ["Single Origin", "Fair Trade", "Iced", "Hot", "Decaf", "Large", "Small", "Artisan"],
        other: ["Deluxe", "Standard", "Basic"]
    };

    for (let i = 1; i <= count; i++) {
        const baseNameList = baseNames[category] || ["Item"];
        const baseName = baseNameList[Math.floor(Math.random() * baseNameList.length)];
        const adjList = adjectives[category] || ["Quality"];
        const adj = adjList[Math.floor(Math.random() * adjList.length)];

        const name = `${adj} ${baseName}`;
        const priceRanges: Record<StoreCategory, {min: number, max: number}> = {
             electronics: { min: 20, max: 1500 },
             clothing: { min: 10, max: 200 },
             groceries: { min: 1, max: 25 },
             books: { min: 5, max: 50 },
             'home goods': { min: 5, max: 300 },
             toys: { min: 3, max: 100 },
             restaurants: { min: 8, max: 40 },
             'coffee shops': { min: 2, max: 15 },
             other: { min: 1, max: 50 },
        }
        const range = priceRanges[category];
        const price = parseFloat((Math.random() * (range.max - range.min) + range.min).toFixed(2));
        const productCategory = baseName.toLowerCase().replace(/\s+/g, '-');

        const product: Product = {
            id: `${storeId}-prod-${i}-${productCategory}`, // Make ID more unique including category
            name: name,
            description: `A ${name.toLowerCase()}. ${category === 'restaurants' ? 'Delicious and freshly prepared.' : category === 'groceries' ? 'High-quality ingredient.' : 'Perfect for your needs.' }`,
            price: price,
            imageUrl: `https://picsum.photos/seed/${storeId}-${name.replace(/\s+/g, '-')}-${i}/300/200`,
            category: productCategory, // Use generated product category
            storeId: storeId, // Ensure storeId is always set here
            ...(category === 'restaurants' && { ingredients: ['Flour', 'Tomato', 'Cheese'] }),
            ...(category === 'clothing' && { size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)] }),
            ...(category === 'coffee shops' && { size: ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)] }),
        };
        products.push(product);
    }
    return products;
}

function generateMockDailyOffers(stores: Store[], products: Product[]): DailyOffer[] {
    const offers: DailyOffer[] = [];
    const eligibleStores = stores.filter(s => dailyOfferEligibleCategories.includes(s.category) && s.isActive);

    eligibleStores.forEach(store => {
        const storeProducts = products.filter(p => p.storeId === store.id);
        if (storeProducts.length < 2) return;

        for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) { // 1-3 offers
             const isWeekly = Math.random() > 0.7;
             const offerType = store.category === 'restaurants' ? 'Meal Deal' : store.category === 'groceries' ? 'Produce Box' : 'Coffee Combo';
             const offerName = `${isWeekly ? 'Weekly' : 'Daily'} ${offerType} #${i+1}`;
             const numItems = Math.floor(Math.random() * 3) + 1;
             const offerItems: DailyOffer['items'] = [];
             let offerPrice = 0;
             const usedProductIds = new Set<string>(); // Ensure unique products per offer

             for (let j=0; j<numItems && offerItems.length < storeProducts.length; j++) {
                let product: Product | undefined;
                let attempts = 0;
                 // Try to pick an unused product
                 do {
                    product = storeProducts[Math.floor(Math.random() * storeProducts.length)];
                    attempts++;
                 } while (product && usedProductIds.has(product.id) && attempts < storeProducts.length * 2);

                if (product && !usedProductIds.has(product.id)) {
                     const quantity = Math.floor(Math.random() * 2) + 1;
                     offerItems.push({ productId: product.id, quantity: quantity });
                     offerPrice += product.price * quantity;
                     usedProductIds.add(product.id);
                 }
             }

             if (offerItems.length === 0) continue; // Skip if no items could be added

            offerPrice *= (0.8 + Math.random() * 0.15);

            offers.push({
                id: `offer-${store.id}-${i}`,
                storeId: store.id,
                name: offerName,
                description: `Get your ${offerName.toLowerCase()} delivered ${isWeekly ? 'weekly' : 'daily'}. Includes selected items from ${store.name}.`,
                items: offerItems,
                price: parseFloat(offerPrice.toFixed(2)),
                frequency: isWeekly ? 'weekly' : 'daily',
                isActive: Math.random() > 0.15, // ~85% active
                imageUrl: `https://picsum.photos/seed/offer-${store.id}-${i}/300/200`
            });
        }
    });
    return offers;
}

function generateMockPromotions(stores: Store[], products: Product[]): Promotion[] {
    const promotions: Promotion[] = [];
    const scopes: PromotionScope[] = ['all_products', 'specific_products', 'specific_categories'];
    const discountTypes: DiscountType[] = ['percentage', 'fixed_amount'];

    stores.forEach(store => {
        if (!store.isActive || Math.random() < 0.3) return; // Skip inactive or some active stores randomly

        const numPromotions = Math.floor(Math.random() * 3); // 0-2 promotions per store
        const storeProducts = products.filter(p => p.storeId === store.id);
        const storeCategories = Array.from(new Set(storeProducts.map(p => p.category)));

        for (let i = 0; i < numPromotions; i++) {
            const scope = scopes[Math.floor(Math.random() * scopes.length)];
            const discountType = discountTypes[Math.floor(Math.random() * discountTypes.length)];
            let discountValue: number;
            let applicableIds: string[] | undefined;

            if (discountType === 'percentage') {
                discountValue = [5, 10, 15, 20, 25][Math.floor(Math.random() * 5)]; // 5-25%
            } else {
                discountValue = [1, 2, 5, 10][Math.floor(Math.random() * 4)]; // $1, $2, $5, $10
            }

            if (scope === 'specific_products' && storeProducts.length > 0) {
                const numApplicable = Math.min(storeProducts.length, Math.floor(Math.random() * 3) + 1);
                applicableIds = [...storeProducts].sort(() => 0.5 - Math.random()).slice(0, numApplicable).map(p => p.id);
            } else if (scope === 'specific_categories' && storeCategories.length > 0) {
                const numApplicable = Math.min(storeCategories.length, Math.floor(Math.random() * 2) + 1);
                applicableIds = [...storeCategories].sort(() => 0.5 - Math.random()).slice(0, numApplicable);
            }

            const startDate = Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 14 * 86400000) : undefined; // Optional start date within last 2 weeks
            const endDate = startDate && Math.random() > 0.2 ? new Date(startDate.getTime() + (7 + Math.random() * 21) * 86400000) : undefined; // Optional end date 1-4 weeks after start

            promotions.push({
                id: `promo-${store.id}-${i}`,
                storeId: store.id,
                name: `${discountType === 'percentage' ? `${discountValue}% Off` : `${formatCurrency(discountValue)} Off`} ${scope === 'all_products' ? 'Everything' : scope === 'specific_categories' ? (applicableIds ? applicableIds.join(', ') : 'Selected Items') : 'Selected Products'}`,
                description: `Limited time offer on ${scope === 'all_products' ? 'all items' : 'select items'}!`,
                discountType: discountType,
                discountValue: discountValue,
                scope: scope,
                applicableIds: applicableIds,
                startDate: startDate,
                endDate: endDate,
                promoCode: Math.random() > 0.7 ? `SAVE${discountValue}${Math.floor(Math.random() * 100)}` : undefined, // Optional promo code
                isActive: Math.random() > 0.1, // ~90% active
            });
        }
    });
    return promotions;
}


function generateMockUserProfiles(): UserProfile[] {
    const users: UserProfile[] = [];
    const roles: UserProfile['role'][] = ['customer', 'store_owner', 'driver', 'admin'];
    const statuses: UserProfile['status'][] = ['active', 'disabled', 'pending'];
    const names = ["Alex Ryder", "Beth Green", "Carlos Villa", "Diana Prince", "Ethan Hunt", "Fiona Glenanne", "George Smiley", "Harriet Vane"];

    // Helper to generate mock addresses
    const generateAddresses = (count: number, isDefaultIndex: number): DeliveryAddress[] => {
        const addresses: DeliveryAddress[] = [];
        const labels = ['Home', 'Work', 'Friend'];
        for (let i = 0; i < count; i++) {
            addresses.push({
                id: `addr-${uuidv4().substring(0, 8)}`,
                label: labels[i] || `Other ${i+1}`,
                street: `${100 + i*10} ${['Main', 'Oak', 'Pine', 'Maple'][i % 4]} St`,
                city: 'Anytown',
                state: 'CA',
                zipCode: `${90210 + i}`,
                country: 'USA',
                isDefault: i === isDefaultIndex,
            });
        }
        return addresses;
    };


    // Add some specific users with addresses
    users.push({
        id: "user123", name: "Alex Ryder", email: "alex.ryder@example.com", loyaltyPoints: 285, role: 'customer', status: 'active', joinedAt: new Date(Date.now() - 150 * 86400000),
        addresses: generateAddresses(2, 0), // Home (default), Work
        phone: '555-111-2222',
    });
    users.push({
        id: "owner-001", name: "Eleanor Vance", email: "eleanor@electromart.com", loyaltyPoints: 50, role: 'store_owner', status: 'active', joinedAt: new Date(Date.now() - 300 * 86400000),
        addresses: generateAddresses(1, 0), // Home (default)
        phone: '555-333-4444',
    });
    users.push({
        id: "driver-001", name: "Driver Dan", email: "dan.driver@dispatch.com", loyaltyPoints: 15, role: 'driver', status: 'active', joinedAt: new Date(Date.now() - 90 * 86400000),
        addresses: [], // Drivers might not need delivery addresses stored this way
        phone: '555-555-6666',
    });
    users.push({
        id: "admin-001", name: "Admin User", email: "admin@swiftdispatch.example", loyaltyPoints: 0, role: 'admin', status: 'active', joinedAt: new Date(Date.now() - 500 * 86400000),
        addresses: [],
        phone: '555-777-8888',
    });

    // Add more random users with addresses
    for (let i = 0; i < 20; i++) {
        const id = `user-${uuidv4().substring(0, 6)}`;
        const name = names[Math.floor(Math.random() * names.length)];
        const role = roles[Math.floor(Math.random() * (roles.length -1 ))]; // Exclude admin for random
        const numAddresses = role === 'customer' ? Math.floor(Math.random() * 3) + 1 : 1; // Customers get 1-3, others 1
        const defaultAddressIndex = role === 'customer' ? Math.floor(Math.random() * numAddresses) : 0;

        users.push({
            id: id,
            name: name,
            email: `${name.split(' ')[0].toLowerCase()}.${id.slice(-3)}@example.com`,
            loyaltyPoints: Math.floor(Math.random() * 1000),
            role: role,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            joinedAt: new Date(Date.now() - Math.random() * 500 * 86400000),
            addresses: generateAddresses(numAddresses, defaultAddressIndex),
            phone: `555-1${i.toString().padStart(2,'0')}-1234`
        });
    }

    return users;
}

function generateMockOrders(users: UserProfile[], stores: Store[], products: Product[]): Order[] {
    const orders: Order[] = [];
    const statuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const activeStores = stores.filter(s => s.isActive);
    const customers = users.filter(u => u.role === 'customer' && u.status === 'active' && u.addresses.length > 0);

    if (customers.length === 0 || activeStores.length === 0) return [];

    for (let i = 0; i < 50; i++) { // Generate 50 mock orders
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const store = activeStores[Math.floor(Math.random() * activeStores.length)];
        const storeProducts = products.filter(p => p.storeId === store.id);
        if (storeProducts.length === 0) continue;

        const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items per order
        const orderItems: Order['items'] = [];
        let totalAmount = 0;
        const usedProductIds = new Set<string>();

        for (let j = 0; j < numItems && orderItems.length < storeProducts.length; j++) {
             let product: Product | undefined;
             let attempts = 0;
             do {
                product = storeProducts[Math.floor(Math.random() * storeProducts.length)];
                attempts++;
             } while (product && usedProductIds.has(product.id) && attempts < storeProducts.length * 2)

             if (product && !usedProductIds.has(product.id)) {
                 const quantity = Math.floor(Math.random() * 3) + 1;
                 orderItems.push({ productId: product.id, name: product.name, quantity: quantity, price: product.price });
                 totalAmount += product.price * quantity;
                 usedProductIds.add(product.id);
             }
        }
         if (orderItems.length === 0) continue; // Skip if no items could be added


        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const orderDate = new Date(Date.now() - Math.random() * 60 * 86400000); // Within last 60 days
        // Select a random address from the user's profile for the order
        const deliveryAddressObj = customer.addresses[Math.floor(Math.random() * customer.addresses.length)];
        const deliveryAddressString = `${deliveryAddressObj.street}, ${deliveryAddressObj.city}, ${deliveryAddressObj.state} ${deliveryAddressObj.zipCode}`;


        orders.push({
            id: `order-${uuidv4().substring(0, 8)}`,
            userId: customer.id,
            storeId: store.id,
            storeName: store.name,
            items: orderItems,
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            orderDate: orderDate,
            status: status,
            trackingNumber: status === 'Shipped' || status === 'Delivered' ? `TRK${uuidv4().substring(0, 10).toUpperCase()}` : undefined,
            deliveryAddress: deliveryAddressString, // Store the selected address string
            driverId: (status === 'Shipped' || status === 'Delivered') && Math.random() > 0.3 ? `driver-${uuidv4().substring(0, 8)}` : undefined // Assign driver sometimes
        });
    }
    return orders;
}

function generateMockSubscriptions(userId: string, offers: DailyOffer[], stores: Store[]): Subscription[] {
    // (Keep the existing generateMockSubscriptions logic)
    const subscriptions: Subscription[] = [];
    const numSubscriptions = Math.floor(Math.random() * 3); // 0-2 subscriptions per user
    const userOffers = offers.filter(o => Math.random() > 0.5); // Randomly select some available offers

    for (let i = 0; i < numSubscriptions && i < userOffers.length; i++) {
        const offer = userOffers[i];
        const store = stores.find(s => s.id === offer.storeId);
        if (!store || !offer.isActive) continue; // Ensure offer and store exist and offer is active

        const startDate = new Date(Date.now() - (Math.random() * 30 * 86400000)); // Start date within last 30 days
        const statusOptions: Subscription['status'][] = ['active', 'paused', 'cancelled'];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

        subscriptions.push({
            id: `sub-${userId}-${offer.id.slice(-4)}`, // Make ID slightly more unique
            userId: userId,
            offerId: offer.id,
            storeId: offer.storeId,
            storeName: store.name,
            offerName: offer.name,
            startDate: startDate,
            status: status,
            nextDeliveryDate: status === 'active' ? new Date(Date.now() + (offer.frequency === 'daily' ? 1 : 7) * 86400000 * (Math.random() * 0.5 + 0.5)) : undefined, // Next delivery within 0.5-1 cycle
        });
    }
    return subscriptions;
}


// --- Initialization ---

async function initializeMockData() {
    if (!mockUserProfiles) {
        mockUserProfiles = generateMockUserProfiles();
    }
    if (!mockStores) {
        mockStores = generateMockStores();
        // Assign owners from mock users if possible
        mockStores.forEach(store => {
            if (!store.ownerId) {
                const potentialOwner = mockUserProfiles!.find(u => u.role === 'store_owner' && Math.random() > 0.5); // Assign randomly
                 if (potentialOwner) store.ownerId = potentialOwner.id;
            }
        })
    }
    if (!mockProducts) {
        mockProducts = generateAllMockProducts(mockStores);
         // Link products back to stores
        mockStores.forEach(store => {
            store.products = mockProducts!.filter(product => product.storeId === store.id);
        });
    }
    if (!mockDailyOffers) {
        mockDailyOffers = generateMockDailyOffers(mockStores, mockProducts);
        // Link offers back to stores
        mockStores.forEach(store => {
            store.dailyOffers = mockDailyOffers!.filter(offer => offer.storeId === store.id);
        });
    }
    if (!mockPromotions) {
        mockPromotions = generateMockPromotions(mockStores, mockProducts);
        // Link promotions back to stores
        mockStores.forEach(store => {
            store.promotions = mockPromotions!.filter(promo => promo.storeId === store.id);
        });
    }
    if (!mockOrders) {
         mockOrders = generateMockOrders(mockUserProfiles, mockStores, mockProducts);
    }
    if (!mockSubscriptions) {
        // Generate subs for multiple users
        mockSubscriptions = [];
        const customers = mockUserProfiles.filter(u => u.role === 'customer');
        customers.slice(0, 5).forEach(c => { // Generate for first 5 customers
            mockSubscriptions = mockSubscriptions!.concat(generateMockSubscriptions(c.id, mockDailyOffers!, mockStores!));
        });
    }
}


// --- Service Functions ---

// STORES
export async function getStores(): Promise<Store[]> {
  console.log("Fetching stores...");
  await initializeMockData();
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Stores fetched:", mockStores!.length);
      resolve([...mockStores!].map(s => ({...s}))); // Return copies
    }, 200); // Faster delay
  });
}

export async function getStoreById(storeId: string): Promise<Store | null> {
     console.log(`Fetching store by ID: ${storeId}`);
     await initializeMockData();
     const store = mockStores!.find(s => s.id === storeId);

     if (!store) {
        console.log("Store not found");
        return Promise.resolve(null);
     }

     // Ensure products, offers, and promotions are attached
     const storeWithDetails = {
         ...store,
         products: mockProducts!.filter(p => p.storeId === storeId),
         dailyOffers: mockDailyOffers!.filter(o => o.storeId === storeId),
         promotions: mockPromotions!.filter(promo => promo.storeId === storeId)
     };

     return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Store details fetched:", storeWithDetails.name);
             resolve({...storeWithDetails}); // Return a copy
        }, 100); // Faster delay
     });
}

export async function createStore(storeData: Omit<Store, 'id' | 'products' | 'dailyOffers' | 'promotions' | 'isActive' | 'createdAt' | 'ownerId'>, ownerId: string): Promise<Store> {
  console.log("Creating store:", storeData);
  await initializeMockData();
  const newStore: Store = {
    id: uuidv4(),
    products: [],
    dailyOffers: [],
    promotions: [],
    ...storeData,
    ownerId: ownerId,
    isActive: false, // New stores start inactive/pending approval by admin
    createdAt: new Date(),
  };
  mockStores!.push(newStore);
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Store created (pending approval):", newStore.name);
      resolve({...newStore}); // Return a copy
    }, 150);
  });
}

// PRODUCTS
export async function getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
    console.log("Fetching products with options:", options);
    await initializeMockData();
    let filteredProducts = [...mockProducts!];
    if (options.storeId) {
        filteredProducts = filteredProducts.filter(p => p.storeId === options.storeId);
    }
    if (options.category && options.category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === options.category);
    }
    if (options.sortBy === 'sales') {
        filteredProducts.sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0));
    } else if (options.sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (options.sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }
    if (options.limit) {
        filteredProducts = filteredProducts.slice(0, options.limit);
    }
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Products fetched:", filteredProducts.length);
            resolve(filteredProducts.map(p => ({...p}))); // Return copies
        }, 150); // Faster delay
    });
}
interface GetProductsOptions {
    limit?: number;
    sortBy?: 'sales' | 'rating' | 'price_asc' | 'price_desc';
    category?: string;
    storeId?: string;
}


export async function createProduct(productData: Omit<Product, 'id' | 'sales'>): Promise<Product> {
    console.log("Creating product:", productData);
    await initializeMockData();
    const newProduct: Product = {
        id: `${productData.storeId}-prod-${uuidv4().substring(0, 6)}-${productData.category}`, // More unique ID
        sales: 0,
        ...productData,
    };
    mockProducts!.push(newProduct);
    // Also add to the store's product list in mockStores
    const storeIndex = mockStores!.findIndex(s => s.id === newProduct.storeId);
    if (storeIndex > -1) {
        mockStores![storeIndex].products.push(newProduct);
    }
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Product created:", newProduct.name);
            resolve({...newProduct}); // Return a copy
        }, 100);
    });
}


// DAILY OFFERS & SUBSCRIPTIONS (Keep existing functions, adjust delays if needed)
export async function getStoreDailyOffers(storeId: string): Promise<DailyOffer[]> {
    await initializeMockData();
    const offers = mockDailyOffers!.filter(o => o.storeId === storeId && o.isActive);
    return Promise.resolve(offers.map(o => ({...o}))); // Faster response, return copies
}

export async function createDailyOffer(offerData: Omit<DailyOffer, 'id'>): Promise<DailyOffer> {
    await initializeMockData();
    const newOffer: DailyOffer = { id: `offer-${offerData.storeId}-${uuidv4().substring(0, 6)}`, ...offerData };
    mockDailyOffers!.push(newOffer);
    const storeIndex = mockStores!.findIndex(s => s.id === newOffer.storeId);
    if (storeIndex > -1) mockStores![storeIndex].dailyOffers.push(newOffer);
    return Promise.resolve({...newOffer}); // Return copy
}

export async function createSubscription(userId: string, offerId: string): Promise<Subscription> {
    await initializeMockData();
    const offer = mockDailyOffers!.find(o => o.id === offerId);
    const store = mockStores!.find(s => s.id === offer?.storeId);
    if (!offer || !store || !offer.isActive) throw new Error("Offer not available.");
    const newSubscription: Subscription = {
        id: `sub-${userId}-${offerId.slice(-4)}`, userId, offerId, storeId: store.id, storeName: store.name,
        offerName: offer.name, startDate: new Date(), status: 'active',
        nextDeliveryDate: new Date(Date.now() + (offer.frequency === 'daily' ? 1 : 7) * 86400000)
    };
    mockSubscriptions!.push(newSubscription);
    return Promise.resolve({...newSubscription}); // Return copy
}

export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
    await initializeMockData();
    const userSubs = mockSubscriptions!.filter(sub => sub.userId === userId);
    return Promise.resolve(userSubs.map(s => ({...s}))); // Return copies
}

export async function updateSubscriptionStatus(subscriptionId: string, status: 'active' | 'paused' | 'cancelled'): Promise<Subscription | null> {
    await initializeMockData();
    const subIndex = mockSubscriptions!.findIndex(sub => sub.id === subscriptionId);
    if (subIndex > -1) {
        mockSubscriptions![subIndex].status = status;
        const offer = mockDailyOffers!.find(o => o.id === mockSubscriptions![subIndex].offerId);
        mockSubscriptions![subIndex].nextDeliveryDate = (status === 'active' && offer)
            ? new Date(Date.now() + (offer.frequency === 'daily' ? 1 : 7) * 86400000)
            : undefined;
        return Promise.resolve({...mockSubscriptions![subIndex]}); // Return copy
    }
    return Promise.resolve(null);
}

// PROMOTIONS
export async function createPromotion(promotionData: Omit<Promotion, 'id'>): Promise<Promotion> {
    console.log("Creating promotion:", promotionData);
    await initializeMockData();
    const newPromotion: Promotion = {
        id: `promo-${promotionData.storeId}-${uuidv4().substring(0, 6)}`,
        ...promotionData,
    };
    mockPromotions!.push(newPromotion);
    // Also add to the store's promotion list in mockStores
    const storeIndex = mockStores!.findIndex(s => s.id === newPromotion.storeId);
    if (storeIndex > -1) {
        mockStores![storeIndex].promotions.push(newPromotion);
    }
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Promotion created:", newPromotion.name);
            resolve({...newPromotion}); // Return a copy
        }, 100);
    });
}

export async function deletePromotion(promotionId: string): Promise<void> {
    console.log(`MOCK: Deleting promotion ${promotionId}`);
    await initializeMockData();
    await new Promise(resolve => setTimeout(resolve, 300));
    mockPromotions = mockPromotions?.filter(p => p.id !== promotionId) ?? null;
    // Also remove from the store's promotion list
    mockStores?.forEach(store => {
        store.promotions = store.promotions.filter(p => p.id !== promotionId);
    });
}


// ORDERS
// Mock function to get user orders (can keep as is or modify)
export async function getUserOrders(userId: string): Promise<Order[]> {
     console.log(`Fetching orders for user: ${userId}`);
     await initializeMockData();
     const userOrders = mockOrders!.filter(o => o.userId === userId);
     return new Promise((resolve) => {
        setTimeout(() => {
             console.log(`Orders fetched for user ${userId}:`, userOrders.length);
             resolve(userOrders.sort((a,b) => b.orderDate.getTime() - a.orderDate.getTime()).map(o => ({...o}))); // Return copies
        }, 200); // Faster delay
     });
}

// Mock function to get all orders (for admin)
export async function getAllOrders(): Promise<Order[]> {
    console.log("Fetching all orders...");
    await initializeMockData();
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("All orders fetched:", mockOrders!.length);
            resolve([...mockOrders!].sort((a,b) => b.orderDate.getTime() - a.orderDate.getTime()).map(o => ({...o}))); // Return copies
        }, 300); // Slightly longer delay for all orders
    });
}

// USER PROFILES & ADDRESSES
// Mock function to get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    console.log(`Fetching profile for user: ${userId}`);
    await initializeMockData();
    const profile = mockUserProfiles!.find(p => p.id === userId);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (profile) {
                console.log("User profile fetched:", profile.name);
                resolve({...profile}); // Return copy
            } else {
                 console.log("User profile not found");
                resolve(null);
            }
        }, 100); // Faster delay
    });
}

// Mock function to get all user profiles (for admin)
export async function getAllUserProfiles(): Promise<UserProfile[]> {
    console.log("Fetching all user profiles...");
    await initializeMockData();
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("All user profiles fetched:", mockUserProfiles!.length);
            resolve([...mockUserProfiles!].map(p => ({...p}))); // Return copies
        }, 250);
    });
}

// Mock function to add a new address for a user
export async function addUserAddress(userId: string, addressData: Omit<DeliveryAddress, 'id'>): Promise<UserProfile | null> {
    console.log(`Adding address for user ${userId}:`, addressData);
    await initializeMockData();
    const userIndex = mockUserProfiles!.findIndex(p => p.id === userId);
    if (userIndex === -1) {
        console.error(`User ${userId} not found`);
        return null;
    }

    const newAddress: DeliveryAddress = {
        id: `addr-${uuidv4().substring(0, 8)}`,
        ...addressData,
        isDefault: addressData.isDefault ?? false, // Default to false if not provided
    };

    // Ensure only one default address
    if (newAddress.isDefault) {
        mockUserProfiles![userIndex].addresses.forEach(addr => addr.isDefault = false);
    } else if (mockUserProfiles![userIndex].addresses.length === 0) {
        // If it's the first address, make it default
        newAddress.isDefault = true;
    }

    mockUserProfiles![userIndex].addresses.push(newAddress);
    console.log(`Address added for user ${userId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({...mockUserProfiles![userIndex]}); // Return updated profile copy
        }, 150);
    });
}

// Mock function to update an existing address for a user
export async function updateUserAddress(userId: string, addressId: string, addressData: Partial<Omit<DeliveryAddress, 'id'>>): Promise<UserProfile | null> {
     console.log(`Updating address ${addressId} for user ${userId}:`, addressData);
    await initializeMockData();
    const userIndex = mockUserProfiles!.findIndex(p => p.id === userId);
    if (userIndex === -1) {
        console.error(`User ${userId} not found`);
        return null;
    }
    const addressIndex = mockUserProfiles![userIndex].addresses.findIndex(a => a.id === addressId);
    if (addressIndex === -1) {
        console.error(`Address ${addressId} not found for user ${userId}`);
        return null;
    }

    const updatedAddress = { ...mockUserProfiles![userIndex].addresses[addressIndex], ...addressData };

    // Ensure only one default address
    if (updatedAddress.isDefault) {
        mockUserProfiles![userIndex].addresses.forEach((addr, idx) => {
            if (idx !== addressIndex) addr.isDefault = false;
        });
    } else {
        // Check if we're unsetting the only default address
        const defaultAddressExists = mockUserProfiles![userIndex].addresses.some((addr, idx) => idx !== addressIndex && addr.isDefault);
        if (!defaultAddressExists && mockUserProfiles![userIndex].addresses.length > 1) {
            // If no other default exists, keep this one default (or make the first one default)
            console.warn(`Cannot unset the only default address for user ${userId}. Keeping ${addressId} as default.`);
            updatedAddress.isDefault = true; // Force it back
        }
         else if (!defaultAddressExists && mockUserProfiles![userIndex].addresses.length <= 1) {
             updatedAddress.isDefault = true; // If it's the only address, it must be default
         }
    }


    mockUserProfiles![userIndex].addresses[addressIndex] = updatedAddress;
    console.log(`Address ${addressId} updated for user ${userId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({...mockUserProfiles![userIndex]}); // Return updated profile copy
        }, 150);
    });
}

// Mock function to delete an address for a user
export async function deleteUserAddress(userId: string, addressId: string): Promise<UserProfile | null> {
    console.log(`Deleting address ${addressId} for user ${userId}`);
    await initializeMockData();
    const userIndex = mockUserProfiles!.findIndex(p => p.id === userId);
    if (userIndex === -1) {
        console.error(`User ${userId} not found`);
        return null;
    }
    const addressToDelete = mockUserProfiles![userIndex].addresses.find(a => a.id === addressId);
    if (!addressToDelete) {
        console.error(`Address ${addressId} not found for user ${userId}`);
        return null;
    }

    // Prevent deleting the only address or the default address if others exist
    if (mockUserProfiles![userIndex].addresses.length === 1) {
        console.error("Cannot delete the only address.");
        return mockUserProfiles![userIndex]; // Return current profile without changes
    }
    if (addressToDelete.isDefault) {
        console.error("Cannot delete the default address. Set another address as default first.");
         // Find the first non-default address and make it default
        const newDefaultIndex = mockUserProfiles![userIndex].addresses.findIndex(a => a.id !== addressId);
        if (newDefaultIndex > -1) {
            mockUserProfiles![userIndex].addresses[newDefaultIndex].isDefault = true;
            console.log(`Set ${mockUserProfiles![userIndex].addresses[newDefaultIndex].id} as new default.`);
        } else {
             console.error("Error: Could not find another address to set as default.");
             return mockUserProfiles![userIndex]; // Return current profile without changes
        }
    }


    mockUserProfiles![userIndex].addresses = mockUserProfiles![userIndex].addresses.filter(a => a.id !== addressId);
    console.log(`Address ${addressId} deleted for user ${userId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({...mockUserProfiles![userIndex]}); // Return updated profile copy
        }, 150);
    });
}



// --- Mock Delete Functions (Placeholder) ---
export async function deleteStore(storeId: string): Promise<void> {
  console.log(`MOCK: Deleting store ${storeId}`);
  await initializeMockData();
  await new Promise(resolve => setTimeout(resolve, 400));
   // Remove from mock data (won't persist)
   mockStores = mockStores?.filter(s => s.id !== storeId) ?? null;
   mockProducts = mockProducts?.filter(p => p.storeId !== storeId) ?? null;
   mockDailyOffers = mockDailyOffers?.filter(o => o.storeId !== storeId) ?? null;
   mockPromotions = mockPromotions?.filter(promo => promo.storeId !== storeId) ?? null;
   mockOrders = mockOrders?.filter(o => o.storeId !== storeId) ?? null;
   mockSubscriptions = mockSubscriptions?.filter(s => s.storeId !== storeId) ?? null;
}

export async function deleteProduct(productId: string): Promise<void> {
  console.log(`MOCK: Deleting product ${productId}`);
   await initializeMockData();
  await new Promise(resolve => setTimeout(resolve, 300));
   // Remove from mock data
   const productToDelete = mockProducts?.find(p => p.id === productId);
   mockProducts = mockProducts?.filter(p => p.id !== productId) ?? null;
    // Also remove from the store's product list
    if (productToDelete && productToDelete.storeId) {
        const storeIndex = mockStores!.findIndex(s => s.id === productToDelete.storeId);
        if (storeIndex > -1) {
            mockStores![storeIndex].products = mockStores![storeIndex].products.filter(p => p.id !== productId);
        }
    }
    // TODO: Also remove from daily offers? This might be complex.
    mockDailyOffers?.forEach(offer => {
        offer.items = offer.items.filter(item => item.productId !== productId);
    });
    // Filter out offers that might now be empty
    mockDailyOffers = mockDailyOffers?.filter(offer => offer.items.length > 0) ?? null;
     // Also remove from promotions if scope is specific_products
    mockPromotions?.forEach(promo => {
        if (promo.scope === 'specific_products' && promo.applicableIds) {
            promo.applicableIds = promo.applicableIds.filter(id => id !== productId);
        }
    });
    // Optionally remove promotions that no longer apply to any products
    // mockPromotions = mockPromotions?.filter(promo => !(promo.scope === 'specific_products' && promo.applicableIds?.length === 0)) ?? null;


}

export async function deleteDailyOffer(offerId: string): Promise<void> {
  console.log(`MOCK: Deleting offer ${offerId}`);
   await initializeMockData();
  await new Promise(resolve => setTimeout(resolve, 300));
   // Remove from mock data
   const offerToDelete = mockDailyOffers?.find(o => o.id === offerId);
   mockDailyOffers = mockDailyOffers?.filter(o => o.id !== offerId) ?? null;
   // Also remove from the store's offer list
   if (offerToDelete && offerToDelete.storeId) {
        const storeIndex = mockStores!.findIndex(s => s.id === offerToDelete.storeId);
        if (storeIndex > -1) {
            mockStores![storeIndex].dailyOffers = mockStores![storeIndex].dailyOffers.filter(o => o.id !== offerId);
        }
    }
   // TODO: Cancel related subscriptions?
   mockSubscriptions?.forEach(sub => {
       if (sub.offerId === offerId) {
           sub.status = 'cancelled';
       }
   });
   // mockSubscriptions = mockSubscriptions?.filter(s => s.offerId !== offerId) ?? null; // Don't delete, just cancel
}

// Helper to format currency (Keep this if used elsewhere, or ensure it's available via lib/utils)
const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};
