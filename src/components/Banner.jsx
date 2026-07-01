export default function Banner({ banner }) {
  if (!banner) return null;
  return (
    <div className="monsoon-bar">
      <span className="icon">🌧</span>
      <div>
        <b>{banner.message}</b> — <span>{banner.detail}</span>
      </div>
    </div>
  );
}
