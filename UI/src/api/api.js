// API 기본 URL 설정 (환경 변수 또는 기본값)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://order-app-backend2.onrender.com/api'

// API 호출 헬퍼 함수
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'API 요청 실패')
    }

    return data
  } catch (error) {
    console.error('API 요청 오류:', error)
    throw error
  }
}

// 메뉴 관련 API
export const menuAPI = {
  // 메뉴 목록 조회
  getMenus: () => apiRequest('/menus'),
  
  // 메뉴 상세 조회
  getMenu: (id) => apiRequest(`/menus/${id}`),
  
  // 재고 수정
  updateStock: (id, change) => apiRequest(`/menus/${id}/stock`, {
    method: 'PUT',
    body: JSON.stringify({ change })
  })
}

// 주문 관련 API
export const orderAPI = {
  // 주문 생성
  createOrder: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  
  // 주문 목록 조회
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`)
  },
  
  // 주문 상세 조회
  getOrder: (id) => apiRequest(`/orders/${id}`),
  
  // 주문 상태 변경
  updateOrderStatus: (id, status) => apiRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  })
}

// 통계 관련 API
export const statsAPI = {
  // 주문 통계 조회
  getOrderStats: () => apiRequest('/stats/orders')
}

export default {
  menuAPI,
  orderAPI,
  statsAPI
}
