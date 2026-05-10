import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket.js';
import { getSessionToken, getSalaId, getNickname, clearSession } from '../services/device.service.js';
import MessageList from '../components/chat/MessageList.jsx';
import MessageInput from '../components/chat/MessageInput.jsx';
import UserSidebar from '../components/chat/UserSidebar.jsx';
import FileUpload from '../components/chat/FileUpload.jsx';

const TYPING_TIMEOUT_MS = 2800;
const HEARTBEAT_MS = 30000;

function createSystemMessage(event, nick) {
  return {
    id: `sistema-${event}-${nick}-${Date.now()}`,
    tipo: 'sistema',
    contenido: `${nick} ${event === 'entro' ? 'entro a la sala' : 'salio de la sala'}`,
    enviado_en: new Date().toISOString(),
  };
}

function normalizeArchivoMessage(archivo, fallbackNickname) {
  const nickname = archivo.nickname ?? archivo.subido_por_nickname ?? fallbackNickname;

  return {
    id: `archivo-${archivo.id}`,
    nickname,
    contenido: '',
    enviado_en: archivo.subido_en ?? new Date().toISOString(),
    archivo: {
      id: archivo.id,
      nombre: archivo.nombre ?? archivo.nombre_original,
      nombre_original: archivo.nombre_original ?? archivo.nombre,
      mime: archivo.mime ?? archivo.mime_type,
      mime_type: archivo.mime_type ?? archivo.mime,
      size: archivo.size ?? archivo.tamanio_bytes,
      tamanio_bytes: archivo.tamanio_bytes ?? archivo.size,
      subido_en: archivo.subido_en,
    },
  };
}

