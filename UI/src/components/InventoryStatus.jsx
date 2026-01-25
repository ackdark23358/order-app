function InventoryStatus({ inventory, onUpdateInventory }) {
  const getStatus = (stock) => {
    if (stock === 0) return { text: '품절', color: 'text-red-600' }
    if (stock < 5) return { text: '주의', color: 'text-yellow-600' }
    return { text: '정상', color: 'text-green-600' }
  }

  return (
    <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
      <h2 className="text-xl font-bold text-gray-800 mb-4">재고 현황</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map(item => {
          const status = getStatus(item.stock)
          return (
            <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-lg font-semibold text-gray-800 mb-2">
                {item.name}
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl font-bold text-gray-800">
                  {item.stock}개
                </div>
                <div className={`text-sm font-medium ${status.color}`}>
                  {status.text}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateInventory(item.id, -1)}
                  disabled={item.stock === 0}
                  className={`flex-1 py-2 px-4 rounded font-bold transition-colors ${
                    item.stock === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  -
                </button>
                <button
                  onClick={() => onUpdateInventory(item.id, 1)}
                  className="flex-1 py-2 px-4 rounded font-bold bg-gray-300 hover:bg-gray-400 text-gray-700 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default InventoryStatus
