/// <reference types="vite/client" />
import { http, HttpResponse } from 'msw';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'test-token-123',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'Customer',
        },
      },
    });
  }),

  http.post(`${API_BASE_URL}/auth/register`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'test-token-123',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'Customer',
        },
      },
    });
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  // Menu endpoints
  http.get(`${API_BASE_URL}/menu/categories`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Coffee',
          description: 'Premium coffee drinks',
          image: 'coffee.jpg',
        },
        {
          id: '2',
          name: 'Tea',
          description: 'Specialty teas',
          image: 'tea.jpg',
        },
      ],
    });
  }),

  http.get(`${API_BASE_URL}/menu/items`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Espresso',
          description: 'Rich and bold',
          price: 25,
          categoryId: '1',
          image: 'espresso.jpg',
          available: true,
        },
        {
          id: '2',
          name: 'Cappuccino',
          description: 'Creamy and smooth',
          price: 35,
          categoryId: '1',
          image: 'cappuccino.jpg',
          available: true,
        },
      ],
    });
  }),

  http.get(`${API_BASE_URL}/menu/items/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        name: 'Espresso',
        description: 'Rich and bold',
        price: 25,
        categoryId: '1',
        image: 'espresso.jpg',
        available: true,
      },
    });
  }),

  // Locations endpoints
  http.get(`${API_BASE_URL}/locations`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Downtown Cairo',
          address: '123 Main St, Cairo',
          latitude: 30.0444,
          longitude: 31.2357,
          phone: '+20-100-123-4567',
          hours: '7:00 AM - 10:00 PM',
        },
        {
          id: '2',
          name: 'New Cairo',
          address: '456 Tech St, New Cairo',
          latitude: 30.0131,
          longitude: 31.4453,
          phone: '+20-100-234-5678',
          hours: '7:00 AM - 11:00 PM',
        },
      ],
    });
  }),

  http.get(`${API_BASE_URL}/locations/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        name: 'Downtown Cairo',
        address: '123 Main St, Cairo',
        latitude: 30.0444,
        longitude: 31.2357,
        phone: '+20-100-123-4567',
        hours: '7:00 AM - 10:00 PM',
      },
    });
  }),

  // Orders endpoints
  http.post(`${API_BASE_URL}/orders`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        userId: '1',
        items: [],
        total: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    });
  }),

  http.get(`${API_BASE_URL}/orders/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        userId: '1',
        items: [],
        total: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    });
  }),

  http.get(`${API_BASE_URL}/orders`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  // Actual API endpoints requested by hooks
  http.get('*/api/v1/Menu/categories', () => {
    return HttpResponse.json({
      items: [
        {
          id: '1',
          name: 'Coffee',
          description: 'Premium coffee drinks',
          image: 'coffee.jpg',
        },
        {
          id: '2',
          name: 'Tea',
          description: 'Specialty teas',
          image: 'tea.jpg',
        },
      ],
      totalCount: 2,
    });
  }),

  http.get('*/api/v1/Locations', () => {
    return HttpResponse.json({
      items: [
        {
          id: '1',
          name: 'Downtown Cairo',
          address: '123 Main St, Cairo',
          latitude: 30.0444,
          longitude: 31.2357,
          phone: '+20-100-123-4567',
          hours: '7:00 AM - 10:00 PM',
        },
      ],
      totalCount: 1,
    });
  }),

  http.get('*/api/v1/Account/profile', () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'Customer',
    });
  }),
];