export default function SalaChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connect, disconnect } = useSocket();

  const [socket, setSocket] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sala, setSala] = useState(null);
  const [nickname] = useState(() => getNickname());
  const [conectado, setConectado] = useState(false);
  const [socketError, setSocketError] = useState('');
  const [expulsionMessage, setExpulsionMessage] = useState('');
  const [showUsers, setShowUsers] = useState(false);

  const sessionToken = getSessionToken();
  const salaIdGuardada = getSalaId();

  useEffect(() => {
    if (!sessionToken || salaIdGuardada !== id) {
      navigate('/unirse', { replace: true });
      return;
    }

    const sock = connect(sessionToken);
    const typingTimers = new Map();
    let expulsionTimer = null;
    setSocket(sock);

    function handleConnect() {
      setConectado(true);
      setSocketError('');
      sock.emit('sala:join', { sala_id: id });
      sock.emit('actividad:ping');
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
      setTypingUsers((prev) => prev.filter((nick) => nick !== msg.nickname));
    }

    function handleArchivoNuevo(archivo) {
      setMensajes((prev) => {
        if (prev.some((msg) => msg.archivo?.id === archivo.id)) return prev;
        return [...prev, normalizeArchivoMessage(archivo, nickname)];
      });
      setTypingUsers((prev) => prev.filter((nick) => nick !== (archivo.nickname ?? archivo.subido_por_nickname)));
    }

    function handleUsuarioEntro({ nickname: nick }) {
      setUsuarios((prev) => [...prev.filter((u) => u.nickname !== nick), { nickname: nick }]);
      if (nick && nick !== nickname) {
        setMensajes((prev) => [...prev, createSystemMessage('entro', nick)]);
      }
    }

    function handleUsuarioSalio({ nickname: nick }) {
      setUsuarios((prev) => prev.filter((u) => u.nickname !== nick));
      setTypingUsers((prev) => prev.filter((item) => item !== nick));
      clearTimeout(typingTimers.get(nick));
      typingTimers.delete(nick);
      if (nick && nick !== nickname) {
        setMensajes((prev) => [...prev, createSystemMessage('salio', nick)]);
      }
    }

    function handleUsuarioEscribiendo({ nickname: nick }) {
      if (!nick || nick === nickname) return;

      setTypingUsers((prev) => (prev.includes(nick) ? prev : [...prev, nick]));
      clearTimeout(typingTimers.get(nick));
      typingTimers.set(
        nick,
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((item) => item !== nick));
          typingTimers.delete(nick);
        }, TYPING_TIMEOUT_MS)
      );
    }

    function handleExpulsado({ motivo, mensaje }) {
      const fallbackMessage =
        motivo === 'sala_cerrada'
          ? 'La sala fue eliminada por el administrador.'
          : 'El administrador te expulso de la sala.';

      setExpulsionMessage(mensaje ?? fallbackMessage);
      setConectado(false);

      clearTimeout(expulsionTimer);
      expulsionTimer = setTimeout(() => {
        clearSession();
        disconnect();
        navigate(`/error?motivo=${motivo ?? 'expulsado'}`, { replace: true });
      }, 2200);
    }

    function handleSocketError(err) {
      setSocketError(err?.mensaje ?? err?.message ?? 'No pudimos completar la accion.');
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
    sock.on('archivo:nuevo', handleArchivoNuevo);
    sock.on('usuario:entro', handleUsuarioEntro);
    sock.on('usuario:salio', handleUsuarioSalio);
    sock.on('usuario:escribiendo', handleUsuarioEscribiendo);
    sock.on('sesion:expulsado', handleExpulsado);
    sock.on('error', handleSocketError);
    sock.on('connect_error', handleConnectError);

    if (sock.connected) {
      handleConnect();
    }

    const heartbeat = window.setInterval(() => {
      if (sock.connected) sock.emit('actividad:ping');
    }, HEARTBEAT_MS);

    return () => {
      window.clearInterval(heartbeat);
      clearTimeout(expulsionTimer);
      typingTimers.forEach((timer) => clearTimeout(timer));
      sock.off('connect', handleConnect);
      sock.off('disconnect', handleDisconnect);
      sock.off('sala:joined', handleJoined);
      sock.off('mensaje:nuevo', handleNuevoMensaje);
      sock.off('archivo:nuevo', handleArchivoNuevo);
      sock.off('usuario:entro', handleUsuarioEntro);
      sock.off('usuario:salio', handleUsuarioSalio);
      sock.off('usuario:escribiendo', handleUsuarioEscribiendo);
      sock.off('sesion:expulsado', handleExpulsado);
      sock.off('error', handleSocketError);
      sock.off('connect_error', handleConnectError);
    };
  }, [connect, disconnect, id, navigate, nickname, salaIdGuardada, sessionToken]);

  const handleSend = useCallback((contenido) => {
    socket?.emit('mensaje:enviar', { sala_id: id, contenido });
    socket?.emit('actividad:ping');
  }, [socket, id]);

  const handleTyping = useCallback(() => {
    socket?.emit('mensaje:typing');
  }, [socket]);

  function handleSalir() {
    socket?.emit('sala:salir');
    clearSession();
    disconnect();
    navigate('/', { replace: true });
  }

  return (
    <main className="h-dvh overflow-hidden bg-slate-100">
      <div className="relative flex h-full">
        <aside className="flex w-14 shrink-0 flex-col items-center bg-gradient-to-b from-primary-900 via-primary-700 to-sky-500 py-4 text-white md:w-20 md:py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-bold text-primary-700 shadow-lg shadow-blue-950/20 md:h-11 md:w-11">
            SW
          </div>
          <button
            type="button"
            onClick={() => setShowUsers((prev) => !prev)}
            className={`mt-8 flex h-10 w-10 items-center justify-center rounded-2xl transition md:mt-10 md:h-11 md:w-11 ${showUsers ? 'bg-white text-primary-700 shadow-lg shadow-blue-950/20' : 'bg-white/15 text-white ring-1 ring-white/20 hover:bg-white/25'}`}
            title="Usuarios conectados"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 19a4.5 4.5 0 0 1 9 0M13.5 18a3.5 3.5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={handleSalir}
            className="mt-auto flex h-10 w-10 items-center justify-center rounded-2xl text-blue-100 transition hover:bg-white/15 hover:text-white md:h-11 md:w-11"
            title="Salir"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 17l5-5-5-5M20 12H9M11 20H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </aside>

        {showUsers && (
          <>
            <div className="absolute inset-y-0 left-14 right-0 z-20 bg-slate-950/25 md:left-20" aria-hidden="true" />
            <div className="absolute left-14 top-0 z-30 h-full w-80 max-w-[calc(100vw-3.5rem)] md:left-20 md:max-w-[calc(100vw-5rem)]">
              <UserSidebar
                usuarios={usuarios}
                nicknameSelf={nickname}
                onClose={() => setShowUsers(false)}
                className="h-full w-full border-r border-slate-100 shadow-2xl"
              />
            </div>
          </>
        )}

        <section className="flex min-w-0 flex-1 flex-col bg-slate-50">
          <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white px-3 py-3 sm:h-20 sm:px-6 sm:py-0">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${conectado ? 'bg-emerald-400 ring-4 ring-emerald-50' : 'bg-slate-300 ring-4 ring-slate-100'}`} />
                <h1 className="truncate text-base font-bold text-slate-950 sm:text-xl">{sala?.nombre ?? 'Sala segura'}</h1>
              </div>
              <p className="mt-1 truncate text-xs text-slate-500 sm:text-sm">
                {conectado ? `Conectado como ${nickname || 'invitado'}` : 'Reconectando...'}
              </p>
            </div>

            {socketError && (
              <span className="hidden rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 sm:inline">
                {socketError}
              </span>
            )}
          </header>

          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
              {expulsionMessage && (
                <div className="border-b border-red-100 bg-red-50 px-3 py-3 text-center text-sm font-semibold text-red-700 sm:px-5">
                  {expulsionMessage}
                </div>
              )}
              <MessageList mensajes={mensajes} nicknameSelf={nickname} typingUsers={typingUsers} sessionToken={sessionToken} />
              <MessageInput
                onSend={handleSend}
                onTyping={handleTyping}
                disabled={!conectado}
                attachment={sala?.tipo === 'multimedia' && socket ? (
                  <FileUpload
                    salaId={id}
                    sessionToken={sessionToken}
                    maxMb={sala.max_file_size_mb ?? sala.tamanio_max_archivo_mb}
                    disabled={!conectado}
                    onUploaded={(f) => {
                      setMensajes((prev) => [...prev, normalizeArchivoMessage(f, nickname)]);
                      socket?.emit('archivo:notificar', { archivo_id: f.id });
                      socket?.emit('actividad:ping');
                    }}
                  />
                ) : null}
              />
            </div>
          </div>
        </section>

        <aside className="hidden w-80 shrink-0 border-l border-slate-100 bg-white xl:flex xl:flex-col">
          <div className="flex flex-1 flex-col justify-center px-6">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-700 to-sky-500 p-5 text-white shadow-2xl shadow-primary-900/20">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-bold text-primary-700">
                  SW
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                  Secure Room
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-bold leading-tight">Conversaciones privadas para equipos rapidos.</h2>
              <p className="mt-3 text-sm leading-6 text-blue-100">
                Comparte mensajes y archivos en una sala protegida por PIN, con sesiones activas y control de acceso por dispositivo.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-950">{usuarios.length}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">usuarios activos</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-950">{mensajes.length}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">mensajes</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
