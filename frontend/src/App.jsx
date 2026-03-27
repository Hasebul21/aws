import { useEffect, useState } from "react";

const API_BASE = "/api";

const defaultForm = { name: "", email: "" };

export default function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    const res = await fetch(`${API_BASE}/users`);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers().catch(() => setMessage("Failed to load users"));
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE}/users/${editingId}` : `${API_BASE}/users`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!res.ok) {
      const err = await res.json();
      setMessage(err.error || "Request failed");
      return;
    }

    setForm(defaultForm);
    setEditingId(null);
    await loadUsers();
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const deleteUser = async (id) => {
    setMessage("");
    const res = await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setMessage("Failed to delete user");
      return;
    }
    await loadUsers();
  };

  return (
    <main className="container">
      <h1>AWS Practice CRUD App</h1>
      <p className="subtext">React + Node + PostgreSQL</p>

      <form onSubmit={handleSubmit} className="card form">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <div className="actions">
          <button type="submit">{editingId ? "Update User" : "Add User"}</button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="ghost">
              Cancel
            </button>
          )}
        </div>
        {message && <p className="message">{message}</p>}
      </form>

      <section className="card">
        <h2>Users</h2>
        {users.length === 0 ? (
          <p>No users yet</p>
        ) : (
          <ul className="list">
            {users.map((user) => (
              <li key={user.id} className="row">
                <span>
                  <strong>{user.name}</strong> - {user.email}
                </span>
                <div className="actions">
                  <button onClick={() => startEdit(user)}>Edit</button>
                  <button onClick={() => deleteUser(user.id)} className="danger">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
