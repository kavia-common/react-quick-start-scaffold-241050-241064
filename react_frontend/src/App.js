import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'retro_todo_v1';

/**
 * @typedef {Object} Todo
 * @property {string} id Unique id
 * @property {string} title Task title
 * @property {boolean} completed Completion state
 * @property {number} createdAt Epoch ms
 */

function createId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * Safely parse todos from localStorage.
 * @returns {Todo[]}
 */
function loadTodos() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(t => t && typeof t.title === 'string')
      .map(t => ({
        id: typeof t.id === 'string' ? t.id : createId(),
        title: String(t.title),
        completed: Boolean(t.completed),
        createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now()
      }));
  } catch {
    return [];
  }
}

/**
 * Persist todos to localStorage.
 * @param {Todo[]} todos
 */
function saveTodos(todos) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Ignore persistence errors (e.g., storage disabled).
  }
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  const [todos, setTodos] = useState(() => loadTodos());
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | done

  const inputRef = useRef(null);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Persist todos
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const remainingCount = useMemo(
    () => todos.reduce((acc, t) => acc + (t.completed ? 0 : 1), 0),
    [todos]
  );

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'done') return todos.filter(t => t.completed);
    return todos;
  }, [todos, filter]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const addTodo = () => {
    const title = newTitle.trim();
    if (!title) return;

    /** @type {Todo} */
    const todo = { id: createId(), title, completed: false, createdAt: Date.now() };
    setTodos(prev => [todo, ...prev]);
    setNewTitle('');
    inputRef.current?.focus();
  };

  const toggleTodo = id => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = id => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  const markAll = completed => {
    setTodos(prev => prev.map(t => ({ ...t, completed })));
  };

  const onSubmit = e => {
    e.preventDefault();
    addTodo();
  };

  const onNewTitleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTodo();
    }
  };

  return (
    <div className="App retro">
      <header className="retro-topbar">
        <div className="retro-brand" aria-label="Retro Task Runner">
          <span className="retro-brand__mark" aria-hidden="true">
            ▣
          </span>
          <div className="retro-brand__text">
            <div className="retro-brand__title">RETRO TASK RUNNER</div>
            <div className="retro-brand__subtitle">execute your tiny quests</div>
          </div>
        </div>

        <button
          className="theme-toggle retro-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          type="button"
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <main className="retro-shell">
        <section className="retro-card" aria-labelledby="todoHeading">
          <div className="retro-card__header">
            <h1 id="todoHeading" className="retro-h1">
              To‑Do Console
            </h1>
            <div className="retro-stats" aria-label="Task stats">
              <span className="retro-pill">
                Remaining: <strong>{remainingCount}</strong>
              </span>
              <span className="retro-pill">
                Total: <strong>{todos.length}</strong>
              </span>
            </div>
          </div>

          <form className="retro-form" onSubmit={onSubmit}>
            <label className="retro-label" htmlFor="newTodo">
              New task
            </label>
            <div className="retro-form__row">
              <input
                ref={inputRef}
                id="newTodo"
                className="retro-input"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={onNewTitleKeyDown}
                placeholder="Type a quest… (e.g., 'Ship the MVP')"
                maxLength={120}
                autoComplete="off"
              />
              <button className="retro-btn retro-btn--primary" type="submit">
                Add
              </button>
            </div>

            <div className="retro-actions">
              <div className="retro-filter" role="group" aria-label="Filter tasks">
                <button
                  type="button"
                  className={`retro-chip ${filter === 'all' ? 'is-active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`retro-chip ${filter === 'active' ? 'is-active' : ''}`}
                  onClick={() => setFilter('active')}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`retro-chip ${filter === 'done' ? 'is-active' : ''}`}
                  onClick={() => setFilter('done')}
                >
                  Done
                </button>
              </div>

              <div className="retro-bulk" role="group" aria-label="Bulk actions">
                <button
                  type="button"
                  className="retro-btn"
                  onClick={() => markAll(true)}
                  disabled={todos.length === 0}
                >
                  Mark all done
                </button>
                <button
                  type="button"
                  className="retro-btn"
                  onClick={() => markAll(false)}
                  disabled={todos.length === 0}
                >
                  Reset all
                </button>
                <button
                  type="button"
                  className="retro-btn retro-btn--danger"
                  onClick={clearCompleted}
                  disabled={!todos.some(t => t.completed)}
                >
                  Clear completed
                </button>
              </div>
            </div>
          </form>

          <div className="retro-list" role="list" aria-label="Task list">
            {filteredTodos.length === 0 ? (
              <div className="retro-empty" role="status" aria-live="polite">
                No tasks here. Add one above to begin.
              </div>
            ) : (
              filteredTodos.map(todo => (
                <div className="retro-item" role="listitem" key={todo.id}>
                  <label className="retro-item__main">
                    <input
                      type="checkbox"
                      className="retro-checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      aria-label={`Mark "${todo.title}" as ${todo.completed ? 'not completed' : 'completed'}`}
                    />
                    <span className={`retro-item__title ${todo.completed ? 'is-done' : ''}`}>
                      {todo.title}
                    </span>
                  </label>

                  <div className="retro-item__meta">
                    <span className="retro-time" title={new Date(todo.createdAt).toLocaleString()}>
                      {new Date(todo.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      className="retro-iconbtn"
                      onClick={() => deleteTodo(todo.id)}
                      aria-label={`Delete "${todo.title}"`}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <footer className="retro-footer">
            <div className="retro-footer__hint">
              Tip: Press <kbd>Enter</kbd> to add a task. Your tasks are saved locally.
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
