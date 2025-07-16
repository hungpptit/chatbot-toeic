export default function AdminCoursePage() {
  const fakeCourses = [
    { id: 1, name: "Khóa TOEIC Cơ Bản" },
    { id: 2, name: "Khóa TOEIC Nâng Cao" },
  ];

  return (
    <div>
      <h2>📚 Danh sách khóa học</h2>
      <ul>
        {fakeCourses.map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
}
