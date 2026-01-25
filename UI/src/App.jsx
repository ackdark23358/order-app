import { useState } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import AdminDashboard from './components/AdminDashboard'
import InventoryStatus from './components/InventoryStatus'
import OrderStatus from './components/OrderStatus'
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
  const [currentView, setCurrentView] = useState('order') // 'order' or 'admin'
  const [cartItems, setCartItems] = useState([])
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([
    { id: 1, name: '아메리카노(ICE)', stock: 10 },
    { id: 2, name: '아메리카노(HOT)', stock: 10 },
    { id: 3, name: '카페라떼', stock: 10 },
    { id: 4, name: '카푸치노', stock: 10 },
    { id: 5, name: '카라멜 마키아토', stock: 10 },
    { id: 6, name: '바닐라 라떼', stock: 10 }
  ])

  const getStock = (menuId) => {
    const inventoryItem = inventory.find(inv => inv.id === menuId)
    return inventoryItem ? inventoryItem.stock : 999 // 재고 정보가 없으면 충분히 있다고 가정
  }

  const addToCart = (menuItem, selectedOptions) => {
    const stock = getStock(menuItem.id)
    
    // 재고가 0이면 주문 불가
    if (stock === 0) {
      alert('품절된 상품입니다. 주문할 수 없습니다.')
      return
    }
    
    const optionIds = selectedOptions.sort().join(',')
    const cartKey = `${menuItem.id}-${optionIds}`
    
    const existingItem = cartItems.find(item => item.cartKey === cartKey)
    
    if (existingItem) {
      // 장바구니에 이미 있는 경우, 재고를 확인
      const currentQuantity = existingItem.quantity
      if (currentQuantity + 1 > stock) {
        alert(`재고가 부족합니다. (현재 재고: ${stock}개)`)
        return
      }
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
        
        // 재고 확인
        const stock = getStock(item.menuId)
        if (change > 0 && newQuantity > stock) {
          alert(`재고가 부족합니다. (현재 재고: ${stock}개)`)
          return item
        }
        
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
    
    // 주문 전 재고 검증
    const stockIssues = []
    for (const item of cartItems) {
      const stock = getStock(item.menuId)
      if (stock === 0) {
        stockIssues.push(`${item.menuName} - 품절`)
      } else if (item.quantity > stock) {
        stockIssues.push(`${item.menuName} - 재고 부족 (현재 재고: ${stock}개, 주문 수량: ${item.quantity}개)`)
      }
    }
    
    if (stockIssues.length > 0) {
      alert(`주문할 수 없는 상품이 있습니다:\n\n${stockIssues.join('\n')}\n\n장바구니를 확인해주세요.`)
      return
    }
    
    // 주문 생성
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const hours = now.getHours()
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const orderDate = `${month}월 ${day}일 ${hours}:${minutes}`
    
    const newOrder = {
      id: Date.now(),
      date: orderDate,
      items: [...cartItems],
      total: calculateTotal(),
      status: 'received' // 'received', 'preparing', 'completed'
    }
    
    // 주문 성공 시 재고 차감
    const updatedInventory = [...inventory]
    cartItems.forEach(cartItem => {
      const inventoryIndex = updatedInventory.findIndex(inv => inv.id === cartItem.menuId)
      if (inventoryIndex !== -1) {
        updatedInventory[inventoryIndex].stock -= cartItem.quantity
        if (updatedInventory[inventoryIndex].stock < 0) {
          updatedInventory[inventoryIndex].stock = 0
        }
      }
    })
    
    setInventory(updatedInventory)
    setOrders([newOrder, ...orders])
    alert(`주문이 완료되었습니다!\n총 금액: ${calculateTotal().toLocaleString()}원`)
    setCartItems([])
  }

  const updateInventory = (menuId, change) => {
    setInventory(inventory.map(item => {
      if (item.id === menuId) {
        const newStock = item.stock + change
        return { ...item, stock: Math.max(0, newStock) }
      }
      return item
    }))
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  const getOrderStats = () => {
    const total = orders.length
    const received = orders.filter(o => o.status === 'received').length
    const preparing = orders.filter(o => o.status === 'preparing').length
    const completed = orders.filter(o => o.status === 'completed').length
    return { total, received, preparing, completed }
  }

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-white">
        <Header currentView={currentView} onViewChange={setCurrentView} />
        <div className="container mx-auto px-4 py-6 space-y-6">
          <AdminDashboard stats={getOrderStats()} />
          <InventoryStatus 
            inventory={inventory} 
            onUpdateInventory={updateInventory}
          />
          <OrderStatus 
            orders={orders}
            onUpdateStatus={updateOrderStatus}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 pb-80 px-4 py-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => {
              const stock = getStock(item.id)
              return (
                <MenuCard 
                  key={item.id} 
                  menuItem={item}
                  stock={stock}
                  onAddToCart={addToCart}
                />
              )
            })}
          </div>
        </div>
      </main>

      <ShoppingCart
        items={cartItems}
        total={calculateTotal()}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onOrder={handleOrder}
        getStock={getStock}
      />
    </div>
  )
}

export default App
