// API 기본 URL 설정 (환경 변수 또는 기본값)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://order-app-backend2.onrender.com/api'

// API 호출 헬퍼 함수
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const contentType = response.headers.get('content-type')
    const isJson = contentType && contentType.includes('application/json')
    const data = isJson ? await response.json() : { error: `응답이 JSON이 아닙니다 (${response.status})` }

    if (!response.ok) {
      throw new Error(data.error || `API 요청 실패 (${response.status})`)
    }

    return data
  } catch (error) {
    console.error('API 요청 오류:', error.message, url)
    throw error
  }
}

// 배포 환경에서 사용 중인 API 주소 확인용
export const getApiBaseUrl = () => API_BASE_URL

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
