export default function CaptionOverlay({ visible, cueHtml }) {
  if (!visible) return null
  return (
    <div
      className={`
        absolute left-1/2 -translate-x-1/2
        bottom-16 md:bottom-20 lg:bottom-24
        max-w-[90%] md:max-w-[75%] lg:max-w-[60%]
        text-center px-3 py-2 rounded-md
        bg-black/60 text-white
      `}
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        fontWeight: 500,
        lineHeight: 1.35,
        fontSize: 'clamp(0.9rem, 1.6vw, 1.2rem)',
      }}
      dangerouslySetInnerHTML={{ __html: cueHtml }}
    />
  )
}
