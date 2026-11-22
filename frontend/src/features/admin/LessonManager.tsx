import { useState } from 'react';
import { initialLessons, type AdminLesson } from './adminLessonData';

/**
 * Manages lessons in the frontend until the Django API is connected.
 * Lesson changes are temporary and reset when the page reloads.
 */
export default function LessonManager() {
  const [lessons, setLessons] = useState<AdminLesson[]>(initialLessons);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');

  // Only display lessons matching the administrator's search.
  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(search.toLowerCase())
  );

  // Validate the form before adding a new draft lesson.
  function createLesson(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !chapter.trim()) {
      return;
    }

    const newLesson: AdminLesson = {
      id: Date.now(),
      title: title.trim(),
      chapter: chapter.trim(),
      status: 'Draft',
    };

    setLessons((current) => [...current, newLesson]);
    setTitle('');
    setChapter('');
  }

  return (
    <section className='admin-lessons'>
      <div className='admin-section-heading'>
        <h2>Lesson Management</h2>
        <span>Frontend preview</span>
      </div>

      <form onSubmit={createLesson}>
        <h3>Create Lesson</h3>

        <input
          type='text'
          placeholder='Lesson title'
          aria-label='Lesson title'
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <input
          type='text'
          placeholder='Chapter name'
          aria-label='Chapter name'
          value={chapter}
          onChange={(event) => setChapter(event.target.value)}
          required
        />

        <button type='submit'>Create Lesson</button>
      </form>

      <input
        type='search'
        placeholder='Search lessons...'
        aria-label='Search lessons'
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className='admin-table-wrap'>
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
                <td>{lesson.status}</td>
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
  );
}
