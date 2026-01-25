import { useState } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import './App.css'

// 임의의 커피 메뉴 데이터
const menuItems = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '에스프레소에 물을 넣어 만든 시원한 아메리카노',
    image: null,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '에스프레소에 뜨거운 물을 넣어 만든 따뜻한 아메리카노',
    image: null,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '에스프레소와 부드러운 우유가 만나 만든 라떼',
    image: null,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 },
      { id: 'whipped', name: '휘핑크림 추가', price: 500 }
    ]
  },
  {
    id: 4,
    name: '카푸치노',
    price: 5000,
    description: '에스프레소와 우유 거품이 조화로운 카푸치노',
    image: null,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'cinnamon', name: '시나몬 추가', price: 0 }
    ]
  },
  {
    id: 5,
    name: '카라멜 마키아토',
    price: 6000,
    description: '카라멜 시럽과 에스프레소가 만난 달콤한 음료',
    image: null,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'extra_caramel', name: '카라멜 추가', price: 500 }
    ]
  },
  {
    id: 6,
    name: '바닐라 라떼',
    price: 5500,
    description: '바닐라 시럽이 들어간 부드러운 라떼',
    image: null,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 }
    ]
  }
]

function App() {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (menuItem, selectedOptions) => {
    const optionIds = selectedOptions.sort().join(',')
    const cartKey = `${menuItem.id}-${optionIds}`
    
    const existingItem = cartItems.find(item => item.cartKey === cartKey)
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.cartKey === cartKey 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      const optionNames = selectedOptions.map(optId => {
        const option = menuItem.options.find(o => o.id === optId)
        return option ? option.name : ''
      }).filter(Boolean)
      
      const optionPrice = selectedOptions.reduce((sum, optId) => {
        const option = menuItem.options.find(o => o.id === optId)
        return sum + (option ? option.price : 0)
      }, 0)
      
      const newItem = {
        cartKey,
        menuId: menuItem.id,
        menuName: menuItem.name,
        basePrice: menuItem.price,
        optionPrice,
        optionNames,
        quantity: 1,
        totalPrice: menuItem.price + optionPrice
      }
      
      setCartItems([...cartItems, newItem])
    }
  }

  const updateQuantity = (cartKey, change) => {
    setCartItems(cartItems.map(item => {
      if (item.cartKey === cartKey) {
        const newQuantity = item.quantity + change
        if (newQuantity <= 0) return null
        return { ...item, quantity: newQuantity, totalPrice: (item.basePrice + item.optionPrice) * newQuantity }
      }
      return item
    }).filter(Boolean))
  }

  const removeFromCart = (cartKey) => {
    setCartItems(cartItems.filter(item => item.cartKey !== cartKey))
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const handleOrder = () => {
    if (cartItems.length === 0) return
    
    alert(`주문이 완료되었습니다!\n총 금액: ${calculateTotal().toLocaleString()}원`)
    setCartItems([])
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 pb-80 px-4 py-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <MenuCard 
                key={item.id} 
                menuItem={item}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>
      </main>

      <ShoppingCart
        items={cartItems}
        total={calculateTotal()}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onOrder={handleOrder}
      />
    </div>
  )
}

export default App
