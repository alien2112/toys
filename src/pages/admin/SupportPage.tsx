import React, { useState, useEffect } from 'react'
import { MessageSquare, User, Clock, AlertCircle, CheckCircle, XCircle, Search, Filter } from 'lucide-react'
import { apiService } from '../../services/api'
import './SupportPage.css'

interface SupportTicket {
  id: number
  ticket_number: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  created_at: string
  first_name: string
  last_name: string
  user_email: string
  reply_count: number
  assigned_to?: number
  replies?: TicketReply[]
}

interface TicketReply {
  id: number
  message: string
  is_admin: boolean
  created_at: string
  first_name?: string
  last_name?: string
}

interface SupportCategory {
  id: number
  name: string
  description: string
  color: string
}

const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [categories, setCategories] = useState<SupportCategory[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    loadTickets()
    loadCategories()
    loadStats()
  }, [statusFilter, categoryFilter])

  const loadTickets = async () => {
    try {
      setLoading(true)
      let url = '/admin/support/tickets'
      const params = new URLSearchParams()
      
      if (statusFilter) params.append('status', statusFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      
      if (params.toString()) {
        url += '?' + params.toString()
      }
      
      const response = await apiService.get(url)
      setTickets(response || [])
    } catch (err) {
      console.error('Error loading tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await apiService.get('/support/categories')
      setCategories(response || [])
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiService.get('/admin/support/stats')
      setStats(response || {})
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const loadTicketDetails = async (ticketId: number) => {
    try {
      const response = await apiService.get(`/admin/support/tickets/${ticketId}`)
      setSelectedTicket(response)
    } catch (err) {
      console.error('Error loading ticket details:', err)
    }
  }

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return

    try {
      await apiService.post(`/admin/support/tickets/${selectedTicket.id}/replies`, {
        message: replyText
      })
      
      setReplyText('')
      loadTicketDetails(selectedTicket.id)
      loadTickets()
    } catch (err) {
      console.error('Error sending reply:', err)
    }
  }

  const updateTicketStatus = async (status: string) => {
    if (!selectedTicket) return

    try {
      await apiService.put(`/admin/support/tickets/${selectedTicket.id}/status`, {
        status
      })
      
      loadTicketDetails(selectedTicket.id)
      loadTickets()
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#EF4444'
      case 'in_progress': return '#F59E0B'
      case 'waiting_customer': return '#3B82F6'
      case 'resolved': return '#10B981'
      case 'closed': return '#6B7280'
      default: return '#6B7280'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#DC2626'
      case 'high': return '#EA580C'
      case 'medium': return '#D97706'
      case 'low': return '#65A30D'
      default: return '#6B7280'
    }
  }

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="support-page">
      <div className="support-header">
        <h1>Customer Support</h1>
        <div className="header-stats">
          <div className="stat-item">
            <MessageSquare size={20} />
            <span>{stats.total_tickets || 0} Total</span>
          </div>
          <div className="stat-item">
            <AlertCircle size={20} />
            <span>{stats.open_tickets || 0} Open</span>
          </div>
          <div className="stat-item">
            <CheckCircle size={20} />
            <span>{stats.resolved_tickets || 0} Resolved</span>
          </div>
        </div>
      </div>

      <div className="support-content">
        <div className="tickets-section">
          <div className="section-header">
            <h2>Support Tickets</h2>
            <div className="filters">
              <div className="search-bar">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_customer">Waiting Customer</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading tickets...</div>
          ) : (
            <div className="tickets-list">
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className={`ticket-item ${selectedTicket?.id === ticket.id ? 'selected' : ''}`}
                  onClick={() => loadTicketDetails(ticket.id)}
                >
                  <div className="ticket-header">
                    <div className="ticket-number">{ticket.ticket_number}</div>
                    <div className="ticket-meta">
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                      >
                        {ticket.priority}
                      </span>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(ticket.status) }}
                      >
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="ticket-subject">{ticket.subject}</div>
                  <div className="ticket-info">
                    <div className="customer-info">
                      <User size={16} />
                      <span>{ticket.first_name} {ticket.last_name}</span>
                    </div>
                    <div className="time-info">
                      <Clock size={16} />
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="reply-count">
                      <MessageSquare size={16} />
                      <span>{ticket.reply_count} replies</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedTicket && (
          <div className="ticket-details">
            <div className="ticket-header-details">
              <div className="ticket-title">
                <h3>{selectedTicket.subject}</h3>
                <span className="ticket-number">{selectedTicket.ticket_number}</span>
              </div>
              <div className="ticket-actions">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => updateTicketStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_customer">Waiting Customer</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="ticket-customer">
              <div className="customer-details">
                <h4>Customer</h4>
                <p>{selectedTicket.first_name} {selectedTicket.last_name}</p>
                <p>{selectedTicket.user_email}</p>
              </div>
              <div className="ticket-meta-details">
                <div>
                  <strong>Category:</strong> {selectedTicket.category}
                </div>
                <div>
                  <strong>Priority:</strong> {selectedTicket.priority}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(selectedTicket.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="ticket-description">
              <h4>Description</h4>
              <p>{selectedTicket.description}</p>
            </div>

            <div className="ticket-conversation">
              <h4>Conversation</h4>
              <div className="replies-list">
                {selectedTicket.replies?.map(reply => (
                  <div
                    key={reply.id}
                    className={`reply ${reply.is_admin ? 'admin-reply' : 'customer-reply'}`}
                  >
                    <div className="reply-header">
                      <span className="reply-author">
                        {reply.is_admin 
                          ? `Support Agent (${reply.first_name} ${reply.last_name})`
                          : `${selectedTicket.first_name} ${selectedTicket.last_name}`
                        }
                      </span>
                      <span className="reply-time">
                        {new Date(reply.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="reply-message">{reply.message}</div>
                  </div>
                ))}
              </div>

              <div className="reply-form">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="send-reply-button"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SupportPage
