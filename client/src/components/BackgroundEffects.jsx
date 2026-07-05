export default function BackgroundEffects() {
  return (
    <>
      {/* Animated grid */}
      <div className="fixed inset-0 grid-bg opacity-60 pointer-events-none z-0" />

      {/* Floating blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-blue-700/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-cyan-700/15 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>
    </>
  )
}
