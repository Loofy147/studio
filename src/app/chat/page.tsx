
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile, getUserProfile, getFriendProfiles } from "@/services/store"; // Assuming these exist
import { SendHorizonal, Paperclip, Phone, Video, UserPlus, Search, ShoppingBag } from 'lucide-react'; // Added ShoppingBag
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils'; // Import formatCurrency
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import Image from 'next/image'; // Import Image

// Mock message structure
interface Message {
    id: string;
    senderId: string; // 'user123' or friend's ID
    receiverId: string;
    content: string;
    timestamp: Date;
    type: 'text' | 'product'; // Add message type
    productDetails?: { // Optional details for product messages
        productId: string;
        name: string;
        price: number;
        imageUrl?: string;
        storeId: string;
    };
}

// Mock function to get messages between two users (replace with real API/WebSocket)
async function getMessages(userId1: string, userId2: string): Promise<Message[]> {
    console.log(`Fetching messages between ${userId1} and ${userId2}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    // Generate mock messages
    const messages: Message[] = [];
    const now = Date.now();
    for (let i = 10; i > 0; i--) {
         const sender = Math.random() > 0.5 ? userId1 : userId2;
         const receiver = sender === userId1 ? userId2 : userId1;
         const isProduct = Math.random() < 0.15; // 15% chance of being a product message

        messages.push({
            id: `msg-${i}-${uuidv4().substring(0,4)}`,
            senderId: sender,
            receiverId: receiver,
            timestamp: new Date(now - i * 5 * 60000), // Messages every 5 mins
            type: isProduct ? 'product' : 'text',
            content: isProduct ? `Check out this product!` : `This is mock message ${11 - i} between users.`,
             productDetails: isProduct ? {
                 productId: `prod-mock-${i}`,
                 name: `Awesome Gadget ${i}`,
                 price: 19.99 + i * 5,
                 imageUrl: `https://picsum.photos/seed/prod-mock-${i}/100/100`,
                 storeId: 'store-mock-1'
             } : undefined,
        });
    }
    return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

// Mock function to send a message
async function sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
     console.log("Sending message:", message.content);
     await new Promise(resolve => setTimeout(resolve, 150)); // Simulate send delay
     const newMessage: Message = {
        ...message,
        id: `msg-new-${uuidv4().substring(0, 4)}`,
        timestamp: new Date(),
     };
     return newMessage;
}

