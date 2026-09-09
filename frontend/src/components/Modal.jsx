export default function Modal({
  open,
  onClose,
  title,
  children,
  titleClassName = "text-gray-900",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2
          id="modal-title"
          className={`mb-4 text-xl font-bold ${titleClassName}`}
        >
          {title}
        </h2>

        {children}
      </div>
    </div>
  );
}
