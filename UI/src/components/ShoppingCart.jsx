function ShoppingCart({ items, total, onUpdateQuantity, onRemove, onOrder, getStock }) {
  const hasOutOfStockItems = items.some(item => {
    const stock = getStock(item.menuId)
    return stock === 0 || item.quantity > stock
  })

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-300 shadow-lg z-40">
      <div className="container mx-auto px-4 py-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">장바구니</h2>
        
        {hasOutOfStockItems && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            ⚠️ 장바구니에 품절되거나 재고가 부족한 상품이 있습니다. 주문하기 전에 확인해주세요.
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* 아이템 리스트 */}
          <div className="flex-1">
            {items.length === 0 ? (
              <p className="text-gray-500">장바구니가 비어있습니다.</p>
            ) : (
              <div className="space-y-2">
                {items.map(item => {
                  const stock = getStock(item.menuId)
                  const isOutOfStock = stock === 0
                  const isInsufficientStock = item.quantity > stock
                  const hasStockIssue = isOutOfStock || isInsufficientStock
                  
                  return (
                    <div 
                      key={item.cartKey}
                      className={`flex items-center justify-between p-3 rounded border ${
                        hasStockIssue 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`font-medium ${hasStockIssue ? 'text-red-800' : 'text-gray-800'}`}>
                            {item.menuName}
                            {item.optionNames.length > 0 && (
                              <span className="text-gray-600 font-normal">
                                {' '}({item.optionNames.join(', ')})
                              </span>
                            )}
                            {' '}X {item.quantity}
                          </div>
                          {isOutOfStock && (
                            <span className="text-red-600 font-semibold text-xs">품절</span>
                          )}
                          {isInsufficientStock && (
                            <span className="text-red-600 font-semibold text-xs">
                              재고 부족 (재고: {stock}개)
                            </span>
                          )}
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
              disabled={items.length === 0 || hasOutOfStockItems}
              className={`w-full py-3 px-4 rounded font-medium transition-colors ${
                items.length === 0 || hasOutOfStockItems
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {hasOutOfStockItems ? '주문 불가 (재고 확인 필요)' : '주문하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShoppingCart
