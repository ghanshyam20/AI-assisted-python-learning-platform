import { useMemo, useState } from “react”;
import { Search, Users, UserRound, RefreshCw } from “lucide-react”;
import “./UserManagement.css”;

// Public-facing fields that an authorized admin may eventually receive.
// Keep this type independent of Django’s private user model fields.
export type ManagedUser = {
id: number;
username: string;
email: string;
first_name: string;
last_name: string;
is_active: boolean;
date_joined: string;
};

// Data is passed into this component by a future authorized API integration.
// No hardcoded users or unverified API endpoints are used.
type UserManagementProps = {
users?: ManagedUser[];
loading?: boolean;
error?: string;
onRefresh?: () => void;
apiConnected?: boolean;
};

export default function UserManagement({
users = [],
loading = false,
error = “”,
onRefresh,
apiConnected = false,
}: UserManagementProps) {
const [search, setSearch] = useState(“”);
const [selectedId, setSelectedId] = useState<number | null>(null);

// Search locally over the users returned by the server.
const filteredUsers = useMemo(() => {
const query = search.trim().toLowerCase();

if (!query) return users;

return users.filter((user) => {
  const name = `${user.first_name} ${user.last_name}`;
  return [name, user.username, user.email].some((value) =>
    value.toLowerCase().includes(query)
  );
});

}, [users, search]);

// Resolve selection from the latest user data.
const selectedUser =
users.find((user) => user.id === selectedId) ?? null;

function displayName(user: ManagedUser) {
return (
${user.first_name} ${user.last_name}.trim() ||
user.username
);
}

function formatDate(value: string) {
const date = new Date(value);
return Number.isNaN(date.getTime())
? “Not available”
: date.toLocaleDateString();
}

return (
<section className=“user-management”>
<div className=“user-management-heading”>
<div>
<h2>User Management</h2>
<p>View registered users and their account information.</p>
</div>

    {onRefresh && (
      <button
        type="button"
        className="user-refresh-button"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw size={16} />
        Refresh Users
      </button>
    )}
  </div>

  <div className="user-summary-card">
    <div className="user-summary-icon">
      <Users size={23} />
    </div>
    <div>
      <span>Registered Users</span>
      <strong>
        {!apiConnected ? "—" : loading ? "..." : users.length}
      </strong>
    </div>
  </div>

  <div className="user-management-card">
    <div className="user-list-header">
      <div>
        <h3>All Users</h3>
        <p>Search users and select a row to view details.</p>
      </div>
    </div>

    <label className="user-search-field">
      <Search size={18} />
      <input
        type="search"
        placeholder="Search by name, username or email"
        aria-label="Search users"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        disabled={!apiConnected}
      />
    </label>

    {error && (
      <div className="user-message user-message-error" role="alert">
        {error}
      </div>
    )}

    {!apiConnected && !error && (
      <div className="user-message" role="status">
        <Users size={24} />
        <strong>User API not connected</strong>
        <p>
          The frontend is ready. An authenticated, staff-only
          backend endpoint is needed to display registered users.
        </p>
      </div>
    )}

    {apiConnected && loading && (
      <div className="user-message" role="status">
        Loading users...
      </div>
    )}

    {apiConnected && !loading && !error && (
      <div className="user-table-scroll">
        <table className="user-table">
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Email</th>
              <th scope="col">Status</th>
              <th scope="col">Joined</th>
              <th scope="col">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>{displayName(user)}</strong>
                  <small>@{user.username}</small>
                </td>
                <td>{user.email || "Not provided"}</td>
                <td>
                  <span
                    className={
                      user.is_active
                        ? "user-status user-status-active"
                        : "user-status user-status-inactive"
                    }
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{formatDate(user.date_joined)}</td>
                <td>
                  <button
                    type="button"
                    className="user-view-button"
                    onClick={() => setSelectedId(user.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="user-message">
            {search.trim()
              ? "No users match your search."
              : "No registered users found."}
          </div>
        )}
      </div>
    )}
  </div>

  {selectedUser && (
    <div className="user-details-card">
      <div className="user-details-heading">
        <h3>
          <UserRound size={19} />
          User Details
        </h3>
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          aria-label="Close user details"
        >
          Close
        </button>
      </div>

      <dl className="user-details-grid">
        <div>
          <dt>Full Name</dt>
          <dd>{displayName(selectedUser)}</dd>
        </div>
        <div>
          <dt>Username</dt>
          <dd>{selectedUser.username}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{selectedUser.email || "Not provided"}</dd>
        </div>
        <div>
          <dt>Account Status</dt>
          <dd>{selectedUser.is_active ? "Active" : "Inactive"}</dd>
        </div>
        <div>
          <dt>Joined</dt>
          <dd>{formatDate(selectedUser.date_joined)}</dd>
        </div>
      </dl>
    </div>
  )}
</section>

);
}