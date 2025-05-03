
export type StoreCategory = 'electronics' | 'clothing' | 'groceries' | 'books' | 'home goods' | 'toys';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string; // e.g., 'laptops', 'shirts', 'vegetables'
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

// Mock function to simulate fetching stores
export async function getStores(): Promise<Store[]> {
  console.log("Fetching stores...");
  return new Promise((resolve) => {
    setTimeout(() => {
      const fakeStores: Store[] = [
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
      console.log("Stores fetched:", fakeStores.length);
      resolve(fakeStores);
    }, 1000); // Simulate network delay
  });
}

// Mock function to simulate fetching a single store's details (including products)
export async function getStoreById(storeId: string): Promise<Store | null> {
     console.log(`Fetching store by ID: ${storeId}`);
    // First, get all stores (in a real app, you'd query the specific store)
     const allStores = await getStores();
     const store = allStores.find(s => s.id === storeId);

     if (!store) {
        console.log("Store not found");
        return null;
     }

     // Simulate fetching products for this specific store
     return new Promise((resolve) => {
        setTimeout(() => {
            const fakeProducts: Product[] = generateMockProducts(store.category, 15); // Generate 15 products
            const storeWithProducts = { ...store, products: fakeProducts };
            console.log("Store details fetched:", storeWithProducts.name);
             resolve(storeWithProducts);
        }, 500); // Shorter delay for product fetching simulation
     });
}

// Helper to generate mock products based on category
function generateMockProducts(category: StoreCategory, count: number): Product[] {
    const products: Product[] = [];
    const baseNames: Record<StoreCategory, string[]> = {
        electronics: ["Laptop", "Smartphone", "Headphones", "Monitor", "Keyboard", "Mouse", "Charger", "Tablet"],
        clothing: ["T-Shirt", "Jeans", "Jacket", "Dress", "Sweater", "Shoes", "Hat", "Scarf"],
        groceries: ["Apple", "Banana", "Milk", "Bread", "Eggs", "Cheese", "Yogurt", "Chicken Breast"],
        books: ["Novel", "Biography", "Cookbook", "History Book", "Sci-Fi Novel", "Mystery Thriller", "Poetry Collection"],
        'home goods': ["Lamp", "Cushion", "Vase", "Picture Frame", "Towel Set", "Cutlery", "Coffee Maker"],
        toys: ["Action Figure", "Building Blocks", "Board Game", "Doll", "Puzzle", "Stuffed Animal", "Toy Car"]
    };
    const adjectives = ["Premium", "Classic", "Modern", "Vintage", "Organic", "Wireless", "Smart", "Cozy", "Durable"];

    for (let i = 1; i <= count; i++) {
        const baseNameList = baseNames[category] || ["Product"];
        const baseName = baseNameList[Math.floor(Math.random() * baseNameList.length)];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const name = `${adjective} ${baseName}`;
        const price = parseFloat((Math.random() * (category === 'electronics' ? 500 : 100) + 10).toFixed(2)); // Random price

        products.push({
            id: `${category}-prod-${i}`,
            name: name,
            description: `A high-quality ${name.toLowerCase()} perfect for your needs. Features include durability and style.`,
            price: price,
            imageUrl: `https://picsum.photos/seed/${category}-${i}/300/200`,
            category: baseName.toLowerCase().replace(' ', '-'), // Simple category based on name
        });
    }
    return products;
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
                    items: [{ productId: 'electronics-prod-1', name: 'Premium Laptop', quantity: 1, price: 1200 }],
                    totalAmount: 1200, orderDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
                    status: 'Shipped', trackingNumber: 'TRK123456789', deliveryAddress: '1 Main St, Anytown'
                },
                {
                    id: 'order-456', userId: userId, storeId: 'store-3', storeName: 'FreshGrocer',
                    items: [
                        { productId: 'groceries-prod-1', name: 'Organic Apple', quantity: 5, price: 0.8 },
                        { productId: 'groceries-prod-3', name: 'Classic Milk', quantity: 1, price: 3.5 },
                    ],
                    totalAmount: 7.5, orderDate: new Date(Date.now() - 86400000 * 1), // 1 day ago
                    status: 'Processing', deliveryAddress: '1 Main St, Anytown'
                },
                 {
                    id: 'order-789', userId: userId, storeId: 'store-2', storeName: 'Fashionista Boutique',
                    items: [{ productId: 'clothing-prod-2', name: 'Modern Jeans', quantity: 1, price: 55 }],
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
                    name: "John Doe",
                    email: "john.doe@example.com",
                    address: "1 Main St, Anytown, USA 12345",
                    phone: "555-123-4567",
                    loyaltyPoints: 150,
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
