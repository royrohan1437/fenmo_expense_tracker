import { Expense } from '../components/ExpenseList';
import { ExpenseInput } from '../components/ExpenseForm';

const API_BASE_URL = '';

function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

const pendingRequests = new Map<string, Promise<Expense>>();

function getAuthHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function createExpense(expense: ExpenseInput, token: string | null): Promise<Expense> {
  const idempotencyKey = generateIdempotencyKey();

  if (pendingRequests.has(idempotencyKey)) {
    return pendingRequests.get(idempotencyKey)!;
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          ...expense,
          idempotencyKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create expense');
      }

      return await response.json();
    } finally {
      pendingRequests.delete(idempotencyKey);
    }
  })();

  pendingRequests.set(idempotencyKey, requestPromise);
  return requestPromise;
}

export async function fetchExpenses(
  token: string | null,
  category?: string,
  sortByDate?: boolean
): Promise<Expense[]> {
  const params = new URLSearchParams();

  if (category) {
    params.append('category', category);
  }

  if (sortByDate) {
    params.append('sort', 'date_desc');
  }

  const response = await fetch(`${API_BASE_URL}/expenses?${params.toString()}`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }

  return await response.json();
}

export async function fetchCategories(token: string | null): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return await response.json();
}
