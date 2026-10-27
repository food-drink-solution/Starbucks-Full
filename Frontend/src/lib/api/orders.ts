import { apiClient } from './client';
import type { Order } from '@/lib/schemas';

/**
 * Order-related API fetchers
 */
export const orderFetchers = {
  /**
   * Create a new order
   */
  createOrder: async (order: Partial<Order>): Promise<Order> => {
    try {
      const response = await apiClient.post<{ data: Order }>('/api/v1/Orders', order);
      return response.data.data;
    } catch (error) {
      console.warn('Falling back to mock order creation due to API failure', error);
      const orderId = `mock-${Date.now()}`;
      return {
        id: orderId,
        orderNumber: `SBUX-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: 'current-user',
        items: (order.items || []) as Order['items'],
        total: order.total || 0,
        status: 'pending',
        locationId: order.locationId || 'default',
        orderType: order.orderType || 'pickup',
        paymentMethod: order.paymentMethod || 'cash',
        deliveryAddress: order.deliveryAddress,
        deliveryPhoneNumber: order.deliveryPhoneNumber,
        notes: order.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Fetch order history for the current user
   */
  fetchOrders: async (): Promise<Order[]> => {
    try {
      const response = await apiClient.get<{ data: Order[] }>('/api/v1/Orders/my');
      return response.data.data;
    } catch (error) {
      console.warn('Falling back to empty orders list on API failure', error);
      return [];
    }
  },

  /**
   * Fetch a specific order by ID
   */
  fetchOrderById: async (id: string): Promise<Order | undefined> => {
    try {
      const response = await apiClient.get<{ data: Order }>(`/api/v1/Orders/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn('Could not fetch order by ID', id, error);
      return undefined;
    }
  },
};
