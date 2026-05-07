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

    function handleConnect() {
      setConectado(true);
      sock.emit('sala:join', { sala_id: id });
    }

    function handleDisconnect() {
      setConectado(false);
    }

    function handleJoined({ sala: s, usuarios: us, mensajes_recientes: ms }) {
      setSala(s);
      setUsuarios(us ?? []);
      setMensajes(ms ?? []);
    }

    function handleNuevoMensaje(msg) {
      setMensajes((prev) => [...prev, msg]);
    }

    function handleUsuarioEntro({ nickname: nick }) {
      setUsuarios((prev) => [...prev.filter((u) => u.nickname !== nick), { nickname: nick }]);
    }

    function handleUsuarioSalio({ nickname: nick }) {
      setUsuarios((prev) => prev.filter((u) => u.nickname !== nick));
    }

    function handleExpulsado({ motivo }) {
      clearSession();
      disconnect();
      navigate(`/error?motivo=${motivo}`, { replace: true });
    }

    function handleConnectError() {
      clearSession();
      disconnect();
      navigate('/unirse', { replace: true });
    }

    sock.on('connect', handleConnect);
    sock.on('disconnect', handleDisconnect);
    sock.on('sala:joined', handleJoined);
    sock.on('mensaje:nuevo', handleNuevoMensaje);
    sock.on('usuario:entro', handleUsuarioEntro);
    sock.on('usuario:salio', handleUsuarioSalio);
    sock.on('sesion:expulsado', handleExpulsado);
    sock.on('connect_error', handleConnectError);

    if (sock.connected) {
      handleConnect();
    }

    return () => {
      sock.off('connect', handleConnect);
      sock.off('disconnect', handleDisconnect);
      sock.off('sala:joined', handleJoined);
      sock.off('mensaje:nuevo', handleNuevoMensaje);
      sock.off('usuario:entro', handleUsuarioEntro);
      sock.off('usuario:salio', handleUsuarioSalio);
      sock.off('sesion:expulsado', handleExpulsado);
      sock.off('connect_error', handleConnectError);
    };
  }, [connect, disconnect, id, navigate, salaIdGuardada, sessionToken]);

  const handleSend = useCallback((contenido) => {
    socket?.emit('mensaje:enviar', { sala_id: id, contenido });
  }, [socket, id]);

  function handleSalir() {
    socket?.emit('sala:salir');
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
