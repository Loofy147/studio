
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
  storeId?: string; // Optional: Link back to the store
  storeName?: string; // Optional: Denormalized store name
  sales?: number; // Optional: Mock sales count
  // Add specific fields if needed, e.g., ingredients for restaurants
  ingredients?: string[]; // Example for restaurants/groceries
  size?: string; // Example for clothing/coffee
}

export interface Store {
  id: string;
  name: string;
  description: string;
  category: StoreCategory;
  imageUrl?: string; // Optional banner image for the store
  products?: Product[]; // Products might be loaded separately or on demand
  rating?: number; // Optional average rating
  ownerId?: string; // Link to the user who owns the store
  dailyOffers?: DailyOffer[]; // Specific offers for this store
  // Add store-specific details if needed
  openingHours?: string; // Example for restaurants/shops
  address?: string; // Example for physical locations
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


// Mock data store (simulating a database)
let mockStores: Store[] | null = null;
let mockProducts: Product[] | null = null;
let mockDailyOffers: DailyOffer[] | null = null;
let mockSubscriptions: Subscription[] | null = null;


function generateMockStores(): Store[] {
     return [
        // Existing stores...
        {
          id: "store-1", name: "ElectroMart", description: "Your one-stop shop for the latest electronics.", category: "electronics",
          imageUrl: `https://picsum.photos/seed/electromart/400/300`, rating: 4.5,
        },
        {
          id: "store-2", name: "Fashionista Boutique", description: "Trendy clothing and accessories.", category: "clothing",
          imageUrl: `https://picsum.photos/seed/fashionista/400/300`, rating: 4.2,
        },
        {
          id: "store-3", name: "FreshGrocer", description: "Quality groceries and fresh produce.", category: "groceries",
          imageUrl: `https://picsum.photos/seed/freshgrocer/400/300`, rating: 4.8, openingHours: "7 AM - 9 PM", address: "100 Grocery Lane"
        },
        {
          id: "store-4", name: "The Book Nook", description: "Discover your next favorite read.", category: "books",
          imageUrl: `https://picsum.photos/seed/booknook/400/300`, rating: 4.6,
        },
        {
          id: "store-5", name: "Cozy Home", description: "Everything for your home.", category: "home goods",
          imageUrl: `https://picsum.photos/seed/cozyhome/400/300`, rating: 4.3,
        },
        {
          id: "store-6", name: "Toy Galaxy", description: "Fun and educational toys.", category: "toys",
          imageUrl: `https://picsum.photos/seed/toygalaxy/400/300`, rating: 4.0,
        },
        {
          id: "store-7", name: "Gadget Hub", description: "Cutting-edge tech.", category: "electronics",
          imageUrl: `https://picsum.photos/seed/gadgethub/400/300`, rating: 4.7,
        },
        {
          id: "store-8", name: "Style Threads", description: "Affordable and stylish clothing.", category: "clothing",
          imageUrl: `https://picsum.photos/seed/stylethreads/400/300`, rating: 3.9,
        },
        // New stores with relevant categories
        {
            id: "store-9", name: "The Daily Grind", description: "Artisan coffee, pastries, and light bites.", category: "coffee shops",
            imageUrl: `https://picsum.photos/seed/dailygrind/400/300`, rating: 4.9, openingHours: "6 AM - 6 PM", address: "25 Coffee Bean Blvd"
        },
        {
            id: "store-10", name: "Mama Mia Pizzeria", description: "Authentic Italian pizza and pasta dishes.", category: "restaurants",
            imageUrl: `https://picsum.photos/seed/mamamia/400/300`, rating: 4.5, openingHours: "11 AM - 10 PM", address: "50 Pizza Plaza"
        },
        {
            id: "store-11", name: "GreenBasket Organics", description: "Certified organic fruits, vegetables, and pantry staples.", category: "groceries",
            imageUrl: `https://picsum.photos/seed/greenbasket/400/300`, rating: 4.7, openingHours: "8 AM - 8 PM", address: "75 Organic Way"
        }
      ];
}


// Helper to generate mock products for ALL stores initially
function generateAllMockProducts(stores: Store[]): Product[] {
    let allProducts: Product[] = [];
    stores.forEach(store => {
        // Generate a realistic number of products based on category
        let count = 10 + Math.floor(Math.random() * 15); // Default: 10-24
        if (store.category === 'groceries') count = 30 + Math.floor(Math.random() * 40); // Groceries: 30-70
        if (store.category === 'restaurants') count = 15 + Math.floor(Math.random() * 20); // Restaurants: 15-35
        if (store.category === 'coffee shops') count = 10 + Math.floor(Math.random() * 10); // Coffee: 10-20

         const storeProducts = generateMockProductsStore(store.id, store.category, count);
         // Add store info to each product
         storeProducts.forEach(p => {
             p.storeId = store.id;
             p.storeName = store.name;
             p.sales = Math.floor(Math.random() * 500); // Assign random sales count
         });
         allProducts = allProducts.concat(storeProducts);
    });
    return allProducts;
}

// Helper to generate mock products for a specific store/category
function generateMockProductsStore(storeId: string, category: StoreCategory, count: number): Product[] {
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

        const product: Product = {
            id: `${storeId}-prod-${i}`,
            name: name,
            description: `A ${name.toLowerCase()}. ${category === 'restaurants' ? 'Delicious and freshly prepared.' : category === 'groceries' ? 'High-quality ingredient.' : 'Perfect for your needs.' }`,
            price: price,
            imageUrl: `https://picsum.photos/seed/${storeId}-${name.replace(/\s+/g, '-')}-${i}/300/200`,
            category: baseName.toLowerCase().replace(/\s+/g, '-'),
            // Add specific fields based on category
            ...(category === 'restaurants' && { ingredients: ['Flour', 'Tomato', 'Cheese'] }), // Example
            ...(category === 'clothing' && { size: ['S', 'M', 'L'][Math.floor(Math.random() * 3)] }), // Example
            ...(category === 'coffee shops' && { size: ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)] }), // Example
        };
        products.push(product);
    }
    return products;
}

