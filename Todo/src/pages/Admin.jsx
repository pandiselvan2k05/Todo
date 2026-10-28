import { useCallback, useEffect, useState } from "react";
import { getUsersApi } from "../api/users";

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getUsersApi();
      setUsers(Array.isArray(result) ? result : []);
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 403) {
        setError("The server does not allow this account to view the user list.");
      } else if (!requestError.response) {
        setError("Could not connect to the server. Check your connection and try again.");
      } else {
        setError(requestError.response?.data?.message || "Could not load users. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>User list</p>
        </div>
        <button type="button" onClick={loadUsers} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      {error && <p role="alert">{error}</p>}
      {loading && <p role="status">Loading users...</p>}
      {!loading && !error && users.length === 0 && <p>No users found.</p>}
      {!loading && !error && users.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr>
                <th style={{ padding: 12, borderBottom: "1px solid #ccc" }}>Name</th>
                <th style={{ padding: 12, borderBottom: "1px solid #ccc" }}>Email</th>
                <th style={{ padding: 12, borderBottom: "1px solid #ccc" }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id || user.id || user.email}>
                  <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{user.name || "—"}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{user.email || "—"}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{user.role || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default Admin;
