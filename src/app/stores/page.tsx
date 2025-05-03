
"use client";

import {useState, useEffect} from 'react';
import {NewStoreForm} from "@/components/NewStoreForm";
import {Button} from "@/components/ui/button";

export default function StoresPage() {
  const [userStores, setUserStores] = useState<string[]>([]);
  const [showNewStoreForm, setShowNewStoreForm] = useState(false);

  // In a real app, you'd get the userId from authentication context
  const userId = "user123"; // Hardcoded for demonstration

  const handleStoreCreated = (storeName: string) => {
    setUserStores([...userStores, storeName]);
    setShowNewStoreForm(false);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Your Stores</h1>

      <Button onClick={() => setShowNewStoreForm(true)} className="mb-4">
        Create New Store
      </Button>

      {showNewStoreForm && (
        <div className="mb-6">
          <NewStoreForm onStoreCreated={handleStoreCreated} userId={userId}/>
        </div>
      )}

      {userStores.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Stores:</h2>
          <ul>
            {userStores.map((storeName, index) => (
              <li key={index}>{storeName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
