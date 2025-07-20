const API_BASE_URL = 'https://eventhh-afcpamdvfxfwfhcj.westindia-01.azurewebsites.net/api';
// const API_BASE_URL = 'http://localhost:5004/api';
class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {};

    // Only set Content-Type if not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { error: 'Request failed' };
      }
      throw new Error(error.error || 'Request failed');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  // Auth methods
  async register(email: string, password: string, fullName: string, role: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, role }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Event methods
  async getEvents(searchQuery?: string) {
    let endpoint = '/events';
    if (searchQuery) {
      endpoint += `?q=${encodeURIComponent(searchQuery)}`;
    }
    return this.request(endpoint);
  }

  async createEvent(eventData: any) {
    // If eventData is FormData, don't stringify it
    const body = eventData instanceof FormData ? eventData : JSON.stringify(eventData);
    
    return this.request('/events', {
      method: 'POST',
      body,
      // Don't set Content-Type when sending FormData, browser will set it automatically with boundary
      headers: eventData instanceof FormData ? {} : {
        'Content-Type': 'application/json'
      }
    });
  }

  async updateEvent(id: string, eventData: any) {
    // If eventData is FormData, don't stringify it
    const body = eventData instanceof FormData ? eventData : JSON.stringify(eventData);
    
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body,
      // Don't set Content-Type when sending FormData, browser will set it automatically with boundary
      headers: eventData instanceof FormData ? {} : {
        'Content-Type': 'application/json'
      }
    });
  }

  async deleteEvent(id: string) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async getEvent(id: string) {
    return this.request(`/events/${id}`);
  }

  async getEventByShareId(shareId: string) {
    return this.request(`/public/events/${shareId}`);
  }

  // Registration methods
  async getRegistrations() {
    return this.request('/registrations');
  }

  async getEventRegistrations(eventId: string) {
    return this.request(`/events/${eventId}/registrations`);
  }

  async registerForEvent(eventId: string, registrationData: any, paymentScreenshot?: File) {
    // If we have a payment screenshot, use FormData
    if (paymentScreenshot) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(registrationData));
      formData.append('payment_screenshot', paymentScreenshot);
      
      return this.request('/registrations', {
        method: 'POST',
        body: formData,
      });
    }
    
    // Otherwise use JSON as before
    return this.request('/registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  async updateRegistration(eventId: string, registrationData: any) {
    return this.request(`/registrations/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({ registration_data: registrationData }),
    });
  }

  // async checkIn(registrationId: string) {
  //   return this.request(`/registrations/${registrationId}/checkin`, {
  //     method: 'PUT',
  //   });
  // }

  // Admin methods
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async broadcastEmail(eventId: string, data: { 
    subject: string; 
    message: string;
    includeEventDetails: boolean;
  }) {
    return this.request(`/events/${eventId}/broadcast`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const apiClient = new ApiClient();