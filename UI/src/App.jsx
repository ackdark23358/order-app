// 백엔드 API: https://order-app-backend2.onrender.com
import { useState, useEffect } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import AdminDashboard from './components/AdminDashboard'
import InventoryStatus from './components/InventoryStatus'
import OrderStatus from './components/OrderStatus'
import { menuAPI, orderAPI, statsAPI, getApiBaseUrl } from './api/api.js'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('order') // 'order' or 'admin'
  const [cartItems, setCartItems] = useState([])
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // 통계를 위한 상태
  const [stats, setStats] = useState({ total: 0, received: 0, preparing: 0, completed: 0 })

  // 메뉴 목록 로드
  useEffect(() => {
    loadMenus()
  }, [])

  // 관리자 화면일 때 주문 목록 및 통계 로드
  useEffect(() => {
    if (currentView === 'admin') {
      loadOrders()
      loadStats()
    }
  }, [currentView])

  // 주문 목록 주기적 갱신 (관리자 화면)
  useEffect(() => {
    if (currentView === 'admin') {
      const interval = setInterval(() => {
        loadOrders()
        loadStats()
      }, 5000) // 5초마다 갱신
      return () => clearInterval(interval)
    }
  }, [currentView])

  const loadMenus = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await menuAPI.getMenus()
      const raw = Array.isArray(response?.data) ? response.data : []
      // 백엔드 응답 정규화: id/price/stock를 숫자로, options 배열 보장 (타입 불일치로 재고 0 되는 것 방지)
      const list = raw.map(menu => ({
        ...menu,
        id: Number(menu.id),
        price: Number(menu.price),
        stock: Number(menu.stock ?? 0),
        options: Array.isArray(menu.options)
          ? menu.options.map(opt => ({
              id: Number(opt.id),
              name: opt.name,
              price: Number(opt.price ?? 0)
            }))
          : []
      }))
      setMenuItems(list)

      const inventoryData = list.map(menu => ({
        id: menu.id,
        name: menu.name,
        stock: menu.stock
      }))
      setInventory(inventoryData)
    } catch (err) {
      console.error('메뉴 로드 오류:', err)
      setError('메뉴를 불러오는 중 오류가 발생했습니다. (백엔드 연결을 확인하세요.)')
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getOrders()
      const list = Array.isArray(response?.data) ? response.data : []
      const formattedOrders = list.map(order => {
        const date = new Date(order.order_date)
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hours = date.getHours()
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const orderDate = `${month}월 ${day}일 ${hours}:${minutes}`
        const items = Array.isArray(order.items) ? order.items : []
        return {
          id: order.id,
          date: orderDate,
          items: items.map(item => ({
            menuId: item.menu_id ?? item.menuId,
            menuName: item.menu_name ?? '',
            quantity: item.quantity ?? 0,
            optionNames: item.option_names ?? [],
            totalPrice: item.total_price ?? 0
          })),
          total: order.total_amount ?? 0,
          status: order.status ?? 'received'
        }
      })
      setOrders(formattedOrders)
    } catch (err) {
      console.error('주문 목록 로드 오류:', err)
      setOrders([])
    }
  }

  const loadStats = async () => {
    try {
      const response = await statsAPI.getOrderStats()
      const d = response?.data
      setStats({
        total: Number(d?.total) ?? 0,
        received: Number(d?.received) ?? 0,
        preparing: Number(d?.preparing) ?? 0,
        completed: Number(d?.completed) ?? 0
      })
    } catch (err) {
      console.error('통계 조회 오류:', err)
      setStats({ total: 0, received: 0, preparing: 0, completed: 0 })
    }
  }

  const getStock = (menuId) => {
    const id = Number(menuId)
    const inventoryItem = inventory.find(inv => Number(inv.id) === id)
    return inventoryItem != null ? Number(inventoryItem.stock) : 0
  }

  const addToCart = (menuItem, selectedOptions) => {
    const stock = getStock(menuItem.id)
    
    // 재고가 0이면 주문 불가
    if (stock === 0) {
      alert('품절된 상품입니다. 주문할 수 없습니다.')
      return
    }
    
    // 옵션 ID를 숫자 배열로 변환 (API 형식에 맞춤)
    // selectedOptions는 옵션 ID 배열
    const optionIds = selectedOptions.map(optId => {
      // optId가 이미 숫자면 그대로 사용, 아니면 옵션에서 찾기
      if (typeof optId === 'number') {
        return optId
      }
      const option = menuItem.options.find(o => o.id === optId)
      return option ? option.id : null
    }).filter(id => id !== null && id !== undefined)
    
    const optionIdsKey = optionIds.sort((a, b) => a - b).join(',')
    const cartKey = `${menuItem.id}-${optionIdsKey}`
    
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
        optionIds, // API 전송용 (숫자 배열)
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

  const handleOrder = async () => {
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
    
    try {
      // API 형식으로 주문 데이터 변환
      const orderItems = cartItems.map(item => ({
        menu_id: item.menuId,
        quantity: item.quantity,
        option_ids: item.optionIds || [],
        unit_price: item.basePrice + item.optionPrice,
        total_price: item.totalPrice
      }))

      const orderData = {
        items: orderItems,
        total_amount: calculateTotal()
      }

      // API 호출
      const response = await orderAPI.createOrder(orderData)
      
      // 주문 성공 시 재고 정보 갱신
      await loadMenus()
      
      // 관리자 화면이면 주문 목록도 갱신
      if (currentView === 'admin') {
        await loadOrders()
      }
      
      alert(`주문이 완료되었습니다!\n총 금액: ${calculateTotal().toLocaleString()}원`)
      setCartItems([])
    } catch (err) {
      console.error('주문 생성 오류:', err)
      if (err.message.includes('재고가 부족')) {
        alert(`주문 실패: ${err.message}\n\n재고를 확인해주세요.`)
      } else {
        alert(`주문 생성 중 오류가 발생했습니다: ${err.message}`)
      }
      // 재고 정보 갱신
      await loadMenus()
    }
  }

  const updateInventory = async (menuId, change) => {
    try {
      await menuAPI.updateStock(menuId, change)
      // 재고 정보 갱신
      await loadMenus()
    } catch (err) {
      console.error('재고 수정 오류:', err)
      alert(`재고 수정 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus)
      // 주문 목록 갱신
      await loadOrders()
      await loadStats()
    } catch (err) {
      console.error('주문 상태 변경 오류:', err)
      alert(`주문 상태 변경 중 오류가 발생했습니다: ${err.message}`)
    }
  }


  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-white">
        <Header currentView={currentView} onViewChange={setCurrentView} />
        <div className="container mx-auto px-4 py-6 space-y-6 pb-12">
          <AdminDashboard stats={stats} />
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">메뉴를 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-red-600 text-center">{error}</div>
        <button
          type="button"
          onClick={() => { setError(null); loadMenus() }}
          className="px-5 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 pb-80 px-4 py-6">
        <div className="container mx-auto">
          {menuItems.length === 0 && (
            <div className="text-center py-12 px-4 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 max-w-lg mx-auto">
              <p className="font-semibold text-gray-800">메뉴가 없습니다</p>
              <p className="text-sm mt-2">백엔드 연결 또는 DB 초기 데이터를 확인하세요.</p>
              <p className="text-xs mt-3 text-gray-500 break-all">연결 API: {getApiBaseUrl().replace(/\/api\/?$/, '')}</p>
              <button
                type="button"
                onClick={loadMenus}
                className="mt-4 px-5 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600"
              >
                다시 불러오기
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.filter(Boolean).map(item => {
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
