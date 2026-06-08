export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export async function listTodos(): Promise<Todo[]> {
  return request<Todo[]>("/todos");
}

export async function createTodo(title: string): Promise<Todo> {
  return request<Todo>("/todos", {
    method: "POST",
    body: JSON.stringify({ title })
  });
}

export async function updateTodo(id: number, updates: Partial<Pick<Todo, "title" | "completed">>): Promise<Todo> {
  return request<Todo>(`/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates)
  });
}

export async function deleteTodo(id: number): Promise<void> {
  await request<void>(`/todos/${id}`, { method: "DELETE" });
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
