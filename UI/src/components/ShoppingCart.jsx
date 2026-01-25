function ShoppingCart({ items, total, onUpdateQuantity, onRemove, onOrder }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-300 shadow-lg z-40">
      <div className="container mx-auto px-4 py-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">장바구니</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* 아이템 리스트 */}
          <div className="flex-1">
            {items.length === 0 ? (
              <p className="text-gray-500">장바구니가 비어있습니다.</p>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div 
                    key={item.cartKey}
                    className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 mb-1">
                        {item.menuName}
                        {item.optionNames.length > 0 && (
                          <span className="text-gray-600 font-normal">
                            {' '}({item.optionNames.join(', ')})
                          </span>
                        )}
                        {' '}X {item.quantity}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right min-w-[100px]">
                        <div className="text-lg font-semibold text-gray-800">
                          {item.totalPrice.toLocaleString()}원
                        </div>
                        <div className="text-xs text-gray-500">
                          단가: {((item.basePrice + item.optionPrice)).toLocaleString()}원
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.cartKey, -1)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded font-bold"
                        >
                          -
                        </button>
                        <button
                          onClick={() => onUpdateQuantity(item.cartKey, 1)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded font-bold"
                        >
                          +
                        </button>
                        <button
                          onClick={() => onRemove(item.cartKey)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 총 금액 및 주문하기 버튼 */}
          <div className="md:w-64 flex flex-col gap-4">
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">총 금액</div>
              <div className="text-2xl font-bold text-gray-800">
                {total.toLocaleString()}원
              </div>
            </div>
            
            <button
              onClick={onOrder}
              disabled={items.length === 0}
              className={`w-full py-3 px-4 rounded font-medium transition-colors ${
                items.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              주문하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShoppingCart
