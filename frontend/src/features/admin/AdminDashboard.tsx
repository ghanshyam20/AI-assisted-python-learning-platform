import LessonManager from "./LessonManager";
import "./AdminDashboard.css";

const lessons = [
{ id: 1, title: "Introduction to Variables", chapter: "Python Basics", status: "Published" },
{ id: 2, title: "Python Data Types", chapter: "Python Basics", status: "Draft" },
{ id: 3, title: "Input and Output", chapter: "Python Basics", status: "Draft" },
];

export default function AdminDashboard() {
// Filter lesson previews using the search box.
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

    <LessonManager />
  </main>
</div>

);
}
