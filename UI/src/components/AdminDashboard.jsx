function AdminDashboard({ stats }) {
  return (
    <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
      <h2 className="text-xl font-bold text-gray-800 mb-4">관리자 대시보드</h2>
      <div className="text-gray-700">
        총 주문 {stats.total} / 주문 접수 {stats.received} / 제조 중 {stats.preparing} / 제조 완료 {stats.completed}
      </div>
    </div>
  )
}

export default AdminDashboard
