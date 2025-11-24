/**
 * Loading spinner component
 * Displays while data is being fetched
 */
export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-netflix-gray border-t-netflix-red rounded-full animate-spin" />
        <p className="text-gray-400">Đang tải...</p>
      </div>
    </div>
  )
}


