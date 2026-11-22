import { useState } from "react";
import "./AdminDashboard.css";

const lessons = [
{ id: 1, title: "Introduction to Variables", chapter: "Python Basics", status: "Published" },
{ id: 2, title: "Python Data Types", chapter: "Python Basics", status: "Draft" },
{ id: 3, title: "Input and Output", chapter: "Python Basics", status: "Draft" },
];

export default function AdminDashboard() {
// Filter lesson previews using the search box.
const [search, setSearch] = useState("");

const filteredLessons = lessons.filter((lesson) =>
lesson.title.toLowerCase().includes(search.toLowerCase())
);

return (
<div className="admin-layout">
<aside className="admin-sidebar">
<h2>PyLearn Admin</h2>
<nav>
<a href="#overview">Overview</a>
<a href="#lessons">Lessons</a>
</nav>
<p>Content Management</p>
</aside>

  <main className="admin-main">
    <header className="admin-header">
      <div>
        <h1>Admin Dashboard</h1>
        <p>Manage your Python learning content.</p>
      </div>
      <span className="admin-role">Administrator</span>
    </header>

    <section id="overview" className="admin-stats">
      <div className="admin-stat-card">
        <span>Total Lessons</span>
        <strong>{lessons.length}</strong>
      </div>
      <div className="admin-stat-card">
        <span>Published</span>
        <strong>{lessons.filter((l) => l.status === "Published").length}</strong>
      </div>
      <div className="admin-stat-card">
        <span>Drafts</span>
        <strong>{lessons.filter((l) => l.status === "Draft").length}</strong>
      </div>
    </section>

    <section id="lessons" className="admin-lessons">
      <div className="admin-section-heading">
        <h2>Lesson Management</h2>
        <span>Preview only</span>
      </div>

      <input
        type="search"
        placeholder="Search lessons..."
        aria-label="Search lessons"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Lesson</th>
              <th>Chapter</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLessons.map((lesson) => (
              <tr key={lesson.id}>
                <td>{lesson.title}</td>
                <td>{lesson.chapter}</td>
                <td>
                  <span className={`admin-status ${lesson.status.toLowerCase()}`}>
                    {lesson.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredLessons.length === 0 && (
              <tr>
                <td colSpan={3}>No matching lessons found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  </main>
</div>

);
}