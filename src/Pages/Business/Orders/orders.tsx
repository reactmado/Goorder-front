"use client"

import { useState, useEffect } from "react"
import { Info, Loader2, RefreshCw, Filter, Search, X } from "lucide-react"
import "./orders.css"
import Nav_2 from "../../../components/navbar copy/Navbar"
import {
  getOrders,
  updateOrderStatus,
  type Order,
  type OrderItem,
  type Ingredient,
  type OrderStatus,
} from "../../../service/orders_service"

interface UserData {
  id: string
  name: string
  email: string
}

const ORDER_STATUSES: (OrderStatus | "All")[] = [
  "All",
  "Pending",
  "In progress",
  "Cooked",
  "Out to delivery",
  "Delivered",
]

const STATE_TRANSITIONS: { [key in OrderStatus]?: OrderStatus | null } = {
  Pending: "In progress",
  "In progress": "Cooked",
  Cooked: "Out to delivery",
  "Out to delivery": "Delivered",
  Delivered: null,
  Canceled: null,
}

export default function AllOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "All">("All")
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [showDetailsPopup, setShowDetailsPopup] = useState<boolean>(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false)

  // Fetch orders based on selected status
  const fetchOrders = async (status?: OrderStatus | "All", showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const fetchedOrders = await getOrders(status === "All" ? undefined : status)

      const transformedOrders: Order[] = fetchedOrders.map((order: any) => ({
        ...order,
        status: order.status as OrderStatus,
        customerName: order.address
          ? `${order.address.street || ""}, ${order.address.city || ""}`.trim().replace(/^,\s*|,\s*$/g, "") ||
            "Unknown Customer"
          : "Unknown Customer",
        date: new Date(order.createdAt).toLocaleDateString(),
      }))

      setOrders(transformedOrders)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders")
      console.error("Error fetching orders:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Filter orders based on search term
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toString().includes(searchTerm.toLowerCase()) ||
      (order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Initial load
  useEffect(() => {
    fetchOrders(selectedStatus)
  }, [selectedStatus])

  // Refresh orders periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(selectedStatus)
    }, 60000)

    return () => clearInterval(interval)
  }, [selectedStatus])

  const handleStatusChange = (status: OrderStatus | "All") => {
    setSelectedStatus(status)
    setShowMobileFilters(false)
  }

  const handleUpdateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setShowDetailsPopup(false)
      setSelectedOrder(null)
      fetchOrders(selectedStatus)
    } catch (error) {
      console.error("Failed to update order status:", error)
      setError("Failed to update order status")
    }
  }

  const handleAccept = async (orderId: number) => {
    try {
      await handleUpdateOrderStatus(orderId, "In progress")
    } catch (error) {
      console.error("Failed to accept order:", error)
    }
  }

  const handleCancel = (orderId: number) => {
    setSelectedOrderId(orderId)
    setShowCancelDialog(true)
  }

  const confirmCancel = async () => {
    if (selectedOrderId !== null) {
      try {
        await handleUpdateOrderStatus(selectedOrderId, "Canceled")
        setShowCancelDialog(false)
        setSelectedOrderId(null)
      } catch (error) {
        console.error("Failed to cancel order:", error)
      }
    }
  }

  const handleDone = async (orderId: number) => {
    try {
      await handleUpdateOrderStatus(orderId, "Delivered")
    } catch (error) {
      console.error("Failed to complete order:", error)
    }
  }

  const handleViewDetails = (orderId: number) => {
    const order = orders.find((o) => o.id === orderId)
    setSelectedOrder(order || null)
    setShowDetailsPopup(true)
  }

  const closeDetailsPopup = () => {
    setShowDetailsPopup(false)
    setSelectedOrder(null)
  }

  const refreshOrders = () => {
    fetchOrders(selectedStatus, true)
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    return STATE_TRANSITIONS[currentStatus] || null
  }

  useEffect(() => {
    const userDataString = localStorage.getItem("user")
    if (userDataString) {
      try {
        const userData: UserData = JSON.parse(userDataString)
        console.log("User data loaded:", userData)
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error)
      }
    }
  }, [])

  const formatPrice = (price?: number): string => {
    return price ? price.toFixed(2) : "0.00"
  }

  const renderOrderTable = () => {
    if (error) {
      return (
        <div className="error-message" role="alert">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={refreshOrders} className="retry-button">
            Try Again
          </button>
        </div>
      )
    }

    if (loading && orders.length === 0) {
      return (
        <div className="loading-container" role="status" aria-live="polite">
          <div className="loading-spinner">
            <Loader2 className="animate-spin" size={32} aria-hidden="true" />
          </div>
          <p>Loading orders...</p>
        </div>
      )
    }

    if (filteredOrders.length === 0 && !loading) {
      return (
        <div className="no-orders-message" role="status">
          <div className="empty-icon">📋</div>
          <p>{searchTerm ? `No orders found matching "${searchTerm}"` : "No orders found for the selected status"}</p>
          <button onClick={refreshOrders} className="retry-button">
            Refresh
          </button>
        </div>
      )
    }

    return (
      <div className="orders-table-container" role="region" aria-labelledby="orders-table-caption">
        <div className="sr-only" id="orders-table-caption">
          Orders table showing {filteredOrders.length} orders with status {selectedStatus}
        </div>

        {loading && (
          <div className="loading-overlay" aria-live="polite" aria-busy="true">
            <Loader2 className="animate-spin" size={24} aria-hidden="true" />
            <span className="sr-only">Refreshing orders...</span>
          </div>
        )}

        <div className="table-wrapper">
          <table className="orders-table" role="table">
            <thead>
              <tr>
                <th scope="col">Order ID</th>
                <th scope="col">Customer</th>
                <th scope="col">Status</th>
                <th scope="col">Date</th>
                <th scope="col">Total</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={order.id} className="order-row" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td data-label="Order ID" className="order-id-cell">
                    <span className="order-id">#{order.id}</span>
                  </td>
                  <td data-label="Customer" className="customer-cell">
                    <span className="customer-name">{order.customerName || "Unknown Customer"}</span>
                  </td>
                  <td data-label="Status" className="status-cell">
                    <span className={`status-badge status-${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                      {order.status}
                    </span>
                  </td>
                  <td data-label="Date" className="date-cell">
                    {order.date}
                  </td>
                  <td data-label="Total" className="total-cell">
                    <span className="price">${order.totalPrice?.toFixed(2) || "0.00"}</span>
                  </td>
                  <td data-label="Actions" className="actions-cell">
                    <button
                      className="details-button"
                      onClick={() => handleViewDetails(order.id)}
                      aria-label={`View details for Order ${order.id}`}
                      title="View Order Details"
                    >
                      <Info size={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Nav_2 />

      <main className="content-area" role="main">
        {/* Header */}
        <header className="orders-header" role="banner">
          <div className="header-top">
            <h1 className="page-title">Orders</h1>
            <button
              className="refresh-button"
              onClick={refreshOrders}
              disabled={loading || refreshing}
              aria-label="Refresh orders"
              title="Refresh Orders"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
              <span className="button-text">Refresh</span>
            </button>
          </div>

          {/* Status Filters */}
          <nav className="status-filters" role="navigation" aria-label="Order status filters">
            <button
              className="mobile-filter-toggle"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              aria-label="Toggle filters"
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>

            <div className={`filter-buttons ${showMobileFilters ? "show-mobile" : ""}`}>
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  className={`status-filter-button ${selectedStatus === status ? "active" : ""}`}
                  onClick={() => handleStatusChange(status)}
                  aria-pressed={selectedStatus === status}
                  aria-label={`Filter orders by ${status} status`}
                >
                  {status}
                </button>
              ))}
            </div>
          </nav>
        </header>

        {/* Search Bar - moved outside header */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon2" />
              <input
                type="text"
                placeholder="Search orders by ID, customer, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="clear-search" aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="orders-count">
              {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="orders-content">{renderOrderTable()}</div>

        {/* Modals */}
        {showCancelDialog && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cancel-dialog-title">
            <div className="modal cancel-modal">
              <header className="modal-header">
                <h2 id="cancel-dialog-title">Cancel Order</h2>
                <button className="close-button" onClick={() => setShowCancelDialog(false)} aria-label="Close dialog">
                  <X size={20} />
                </button>
              </header>
              <div className="modal-body">
                <div className="modal-icon warning">⚠️</div>
                <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
              </div>
              <footer className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowCancelDialog(false)}>
                  Keep Order
                </button>
                <button className="btn-danger" onClick={confirmCancel}>
                  Cancel Order
                </button>
              </footer>
            </div>
          </div>
        )}

        {showDetailsPopup && selectedOrder && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="details-dialog-title">
            <div className="modal details-modal">
              <header className="modal-header">
                <h2 id="details-dialog-title">Order Details</h2>
                <button className="close-button" onClick={closeDetailsPopup} aria-label="Close details">
                  <X size={20} />
                </button>
              </header>

              <div className="modal-body">
                <div className="order-summary">
                  <div className="summary-item">
                    <span className="label">Order ID:</span>
                    <span className="value order-id">#{selectedOrder.id}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Customer:</span>
                    <span className="value">{selectedOrder.customerName || "Unknown Customer"}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Status:</span>
                    <span className={`status-badge status-${selectedOrder.status.toLowerCase().replace(/\s+/g, "-")}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Date:</span>
                    <span className="value">{selectedOrder.date}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Price:</span>
                    <span className="value price">${formatPrice(selectedOrder.totalPrice)}</span>
                  </div>
                  {selectedOrder.deliveryFee && selectedOrder.deliveryFee > 0 && (
                    <div className="summary-item">
                      <span className="label">Delivery Fee:</span>
                      <span className="value price">${formatPrice(selectedOrder.deliveryFee)}</span>
                    </div>
                  )}
                  <div className="summary-item">
                    <span className="label">Address:</span>
                    <span className="value">
                      {selectedOrder.address
                        ? `${selectedOrder.address.street}, ${selectedOrder.address.city}, ${selectedOrder.address.country}`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="order-items-section">
                    <h3>Items ({selectedOrder.items.length})</h3>
                    <div className="order-items">
                      {selectedOrder.items.map((item: OrderItem, index: number) => (
                        <div key={index} className="order-item">
                          <div className="item-header">
                            <h4 className="product-name">{item.product.name}</h4>
                            <span className="item-quantity">×{item.quantity}</span>
                          </div>
                          <div className="item-details">
                            <span className="item-price">${formatPrice(item.product.price)}</span>
                            <span className="item-subtotal">${formatPrice(item.product.price * item.quantity)}</span>
                          </div>
                          {item.product.ingredients && item.product.ingredients.length > 0 && (
                            <div className="ingredients">
                              <span className="ingredients-label">Ingredients:</span>
                              <ul className="ingredients-list">
                                {item.product.ingredients.map((ingredient: Ingredient) => (
                                  <li key={ingredient.id}>{ingredient.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="order-actions">
                  {selectedOrder.status === "Pending" && (
                    <button className="btn-primary" onClick={() => handleAccept(selectedOrder.id)}>
                      Accept Order
                    </button>
                  )}
                  {selectedOrder.status !== "Delivered" && selectedOrder.status !== "Canceled" && (
                    <button className="btn-danger" onClick={() => handleCancel(selectedOrder.id)}>
                      Cancel Order
                    </button>
                  )}
                  {selectedOrder.status === "Out to delivery" && (
                    <button className="btn-primary" onClick={() => handleDone(selectedOrder.id)}>
                      Mark as Delivered
                    </button>
                  )}
                </div>

                {getNextStatus(selectedOrder.status) && (
                  <div className="status-progression">
                    <h4>Move to Next Status</h4>
                    <button
                      className="btn-secondary status-update-button"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                    >
                      Move to {getNextStatus(selectedOrder.status)}
                    </button>
                  </div>
                )}

                {selectedOrder.status === "Delivered" && (
                  <div className="final-status">
                    <div className="status-icon">✅</div>
                    <p className="status-message">
                      This order has been delivered and cannot be moved to another state.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
