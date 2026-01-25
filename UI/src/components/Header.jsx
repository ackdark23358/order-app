function Header({ currentView, onViewChange }) {
  return (
    <header className="bg-blue-500 border-b border-blue-600 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="bg-green-800 text-white px-6 py-2 font-bold text-lg">
            COZY
          </div>
          
          <nav className="flex gap-2">
            <button 
              onClick={() => onViewChange('order')}
              className={`px-6 py-2 rounded font-medium transition-colors ${
                currentView === 'order'
                  ? 'bg-blue-600 text-white border-2 border-blue-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              주문하기
            </button>
            <button 
              onClick={() => onViewChange('admin')}
              className={`px-6 py-2 rounded font-medium transition-colors ${
                currentView === 'admin'
                  ? 'bg-blue-600 text-white border-2 border-blue-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              관리자
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
