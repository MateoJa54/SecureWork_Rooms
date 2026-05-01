import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket.js';
import { getSessionToken, getSalaId, getNickname, clearSession } from '../services/device.service.js';
import MessageList from '../components/chat/MessageList.jsx';
import MessageInput from '../components/chat/MessageInput.jsx';
import UserSidebar from '../components/chat/UserSidebar.jsx';
import FileUpload from '../components/chat/FileUpload.jsx';

export default function SalaChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connect, disconnect } = useSocket();

  const [socket, setSocket] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [sala, setSala] = useState(null);
  const [nickname] = useState(() => getNickname());
  const [conectado, setConectado] = useState(false);

  const sessionToken = getSessionToken();
  const salaIdGuardada = getSalaId();

  useEffect(() => {
    if (!sessionToken || salaIdGuardada !== id) {
      navigate('/unirse', { replace: true });
      return;
    }

    const sock = connect(sessionToken);
    setSocket(sock);

    sock.on('connect', () => {
      setConectado(true);
      sock.emit('sala:join', { sala_id: id });
    });
    sock.on('disconnect', () => setConectado(false));

    sock.on('sala:joined', ({ sala: s, usuarios: us, mensajes_recientes: ms }) => {
      setSala(s);
      setUsuarios(us ?? []);
      setMensajes(ms ?? []);
    });

    sock.on('mensaje:nuevo', (msg) => {
      setMensajes((prev) => [...prev, msg]);
    });

    sock.on('usuario:entro', ({ nickname: nick }) => {
      setUsuarios((prev) => [...prev.filter((u) => u.nickname !== nick), { nickname: nick }]);
    });

    sock.on('usuario:salio', ({ nickname: nick }) => {
      setUsuarios((prev) => prev.filter((u) => u.nickname !== nick));
    });

    sock.on('sesion:expulsado', ({ motivo }) => {
      clearSession();
      disconnect();
      navigate(`/error?motivo=${motivo}`, { replace: true });
    });

    return () => {
      sock.emit('sala:salir');
    };
  }, [id]);

  const handleSend = useCallback((contenido) => {
    socket?.emit('mensaje:enviar', { sala_id: id, contenido });
  }, [socket, id]);

  function handleSalir() {
    clearSession();
    disconnect();
    navigate('/', { replace: true });
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className={`h-2 w-2 rounded-full ${conectado ? 'bg-green-400' : 'bg-gray-300'}`} />
          <h1 className="font-semibold text-gray-900">{sala?.nombre ?? 'Sala'}</h1>
        </div>
        <div className="flex items-center gap-4">
          {sala?.tipo_sala === 'multimedia' && socket && (
            <FileUpload
              salaId={id}
              sessionToken={sessionToken}
              maxMb={sala.tamanio_max_archivo_mb}
              onUploaded={(f) => socket?.emit('archivo:notificar', { archivo_id: f.id })}
            />
          )}
          <button
            onClick={handleSalir}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          <MessageList mensajes={mensajes} nicknameSelf={nickname} />
          <MessageInput onSend={handleSend} disabled={!conectado} />
        </div>
        <UserSidebar usuarios={usuarios} nicknameSelf={nickname} />
      </div>
    </div>
  );
}
