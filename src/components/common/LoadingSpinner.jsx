const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
          <span className="text-2xl">🌱</span>
        </div>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
        <p className="mt-2 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
