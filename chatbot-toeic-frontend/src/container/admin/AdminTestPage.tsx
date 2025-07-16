export default function AdminTestPage() {
  const fakeTests = [
    { id: 1, title: "TOEIC 500", participants: 120 },
    { id: 2, title: "TOEIC 700", participants: 98 },
  ];

  return (
    <div>
      <h2>📑 Danh sách đề thi</h2>
      <ul>
        {fakeTests.map((t) => (
          <li key={t.id}>
            {t.title} - {t.participants} người làm
          </li>
        ))}
      </ul>
    </div>
  );
}
