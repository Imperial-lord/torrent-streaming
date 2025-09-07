export default function Meta({ label, value }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="shrink-0 text-gray-600 dark:text-gray-400">{label}:</span>
      <span className="text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  )
}