// Helper function (replace with real uuid if needed)
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default function ChatPage() {
    const userId = "user123"; // Hardcoded current user ID
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingFriends, setIsLoadingFriends] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref for scrolling

    // Fetch friends list
    useEffect(() => {
        const fetchFriends = async () => {
            setIsLoadingFriends(true);
            try {
                 const userProfile = await getUserProfile(userId);
                 if (userProfile?.friendIds && userProfile.friendIds.length > 0) {
                    const friendProfiles = await getFriendProfiles(userProfile.friendIds);
                    setFriends(friendProfiles);
                    // TODO: Pre-select friend if passed via query param (e.g., ?user=friendId)
                 } else {
                    setFriends([]);
                 }
            } catch (error) {
                console.error("Failed to fetch friends:", error);
                // Handle error (e.g., show toast)
            } finally {
                setIsLoadingFriends(false);
            }
        };
        fetchFriends();
    }, [userId]);

    // Fetch messages when a friend is selected
    useEffect(() => {
        if (selectedFriend) {
            const fetchMessages = async () => {
                setIsLoadingMessages(true);
                setMessages([]); // Clear previous messages
                try {
                    const fetchedMessages = await getMessages(userId, selectedFriend.id);
                    setMessages(fetchedMessages);
                } catch (error) {
                    console.error("Failed to fetch messages:", error);
                    // Handle error
                } finally {
                    setIsLoadingMessages(false);
                }
            };
            fetchMessages();
        }
    }, [selectedFriend, userId]);

     // Scroll to bottom when messages load or new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSelectFriend = (friend: UserProfile) => {
        setSelectedFriend(friend);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedFriend || isSending) return;

        setIsSending(true);
        const messageData: Omit<Message, 'id' | 'timestamp'> = {
            senderId: userId,
            receiverId: selectedFriend.id,
            content: newMessage,
            type: 'text', // Default to text
        };

         // Optimistic UI update
         const optimisticMessage: Message = {
             ...messageData,
             id: `temp-${uuidv4()}`,
             timestamp: new Date(),
         }
         setMessages(prev => [...prev, optimisticMessage]);
         setNewMessage(''); // Clear input immediately

        try {
            const sentMessage = await sendMessage(messageData);
             // Replace optimistic message with actual message from server
             setMessages(prev => prev.map(msg => msg.id === optimisticMessage.id ? sentMessage : msg));
        } catch (error) {
            console.error("Failed to send message:", error);
            // Revert optimistic update or show error indicator
             setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
             setNewMessage(messageData.content); // Put message back in input
            // Show error toast
        } finally {
            setIsSending(false);
        }
    };

    // --- Placeholder Components ---
    const FriendListSkeleton = () => (
        <div className="space-y-2 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-md">
                    <Skeleton className="h-10 w-10 rounded-full bg-muted/50" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24 bg-muted/50" />
                        <Skeleton className="h-3 w-16 bg-muted/50" />
                    </div>
                </div>
            ))}
        </div>
    );

     const MessageSkeleton = () => (
        <div className="flex items-start gap-3 p-3 animate-pulse">
            <Skeleton className="h-9 w-9 rounded-full bg-muted/50"/>
            <div className="flex-1 space-y-1.5 mt-1">
                <Skeleton className="h-4 w-20 bg-muted/50"/>
                <Skeleton className="h-8 w-48 rounded-md bg-muted/50"/>
            </div>
        </div>
     )

    return (
        <div className="container mx-auto h-[calc(100vh-4rem)] flex border rounded-lg shadow-lg overflow-hidden my-4 bg-card"> {/* Use card bg */}
            {/* Sidebar: Friend List */}
            <aside className="w-1/4 min-w-[250px] max-w-[320px] border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" /> Friends & Chats
                    </h2>
                     {/* Optional Search */}
                     {/* <div className="relative mt-3">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search friends..." className="pl-8 h-9" />
                     </div> */}
                </div>
                <ScrollArea className="flex-grow">
                    {isLoadingFriends ? <FriendListSkeleton /> : friends.length > 0 ? (
                        friends.map(friend => (
                            <Button
                                key={friend.id}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start h-auto py-3 px-4 rounded-none",
                                    selectedFriend?.id === friend.id && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => handleSelectFriend(friend)}
                            >
                                <Avatar className="h-10 w-10 mr-3">
                                    <AvatarImage src={`https://avatar.vercel.sh/${friend.email}?size=40`} alt={friend.name} />
                                    <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="text-left overflow-hidden">
                                    <p className="font-medium truncate">{friend.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{friend.email}</p>
                                    {/* Add online status indicator later */}
                                </div>
                            </Button>
                        ))
                    ) : (
                         <p className="p-4 text-sm text-muted-foreground text-center">No friends found.</p>
                    )}
                </ScrollArea>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col">
                {selectedFriend ? (
                    <>
                        {/* Chat Header */}
                        <header className="p-4 border-b flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                     <AvatarImage src={`https://avatar.vercel.sh/${selectedFriend.email}?size=40`} alt={selectedFriend.name} />
                                     <AvatarFallback>{selectedFriend.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold">{selectedFriend.name}</h3>
                                    <p className="text-xs text-muted-foreground">Online</p> {/* Placeholder status */}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="rounded-full" disabled> <Phone className="h-4 w-4"/> </Button>
                                <Button variant="ghost" size="icon" className="rounded-full" disabled> <Video className="h-4 w-4"/> </Button>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <ScrollArea className="flex-grow p-4 space-y-4 bg-background">
                            {isLoadingMessages ? (
                                <> <MessageSkeleton/> <MessageSkeleton/> <MessageSkeleton/> </>
                            ) : messages.length > 0 ? (
                                messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex gap-3",
                                            msg.senderId === userId ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {msg.senderId !== userId && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://avatar.vercel.sh/${selectedFriend.email}?size=32`} alt={selectedFriend.name} />
                                                 <AvatarFallback>{selectedFriend.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div
                                            className={cn(
                                                "max-w-[70%] rounded-lg px-4 py-2 text-sm shadow-sm",
                                                msg.senderId === userId
                                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                                    : "bg-muted text-foreground rounded-bl-none"
                                            )}
                                        >
                                             {msg.type === 'product' && msg.productDetails ? (
                                                <div className="flex flex-col gap-2">
                                                     <p className="text-xs font-medium opacity-90 mb-1">Shared a product:</p>
                                                     {/* Use a Card-like structure for product details */}
                                                    <Card className="bg-card/80 p-2 flex gap-2 items-center border shadow-sm">
                                                        <Image
                                                             src={msg.productDetails.imageUrl || '/placeholder.png'}
                                                             alt={msg.productDetails.name}
                                                             width={40} height={40}
                                                             className="rounded-sm border"
                                                             data-ai-hint="product image"
                                                         />
                                                        <div className="text-xs flex-grow">
                                                            <p className="font-semibold truncate">{msg.productDetails.name}</p>
                                                            <p>{formatCurrency(msg.productDetails.price)}</p>
                                                        </div>
                                                         {/* Add "Buy as Gift" button */}
                                                         <Button size="sm" variant="secondary" className="ml-auto h-7 text-xs" onClick={() => alert('Buy as Gift functionality not implemented.')}>
                                                             <ShoppingBag className="mr-1 h-3 w-3"/> Buy Gift
                                                         </Button>
                                                    </Card>
                                                     <p className="mt-1">{msg.content}</p> {/* Display text content too */}
                                                </div>
                                             ) : (
                                                 <p>{msg.content}</p>
                                             )}
                                            <p className={cn("text-xs mt-1 opacity-70", msg.senderId === userId ? "text-right" : "text-left")}>
                                                {format(msg.timestamp, 'p')}
                                            </p>
                                        </div>
                                         {msg.senderId === userId && (
                                            <Avatar className="h-8 w-8">
                                                {/* Assuming user avatar data is available */}
                                                 <AvatarImage src={`https://avatar.vercel.sh/${userId}?size=32`} alt="You" />
                                                 <AvatarFallback>Y</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-10">No messages yet. Start the conversation!</p>
                            )}
                             <div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
                        </ScrollArea>

                        {/* Message Input Area */}
                        <footer className="p-4 border-t bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="rounded-full" disabled> <Paperclip className="h-4 w-4"/> </Button>
                                <Input
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                                    className="flex-grow bg-background"
                                    disabled={isSending}
                                />
                                <Button onClick={handleSendMessage} size="icon" className="rounded-full" disabled={!newMessage.trim() || isSending}>
                                    <SendHorizonal className="h-5 w-5" />
                                </Button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                        <div className="space-y-2">
                            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/30"/>
                            <p className="text-lg font-medium">Select a friend to start chatting</p>
                            <p className="text-sm">Or find new friends to connect with.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