// Helper to generate mock daily offers for eligible stores
function generateMockDailyOffers(stores: Store[], products: Product[]): DailyOffer[] {
    const offers: DailyOffer[] = [];
    const eligibleStores = stores.filter(s => dailyOfferEligibleCategories.includes(s.category));

    eligibleStores.forEach(store => {
        const storeProducts = products.filter(p => p.storeId === store.id);
        if (storeProducts.length < 3) return; // Need some products to make an offer

        // Create 1-2 offers per eligible store
        for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
             const isWeekly = Math.random() > 0.7; // ~30% chance of weekly offer
             const offerType = store.category === 'restaurants' ? 'Meal Deal' : store.category === 'groceries' ? 'Produce Box' : 'Coffee Combo';
             const offerName = `${isWeekly ? 'Weekly' : 'Daily'} ${offerType} ${i+1}`;
             const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per offer
             const offerItems: DailyOffer['items'] = [];
             let offerPrice = 0;

             for (let j=0; j<numItems; j++) {
                const product = storeProducts[Math.floor(Math.random() * storeProducts.length)];
                 const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity per item
                 offerItems.push({ productId: product.id, quantity: quantity });
                 offerPrice += product.price * quantity;
             }

             // Discount the offer price slightly
            offerPrice *= (0.8 + Math.random() * 0.15); // 80-95% of original price

            offers.push({
                id: `offer-${store.id}-${i}`,
                storeId: store.id,
                name: offerName,
                description: `Get your ${offerName.toLowerCase()} delivered ${isWeekly ? 'weekly' : 'daily'}. Includes selected items from ${store.name}.`,
                items: offerItems,
                price: parseFloat(offerPrice.toFixed(2)),
                frequency: isWeekly ? 'weekly' : 'daily',
                isActive: Math.random() > 0.2, // ~80% active
                imageUrl: `https://picsum.photos/seed/offer-${store.id}-${i}/300/200`
            });
        }
    });
    return offers;
}

// Helper to generate mock subscriptions for a user
function generateMockSubscriptions(userId: string, offers: DailyOffer[], stores: Store[]): Subscription[] {
    const subscriptions: Subscription[] = [];
    const numSubscriptions = Math.floor(Math.random() * 3); // 0-2 subscriptions per user

    for (let i = 0; i < numSubscriptions; i++) {
        const offer = offers[Math.floor(Math.random() * offers.length)];
        if (!offer) continue;
        const store = stores.find(s => s.id === offer.storeId);
        if (!store) continue;

        const startDate = new Date(Date.now() - (Math.random() * 30 * 86400000)); // Start date within last 30 days
        const statusOptions: Subscription['status'][] = ['active', 'paused', 'cancelled'];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

        subscriptions.push({
            id: `sub-${userId}-${i}`,
            userId: userId,
            offerId: offer.id,
            storeId: offer.storeId,
            storeName: store.name,
            offerName: offer.name,
            startDate: startDate,
            status: status,
            nextDeliveryDate: status === 'active' ? new Date(Date.now() + (offer.frequency === 'daily' ? 1 : 7) * 86400000 * Math.random()) : undefined,
        });
    }
    return subscriptions;
}


