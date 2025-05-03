
export type StoreCategory = 'electronics' | 'clothing' | 'groceries' | 'books' | 'home goods' | 'toys';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string; // e.g., 'laptops', 'shirts', 'vegetables'
  storeId?: string; // Optional: Link back to the store
  storeName?: string; // Optional: Denormalized store name
  sales?: number; // Optional: Mock sales data for sorting
}

export interface Store {
  id: string;
  name: string;
  description: string;
  category: StoreCategory;
  imageUrl?: string; // Optional banner image for the store
  products?: Product[]; // Products might be loaded separately or on demand
  rating?: number; // Optional average rating
}

// Mock data store (simulating a database)
let mockStores: Store[] | null = null;
let mockProducts: Product[] | null = null;

function generateMockStores(): Store[] {
     return [
        {
          id: "store-1",
          name: "ElectroMart",
          description: "Your one-stop shop for the latest electronics, gadgets, and accessories.",
          category: "electronics",
          imageUrl: `https://picsum.photos/seed/electromart/400/300`,
           rating: 4.5,
        },
        {
          id: "store-2",
          name: "Fashionista Boutique",
          description: "Trendy clothing and accessories for every style. New arrivals weekly!",
          category: "clothing",
          imageUrl: `https://picsum.photos/seed/fashionista/400/300`,
           rating: 4.2,
        },
        {
          id: "store-3",
          name: "FreshGrocer",
          description: "Quality groceries, fresh produce, and everyday essentials delivered to your door.",
          category: "groceries",
          imageUrl: `https://picsum.photos/seed/freshgrocer/400/300`,
           rating: 4.8,
        },
        {
          id: "store-4",
          name: "The Book Nook",
          description: "Discover your next favorite read. Wide selection of fiction, non-fiction, and more.",
          category: "books",
          imageUrl: `https://picsum.photos/seed/booknook/400/300`,
           rating: 4.6,
        },
        {
          id: "store-5",
          name: "Cozy Home",
          description: "Everything you need to make your house a home. Decor, kitchenware, and bedding.",
          category: "home goods",
          imageUrl: `https://picsum.photos/seed/cozyhome/400/300`,
           rating: 4.3,
        },
         {
          id: "store-6",
          name: "Toy Galaxy",
          description: "Fun and educational toys for kids of all ages. Games, puzzles, and action figures.",
          category: "toys",
          imageUrl: `https://picsum.photos/seed/toygalaxy/400/300`,
          rating: 4.0,
        },
         {
          id: "store-7",
          name: "Gadget Hub",
          description: "Cutting-edge tech and innovative gadgets. Explore the future of technology.",
          category: "electronics",
          imageUrl: `https://picsum.photos/seed/gadgethub/400/300`,
           rating: 4.7,
        },
         {
          id: "store-8",
          name: "Style Threads",
          description: "Affordable and stylish clothing for the whole family.",
          category: "clothing",
          imageUrl: `https://picsum.photos/seed/stylethreads/400/300`,
           rating: 3.9,
        },
      ];
}


// Helper to generate mock products for ALL stores initially
function generateAllMockProducts(stores: Store[]): Product[] {
    let allProducts: Product[] = [];
    stores.forEach(store => {
         const storeProducts = generateMockProductsStore(store.id, store.category, 10 + Math.floor(Math.random() * 15)); // 10-24 products per store
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
        groceries: ["Apple", "Banana", "Milk", "Bread", "Eggs", "Cheese", "Yogurt", "Chicken", "Rice", "Pasta", "Tomatoes"],
        books: ["Novel", "Biography", "Cookbook", "History", "Sci-Fi", "Mystery", "Poetry", "Fantasy", "Self-Help"],
        'home goods': ["Lamp", "Cushion", "Vase", "Frame", "Towel", "Cutlery", "Mug", "Plate", "Candle"],
        toys: ["Action Figure", "Blocks", "Board Game", "Doll", "Puzzle", "Car", "Plush Toy", "Art Set"]
    };
    const adjectives = ["Premium", "Classic", "Modern", "Vintage", "Organic", "Wireless", "Smart", "Cozy", "Durable", "Ergonomic", "Handmade", "Deluxe"];

    for (let i = 1; i <= count; i++) {
        const baseNameList = baseNames[category] || ["Item"];
        const baseName = baseNameList[Math.floor(Math.random() * baseNameList.length)];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const name = `${adj} ${baseName}`;
        const price = parseFloat((Math.random() * (category === 'electronics' ? 400 : 80) + 5).toFixed(2)); // Adjusted price range

        products.push({
            id: `${storeId}-prod-${i}`,
            name: name,
            description: `A high-quality ${name.toLowerCase()} perfect for your needs. Features include durability and style.`,
            price: price,
            imageUrl: `https://picsum.photos/seed/${storeId}-${category}-${i}/300/200`,
            category: baseName.toLowerCase().replace(/\s+/g, '-'), // Simple category based on name
            // sales will be added later if needed globally
        });
    }
    return products;
}

// Initialize mock data on first call
async function initializeMockData() {
    if (!mockStores) {
        mockStores = generateMockStores();
    }
    if (!mockProducts) {
        // Ensure stores are generated first
        if (!mockStores) mockStores = generateMockStores();
        mockProducts = generateAllMockProducts(mockStores);
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

// Mock function to simulate fetching a single store's details (including products)
export async function getStoreById(storeId: string): Promise<Store | null> {
     console.log(`Fetching store by ID: ${storeId}`);
     await initializeMockData();
     const store = mockStores!.find(s => s.id === storeId);

     if (!store) {
        console.log("Store not found");
        return null;
     }

     // Find products for this store from the global list
     const storeProducts = mockProducts!.filter(p => p.storeId === storeId);

     return new Promise((resolve) => {
        setTimeout(() => {
            const storeWithProducts = { ...store, products: storeProducts };
            console.log("Store details fetched:", storeWithProducts.name);
             resolve(storeWithProducts);
        }, 150); // Shorter delay
     });
}

// Mock function to get products (e.g., best sellers across all stores)
interface GetProductsOptions {
    limit?: number;
    sortBy?: 'sales' | 'rating' | 'price_asc' | 'price_desc'; // Add more sorting options
    category?: string; // Filter by product category
}
export async function getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
    console.log("Fetching products with options:", options);
    await initializeMockData();

    let filteredProducts = [...mockProducts!]; // Start with a copy

    // Apply filtering (example: by product category - could be added later)
    // if (options.category) {
    //     filteredProducts = filteredProducts.filter(p => p.category === options.category);
    // }

    // Apply sorting
    if (options.sortBy === 'sales') {
        filteredProducts.sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0));
    }
     // Add other sorting logic here if needed (rating, price)

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
     return new Promise((resolve) => {
        setTimeout(() => {
            // In a real app, fetch from database based on userId
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
                }
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
}

// Mock function to get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    console.log(`Fetching profile for user: ${userId}`);
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
