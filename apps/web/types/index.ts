export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  username?: string;
  role?: string;
}

export interface ActiveBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  progressPercentage: number;
  currentPage: number;
  totalPages: number;
  creatorId?: string;
  creator?: {
    id: string;
    username?: string;
    email: string;
    profile?: {
      displayName?: string;
    };
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  color?: 'yellow' | 'pink' | 'blue' | 'mint' | 'peach';
  page?: number;
  lifecycleState?: 'created' | 'delivered' | 'displayed' | 'read' | 'archived';
  conversationId?: string;
  bookId?: string;
  senderId?: string;
  senderName?: string;
}
