import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createTodo, deleteTodo, listTodos, Todo, updateTodo } from "./api";

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const remainingCount = useMemo(() => todos.filter((todo) => !todo.completed).length, [todos]);

  useEffect(() => {
    listTodos()
      .then(setTodos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();

    if (!nextTitle) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const todo = await createTodo(nextTitle);
      setTodos((current) => [todo, ...current]);
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create todo");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTodo(todo: Todo) {
    setError("");
    const optimisticTodos = todos.map((item) =>
      item.id === todo.id ? { ...item, completed: !item.completed } : item
    );
    setTodos(optimisticTodos);

    try {
      const updated = await updateTodo(todo.id, { completed: !todo.completed });
      setTodos((current) => current.map((item) => (item.id === todo.id ? updated : item)));
    } catch (err) {
      setTodos(todos);
      setError(err instanceof Error ? err.message : "Could not update todo");
    }
  }

  async function removeTodo(id: number) {
    setError("");
    const previous = todos;
    setTodos((current) => current.filter((todo) => todo.id !== id));

    try {
      await deleteTodo(id);
    } catch (err) {
      setTodos(previous);
      setError(err instanceof Error ? err.message : "Could not delete todo");
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">Docker practice stack</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-normal text-white sm:text-5xl">Todo Platform</h1>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Total" value={todos.length} />
            <Stat label="Open" value={remainingCount} />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="min-h-12 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-4 text-base text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            placeholder="Add a new task"
          />
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            Add Todo
          </button>
        </form>

        {error ? (
          <div className="mt-5 rounded-md border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <section className="mt-8 flex-1">
          {loading ? (
            <div className="flex min-h-60 items-center justify-center text-zinc-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading todos
            </div>
          ) : todos.length === 0 ? (
            <div className="flex min-h-60 items-center justify-center rounded-md border border-dashed border-zinc-700 text-zinc-400">
              No todos yet
            </div>
          ) : (
            <ul className="grid gap-3">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/80 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => toggleTodo(todo)}
                    aria-label={todo.completed ? "Mark todo as open" : "Mark todo as complete"}
                    className={`flex h-9 w-9 items-center justify-center rounded-md border transition ${
                      todo.completed
                        ? "border-emerald-400 bg-emerald-400 text-zinc-950"
                        : "border-zinc-700 text-zinc-500 hover:border-emerald-400 hover:text-emerald-300"
                    }`}
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <div className="min-w-0">
                    <p className={`truncate text-base ${todo.completed ? "text-zinc-500 line-through" : "text-white"}`}>
                      {todo.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">Created {new Date(todo.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTodo(todo.id)}
                    aria-label="Delete todo"
                    className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 text-right">
      <p className="text-xs uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
