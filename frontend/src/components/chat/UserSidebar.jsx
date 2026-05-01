export default function UserSidebar({ usuarios, nicknameSelf }) {
  return (
    <aside className="w-48 shrink-0 border-l border-gray-200 bg-gray-50 p-3 flex flex-col gap-2 overflow-y-auto">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Conectados ({usuarios.length})
      </h3>
      <ul className="space-y-1">
        {usuarios.map((u) => (
          <li key={u.nickname} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 shrink-0" />
            <span className={`text-sm truncate ${u.nickname === nicknameSelf ? 'font-semibold text-primary-700' : 'text-gray-700'}`}>
              {u.nickname}
              {u.nickname === nicknameSelf && ' (tú)'}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
