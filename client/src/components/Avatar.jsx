export default function Avatar({ member, size = 72 }) {
  const initial = (member.nickname || member.name || "?").trim().charAt(0);
  return member.avatar_url ? (
    <img className="avatar" src={member.avatar_url} alt={member.name} width={size} height={size} />
  ) : (
    <div className="avatar avatar-fallback" style={{ width: size, height: size, fontSize: size / 2.4 }}>
      {initial}
    </div>
  );
}
