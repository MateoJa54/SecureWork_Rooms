import Button from '../common/Button.jsx';

export default function DeleteSalaModal({ sala, loading, onCancel, onConfirm }) {
  if (!sala) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-red-700 to-red-500 px-5 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-red-100">Confirmar eliminacion</p>
          <h2 className="mt-1 text-xl font-black">Eliminar sala</h2>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-6 text-slate-600">
            Se eliminara la sala <span className="font-bold text-slate-950">{sala.nombre}</span>, sus sesiones activas y sus datos asociados.
          </p>
          <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            Los usuarios conectados seran notificados y saldran de la sala.
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => onConfirm(sala)} loading={loading}>
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
