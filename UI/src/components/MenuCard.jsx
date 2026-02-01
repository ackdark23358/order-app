import { useState, useEffect } from 'react'

function MenuCard({ menuItem, stock, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([])
  const [imageError, setImageError] = useState(false)
  const [imageSrc, setImageSrc] = useState(null)

  // 이미지 경로 찾기 (여러 확장자 시도)
  useEffect(() => {
    if (menuItem.image_url) {
      setImageSrc(menuItem.image_url)
      return
    }

    // 여러 확장자를 시도
    const extensions = ['jpg', 'jpeg', 'png', 'webp']
    const menuId = menuItem.id
    
    // 첫 번째로 시도할 이미지 경로 설정
    setImageSrc(`/images/menu-${menuId}.jpg`)
  }, [menuItem])

  const toggleOption = (optionId) => {
    setSelectedOptions(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    )
  }

  const options = Array.isArray(menuItem.options) ? menuItem.options : []

  const calculatePrice = () => {
    const optionPrice = selectedOptions.reduce((sum, optId) => {
      const option = options.find(o => Number(o.id) === Number(optId))
      return sum + (option ? Number(option.price) : 0)
    }, 0)
    return Number(menuItem.price) + optionPrice
  }

  const handleAddToCart = () => {
    if (stock === 0) {
      alert('품절된 상품입니다. 주문할 수 없습니다.')
      return
    }
    onAddToCart(menuItem, selectedOptions)
    setSelectedOptions([])
  }

  const isOutOfStock = stock === 0

  // 이미지 로드 실패 시 다른 확장자 시도
  const handleImageError = () => {
    if (imageError) return // 이미 시도했으면 중단
    
    const extensions = ['jpg', 'jpeg', 'png', 'webp']
    const menuId = menuItem.id
    const currentSrc = imageSrc || ''
    
    // 현재 확장자 찾기
    const currentExt = currentSrc.split('.').pop()?.toLowerCase()
    const currentIndex = extensions.indexOf(currentExt)
    
    // 다음 확장자 시도
    if (currentIndex < extensions.length - 1) {
      const nextExt = extensions[currentIndex + 1]
      setImageSrc(`/images/menu-${menuId}.${nextExt}`)
    } else {
      // 모든 확장자 시도 실패
      setImageError(true)
    }
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* 이미지 */}
      <div className="w-full h-48 bg-gray-100 border-b border-gray-300 relative overflow-hidden">
        {imageSrc && !imageError ? (
          <img 
            src={imageSrc}
            alt={menuItem.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-400 text-4xl">☕</div>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* 메뉴 이름 */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">
            {menuItem.name}
          </h3>
          {isOutOfStock && (
            <span className="text-red-600 font-semibold text-sm">품절</span>
          )}
        </div>

        {/* 가격 */}
        <p className={`text-lg font-semibold mb-2 ${isOutOfStock ? 'text-gray-400' : 'text-gray-800'}`}>
          {calculatePrice().toLocaleString()}원
        </p>

        {/* 설명 */}
        {(menuItem.description != null && menuItem.description !== '') && (
          <p className="text-sm text-gray-500 mb-4">
            {menuItem.description}
          </p>
        )}

        {/* 커스터마이징 옵션 */}
        <div className="space-y-2 mb-4">
          {options.map(option => (
            <label 
              key={option.id}
              className={`flex items-center ${isOutOfStock ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <input
                type="checkbox"
                checked={selectedOptions.some(id => Number(id) === Number(option.id))}
                onChange={() => toggleOption(option.id)}
                disabled={isOutOfStock}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <span className={`ml-2 text-sm ${isOutOfStock ? 'text-gray-400' : 'text-gray-700'}`}>
                {option.name} {Number(option.price) > 0 && `(+${Number(option.price).toLocaleString()}원)`}
              </span>
            </label>
          ))}
        </div>

        {/* 담기 버튼 */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full py-2 px-4 rounded font-medium transition-colors ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isOutOfStock ? '품절' : '담기'}
        </button>
      </div>
    </div>
  )
}

export default MenuCard