// Initialize mock data on first call
async function initializeMockData() {
    // Initialize stores if not already done
    if (!mockStores) {
        mockStores = generateMockStores();
    }
    // Initialize products if not already done, depends on stores
    if (!mockProducts) {
        if (!mockStores) mockStores = generateMockStores(); // Ensure stores exist
        mockProducts = generateAllMockProducts(mockStores);
    }
    // Initialize daily offers if not already done, depends on stores and products
    if (!mockDailyOffers) {
        if (!mockStores) mockStores = generateMockStores();
        if (!mockProducts) mockProducts = generateAllMockProducts(mockStores);
        mockDailyOffers = generateMockDailyOffers(mockStores, mockProducts);
        // Link offers back to stores
        mockStores.forEach(store => {
            store.dailyOffers = mockDailyOffers!.filter(offer => offer.storeId === store.id);
        });
    }
    // Initialize subscriptions (can be done per user request, but mock some initially for demo)
    if (!mockSubscriptions) {
        if (!mockDailyOffers) { // Ensure offers exist first
            if (!mockStores) mockStores = generateMockStores();
            if (!mockProducts) mockProducts = generateAllMockProducts(mockStores);
            mockDailyOffers = generateMockDailyOffers(mockStores, mockProducts);
        }
        mockSubscriptions = generateMockSubscriptions("user123", mockDailyOffers, mockStores!); // Mock for default user
    }
}


// Mock function to simulate fetching stores
export async function getStores(): Promise<Store[]> {
  console.log("Fetching stores...");
  await initializeMockData();
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Stores fetched:", mockStores!.length);
      resolve([...mockStores!]); // Return a copy
    }, 300); // Simulate network delay
  });
}

// Mock function to simulate fetching a single store's details (including products and offers)
export async function getStoreById(storeId: string): Promise<Store | null> {
     console.log(`Fetching store by ID: ${storeId}`);
     await initializeMockData();
     const store = mockStores!.find(s => s.id === storeId);

     if (!store) {
        console.log("Store not found");
        return null;
     }

     // Find products and offers for this store from the global lists
     const storeProducts = mockProducts!.filter(p => p.storeId === storeId);
     const storeOffers = mockDailyOffers!.filter(o => o.storeId === storeId);

     return new Promise((resolve) => {
        setTimeout(() => {
            const storeWithDetails = {
                ...store,
                products: storeProducts,
                dailyOffers: storeOffers // Ensure offers are included
            };
            console.log("Store details fetched:", storeWithDetails.name, "Products:", storeProducts.length, "Offers:", storeOffers.length);
             resolve(storeWithDetails);
        }, 150); // Shorter delay
     });
}

// Mock function to get products (e.g., best sellers across all stores)
interface GetProductsOptions {
    limit?: number;
    sortBy?: 'sales' | 'rating' | 'price_asc' | 'price_desc'; // Add more sorting options
    category?: string; // Filter by product category (e.g., 'laptops', 'shirts')
    storeId?: string; // Filter by store ID
}
export async function getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
    console.log("Fetching products with options:", options);
    await initializeMockData();

    let filteredProducts = [...mockProducts!]; // Start with a copy

    // Apply store filtering first
    if (options.storeId) {
        filteredProducts = filteredProducts.filter(p => p.storeId === options.storeId);
    }

    // Apply category filtering
    if (options.category && options.category !== 'all') { // Assuming 'all' means no category filter
        filteredProducts = filteredProducts.filter(p => p.category === options.category);
    }

    // Apply sorting
    if (options.sortBy === 'sales') {
        filteredProducts.sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0));
    } else if (options.sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (options.sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }
     // Add rating sort if needed

    // Apply limit
    if (options.limit) {
        filteredProducts = filteredProducts.slice(0, options.limit);
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Products fetched:", filteredProducts.length);
            resolve(filteredProducts);
        }, 200); // Simulate delay
    });
}

