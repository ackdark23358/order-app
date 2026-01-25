function OrderStatus({ orders, onUpdateStatus }) {
  const formatOrderItems = (orderItems) => {
    return orderItems.map(item => {
      const optionText = item.optionNames.length > 0 
        ? ` (${item.optionNames.join(', ')})` 
        : ''
      return `${item.menuName}${optionText} x ${item.quantity}`
    }).join(', ')
  }

  const getStatusButton = (order) => {
    if (order.status === 'received') {
      return (
        <button
          onClick={() => onUpdateStatus(order.id, 'preparing')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          제조 시작
        </button>
      )
    } else if (order.status === 'preparing') {
      return (
        <button
          onClick={() => onUpdateStatus(order.id, 'completed')}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          제조 완료
        </button>
      )
    } else {
      return (
        <span className="text-gray-500 font-medium">완료됨</span>
      )
    }
  }

  return (
    <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
      <h2 className="text-xl font-bold text-gray-800 mb-4">주문 현황</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">주문이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div 
              key={order.id}
              className="bg-white rounded-lg p-4 border border-gray-200 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="text-gray-800 font-medium mb-1">
                  {order.date}
                </div>
                <div className="text-gray-700 mb-1">
                  {formatOrderItems(order.items)}
                </div>
                <div className="text-gray-800 font-semibold">
                  {order.total.toLocaleString()}원
                </div>
              </div>
              <div className="flex items-center">
                {getStatusButton(order)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderStatus
