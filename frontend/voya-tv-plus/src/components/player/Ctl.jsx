export default function Ctl({ children, onClick, aria, big = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className={`relative rounded-full ${big ? 'p-4' : 'p-3'} bg-white/15 hover:bg-white/25 active:scale-95 transition grid place-items-center text-white`}
    >
      {children}
    </button>
  )
}