// Function to create a new store
export async function createStore(storeData: Omit<Store, 'id' | 'products' | 'dailyOffers'>, ownerId: string): Promise<Store> {
  console.log("Creating store:", storeData);
  await initializeMockData();

  const newStore: Store = {
    id: uuidv4(), // Generate a unique ID
    products: [], // Initialize with empty arrays
    dailyOffers: [],
    ...storeData,
    ownerId: ownerId,
  };

  mockStores!.push(newStore); // Add to mock store

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Store created:", newStore.name);
      resolve(newStore);
    }, 200);
  });
}

// Function to create a new product
export async function createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    console.log("Creating product:", productData);
    await initializeMockData();

    const newProduct: Product = {
        id: uuidv4(), // Generate a unique ID
        sales: 0, // Initialize sales
        ...productData,
    };

    mockProducts!.push(newProduct);

    // Update the store's product list if storeId is present
    const storeIndex = mockStores!.findIndex(s => s.id === newProduct.storeId);
    if (storeIndex > -1) {
        mockStores![storeIndex].products?.push(newProduct);
    }


    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Product created:", newProduct.name);
            resolve(newProduct);
        }, 200);
    });
}

// --- Daily Offer and Subscription Functions ---

// Function to get daily offers for a specific store
export async function getStoreDailyOffers(storeId: string): Promise<DailyOffer[]> {
    console.log(`Fetching daily offers for store: ${storeId}`);
    await initializeMockData();
    const offers = mockDailyOffers!.filter(o => o.storeId === storeId && o.isActive);
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Offers fetched for store ${storeId}:`, offers.length);
            resolve(offers);
        }, 150);
    });
}

// Function to create a new daily offer (for store owners)
export async function createDailyOffer(offerData: Omit<DailyOffer, 'id'>): Promise<DailyOffer> {
    console.log("Creating daily offer:", offerData);
    await initializeMockData();
    const newOffer: DailyOffer = {
        id: uuidv4(),
        ...offerData,
    };
    mockDailyOffers!.push(newOffer);
     // Update the store's offer list
    const storeIndex = mockStores!.findIndex(s => s.id === newOffer.storeId);
    if (storeIndex > -1) {
        mockStores![storeIndex].dailyOffers?.push(newOffer);
    }
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Daily offer created:", newOffer.name);
            resolve(newOffer);
        }, 200);
    });
}

// Function for a user to subscribe to an offer
export async function createSubscription(userId: string, offerId: string): Promise<Subscription> {
    console.log(`User ${userId} subscribing to offer ${offerId}`);
    await initializeMockData();

    const offer = mockDailyOffers!.find(o => o.id === offerId);
    const store = mockStores!.find(s => s.id === offer?.storeId);

    if (!offer || !store || !offer.isActive) {
        throw new Error("Offer not available for subscription.");
    }

    const newSubscription: Subscription = {
        id: uuidv4(),
        userId: userId,
        offerId: offer.id,
        storeId: store.id,
        storeName: store.name,
        offerName: offer.name,
        startDate: new Date(),
        status: 'active',
        nextDeliveryDate: new Date(Date.now() + (offer.frequency === 'daily' ? 1 : 7) * 86400000)
    };

    mockSubscriptions!.push(newSubscription);

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Subscription created:", newSubscription.id);
            resolve(newSubscription);
        }, 250);
    });
}

// Function to get a user's subscriptions
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
    console.log(`Fetching subscriptions for user: ${userId}`);
    await initializeMockData();
    const userSubs = mockSubscriptions!.filter(sub => sub.userId === userId);
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Subscriptions fetched for user ${userId}:`, userSubs.length);
            resolve(userSubs);
        }, 300);
    });
}

