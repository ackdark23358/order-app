import { useState } from 'react'

function MenuCard({ menuItem, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([])

  const toggleOption = (optionId) => {
    setSelectedOptions(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    )
  }

  const calculatePrice = () => {
    const optionPrice = selectedOptions.reduce((sum, optId) => {
      const option = menuItem.options.find(o => o.id === optId)
      return sum + (option ? option.price : 0)
    }, 0)
    return menuItem.price + optionPrice
  }

  const handleAddToCart = () => {
    onAddToCart(menuItem, selectedOptions)
    setSelectedOptions([])
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* 이미지 플레이스홀더 */}
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center border-b border-gray-300">
        <div className="text-gray-400 text-4xl">☕</div>
      </div>

      <div className="p-4">
        {/* 메뉴 이름 */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {menuItem.name}
        </h3>

        {/* 가격 */}
        <p className="text-lg font-semibold text-gray-800 mb-2">
          {calculatePrice().toLocaleString()}원
        </p>

        {/* 설명 */}
        <p className="text-sm text-gray-500 mb-4">
          {menuItem.description}
        </p>

        {/* 커스터마이징 옵션 */}
        <div className="space-y-2 mb-4">
          {menuItem.options.map(option => (
            <label 
              key={option.id}
              className="flex items-center cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.id)}
                onChange={() => toggleOption(option.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {option.name} {option.price > 0 && `(+${option.price.toLocaleString()}원)`}
              </span>
            </label>
          ))}
        </div>

        {/* 담기 버튼 */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium transition-colors"
        >
          담기
        </button>
      </div>
    </div>
  )
}

export default MenuCard
