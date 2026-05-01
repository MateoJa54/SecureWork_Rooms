import Button from '../common/Button.jsx';

export default function UsuariosConectados({ usuarios, onExpulsar, loadingNick }) {
  if (!usuarios?.length) {
    return <p className="text-sm text-gray-500 italic">No hay usuarios conectados.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {usuarios.map((u) => (
        <li key={u.nickname} className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-800">{u.nickname}</p>
            <p className="text-xs text-gray-400">{u.ip ?? ''}</p>
          </div>
          <Button
            variant="danger"
            className="text-xs py-1 px-2"
            loading={loadingNick === u.nickname}
            onClick={() => onExpulsar(u.nickname)}
          >
            Expulsar
          </Button>
        </li>
      ))}
    </ul>
  );
}