// Function to update subscription status (pause, cancel)
export async function updateSubscriptionStatus(subscriptionId: string, status: 'active' | 'paused' | 'cancelled'): Promise<Subscription | null> {
    console.log(`Updating subscription ${subscriptionId} to status ${status}`);
    await initializeMockData();
    const subIndex = mockSubscriptions!.findIndex(sub => sub.id === subscriptionId);
    if (subIndex > -1) {
        mockSubscriptions![subIndex].status = status;
        // Clear next delivery date if not active
        if (status !== 'active') {
            mockSubscriptions![subIndex].nextDeliveryDate = undefined;
        } else {
            // Optional: Recalculate next delivery if reactivating
             const offer = mockDailyOffers!.find(o => o.id === mockSubscriptions![subIndex].offerId);
             if(offer) mockSubscriptions![subIndex].nextDeliveryDate = new Date(Date.now() + (offer.frequency === 'daily' ? 1 : 7) * 86400000);
        }
         return new Promise((resolve) => {
            setTimeout(() => {
                console.log("Subscription status updated");
                resolve(mockSubscriptions![subIndex]);
            }, 100);
         });
    }
    return Promise.resolve(null);
}

// --- End Offer/Subscription Functions ---


// Interface and function for user orders (placeholder)
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
    deliveryAddress: string;
}

// Mock function to get user orders
export async function getUserOrders(userId: string): Promise<Order[]> {
     console.log(`Fetching orders for user: ${userId}`);
     await initializeMockData(); // Ensure data is loaded
     return new Promise((resolve) => {
        setTimeout(() => {
            // In a real app, fetch from database based on userId
            // Let's generate some orders based on available products/stores if none exist
            const fakeOrders: Order[] = [
                 {
                    id: 'order-123', userId: userId, storeId: 'store-1', storeName: 'ElectroMart',
                    items: [{ productId: 'store-1-prod-1', name: 'Premium Laptop', quantity: 1, price: 1200 }],
                    totalAmount: 1200, orderDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
                    status: 'Shipped', trackingNumber: 'TRK123456789', deliveryAddress: '1 Main St, Anytown'
                },
                {
                    id: 'order-456', userId: userId, storeId: 'store-3', storeName: 'FreshGrocer',
                    items: [
                        { productId: 'store-3-prod-1', name: 'Organic Apple', quantity: 5, price: 0.8 },
                        { productId: 'store-3-prod-3', name: 'Classic Milk', quantity: 1, price: 3.5 },
                    ],
                    totalAmount: 7.5, orderDate: new Date(Date.now() - 86400000 * 1), // 1 day ago
                    status: 'Processing', deliveryAddress: '1 Main St, Anytown'
                },
                 {
                    id: 'order-789', userId: userId, storeId: 'store-2', storeName: 'Fashionista Boutique',
                    items: [{ productId: 'store-2-prod-2', name: 'Modern Jeans', quantity: 1, price: 55 }],
                    totalAmount: 55, orderDate: new Date(Date.now() - 86400000 * 5), // 5 days ago
                    status: 'Delivered', deliveryAddress: '1 Main St, Anytown'
                },
                 { // Order from a restaurant
                    id: 'order-101', userId: userId, storeId: 'store-10', storeName: 'Mama Mia Pizzeria',
                    items: [
                        { productId: 'store-10-prod-1', name: 'Gourmet Margherita Pizza', quantity: 1, price: 15.50 },
                        { productId: 'store-10-prod-3', name: 'Classic Caesar Salad', quantity: 1, price: 8.00 }
                    ],
                    totalAmount: 23.50, orderDate: new Date(Date.now() - 86400000 * 0.5), // 12 hours ago
                    status: 'Pending', deliveryAddress: '1 Main St, Anytown'
                 },
            ];
             console.log(`Orders fetched for user ${userId}:`, fakeOrders.length);
             resolve(fakeOrders);
        }, 800);
     });
}


// Interface and function for user profile (placeholder)
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    address?: string;
    phone?: string;
    loyaltyPoints: number;
    // Consider adding user's subscriptions here or fetching separately
    // subscriptions?: Subscription[];
}

// Mock function to get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    console.log(`Fetching profile for user: ${userId}`);
    await initializeMockData(); // Ensure data is loaded
    return new Promise((resolve) => {
        setTimeout(() => {
            // In a real app, fetch from database based on userId
            if (userId === "user123") { // Simulate finding a user
                 const profile: UserProfile = {
                    id: userId,
                    name: "Alex Ryder", // Changed name
                    email: "alex.ryder@example.com", // Changed email
                    address: "123 Market St, Suite 400, Metropia, USA 54321", // Changed address
                    phone: "555-987-6543", // Changed phone
                    loyaltyPoints: 285, // Changed points
                };
                console.log("User profile fetched:", profile.name);
                resolve(profile);
            } else {
                 console.log("User profile not found");
                resolve(null); // User not found
            }
        }, 600);
    });
}
