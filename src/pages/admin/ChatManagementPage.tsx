import React, { useState, useEffect } from 'react'
import { MessageSquare, Users, Clock, TrendingUp, User, HeadphonesIcon } from 'lucide-react'
import { apiService } from '../../services/api'
import { websocketService } from '../../services/websocket'
import './ChatManagementPage.css'

interface ChatSession {
  id: number
  session_id: string
  user_id?: number
  first_name?: string
  last_name?: string
  email?: string
  visitor_ip: string
  status: 'active' | 'ended' | 'transferred'
  assigned_agent?: number
  agent_first_name?: string
  agent_last_name?: string
  started_at: string
  message_count: number
  unread_count: number
}

interface ChatMessage {
  id: number
  message: string
  sender_type: 'user' | 'agent' | 'system'
  sender_id?: number
  created_at: string
  is_read: boolean
  first_name?: string
  last_name?: string
}

interface ChatStats {
  total_sessions: number
  active_sessions: number
  ended_sessions: number
  today_sessions: number
  registered_user_sessions: number
  guest_sessions: number
  avg_duration_minutes: number
}

const ChatManagementPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [stats, setStats] = useState<ChatStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    loadSessions()
    loadStats()
    
    // Set up WebSocket listeners
    const handleNewMessage = (data: any) => {
      // Update messages if this is the current session
      if (selectedSession && data.session_id === selectedSession.session_id) {
        setMessages(prev => [...prev, data])
      }
    }

    const handleMessagesLoaded = (data: any) => {
      // Update messages if this is the current session (for polling)
      if (selectedSession) {
        setMessages(data || [])
      }
    }

    const handleUserJoined = (userInfo: any) => {
      // Update session list when user joins
      loadSessions()
    }

    const handleUserLeft = () => {
      // Update session list when user leaves
      loadSessions()
    }

    const handleOpen = (data: any) => {
      if (data.usingWebSockets) {
        console.log('Admin connected via WebSocket')
      } else {
        console.log('Admin connected via HTTP polling')
      }
    }

    websocketService.on('newMessage', handleNewMessage)
    websocketService.on('messagesLoaded', handleMessagesLoaded)
    websocketService.on('userJoined', handleUserJoined)
    websocketService.on('userLeft', handleUserLeft)
    websocketService.on('open', handleOpen)

    return () => {
      websocketService.off('newMessage', handleNewMessage)
      websocketService.off('messagesLoaded', handleMessagesLoaded)
      websocketService.off('userJoined', handleUserJoined)
      websocketService.off('userLeft', handleUserLeft)
      websocketService.off('open', handleOpen)
    }
  }, [selectedSession])

  useEffect(() => {
    // Connect to WebSocket when session is selected
    if (selectedSession) {
      websocketService.connect(
        selectedSession.session_id,
        1, // Admin ID (should come from auth)
        true // Is admin
      )
      
      // Load initial messages
      loadMessages(selectedSession.session_id)
    } else {
      // Disconnect when no session selected
      websocketService.disconnect()
    }
    
    return () => {
      websocketService.disconnect()
    }
  }, [selectedSession])

  const loadSessions = async () => {
    try {
      const response = await apiService.get('/admin/chat/sessions')
      setSessions(response || [])
    } catch (err) {
      console.error('Error loading sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiService.get('/admin/chat/stats')
      setStats(response || {})
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await apiService.get(`/chat/sessions/${sessionId}/messages`)
      setMessages(response || [])
    } catch (err) {
      console.error('Error loading messages:', err)
    }
  }

  const sendMessage = () => {
    if (!messageText.trim() || !selectedSession) return

    const message = messageText.trim()
    setMessageText('')

    // Send via WebSocket
    websocketService.sendMessage(message)

    // Add message to local state immediately
    const tempMessage: ChatMessage = {
      id: Date.now(),
      message,
      sender_type: 'agent',
      created_at: new Date().toISOString(),
      is_read: true
    }
    setMessages(prev => [...prev, tempMessage])
  }

  const assignToSelf = async () => {
    if (!selectedSession) return

    try {
      // Get current user ID (this would come from auth context)
      const adminId = 1 // Placeholder - should come from auth
      await apiService.put(`/admin/chat/sessions/${selectedSession.session_id}/assign`, {
        agent_id: adminId
      })
      
      loadSessions()
    } catch (err) {
      console.error('Error assigning session:', err)
    }
  }

  const endSession = async () => {
    if (!selectedSession) return

    try {
      await apiService.put(`/chat/sessions/${selectedSession.session_id}/end`)
      setSelectedSession(null)
      setMessages([])
      loadSessions()
    } catch (err) {
      console.error('Error ending session:', err)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDuration = (startedAt: string) => {
    const start = new Date(startedAt)
    const now = new Date()
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000 / 60)
    
    if (diff < 60) return `${diff}m`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ${diff % 60}m`
    return `${Math.floor(diff / 1440)}d ${Math.floor((diff % 1440) / 60)}h`
  }

  return (
    <div className="chat-management-page">
      <div className="chat-header">
        <h1>Live Chat Management</h1>
        <div className="header-stats">
          <div className="stat-item">
            <MessageSquare size={20} />
            <span>{stats?.active_sessions || 0} Active</span>
          </div>
          <div className="stat-item">
            <Users size={20} />
            <span>{stats?.today_sessions || 0} Today</span>
          </div>
          <div className="stat-item">
            <Clock size={20} />
            <span>{stats?.avg_duration_minutes || 0}m Avg</span>
          </div>
        </div>
      </div>

      <div className="chat-content">
        <div className="sessions-panel">
          <div className="sessions-header">
            <h2>Active Sessions</h2>
            <div className="session-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Unassigned</button>
              <button className="filter-btn">Assigned</button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading sessions...</div>
          ) : (
            <div className="sessions-list">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className={`session-item ${selectedSession?.id === session.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="session-header-info">
                    <div className="session-user">
                      <HeadphonesIcon size={16} />
                      <span>
                        {session.first_name 
                          ? `${session.first_name} ${session.last_name || ''}`
                          : `Guest (${session.visitor_ip})`
                        }
                      </span>
                    </div>
                    <div className="session-meta">
                      <span className="session-time">
                        {formatDuration(session.started_at)}
                      </span>
                      {session.unread_count > 0 && (
                        <span className="unread-badge">{session.unread_count}</span>
                      )}
                    </div>
                  </div>
                  <div className="session-details">
                    <div className="session-stats">
                      <span>{session.message_count} messages</span>
                      {session.assigned_agent ? (
                        <span className="assigned-badge">
                          {session.agent_first_name} {session.agent_last_name}
                        </span>
                      ) : (
                        <span className="unassigned-badge">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSession ? (
          <div className="chat-panel">
            <div className="chat-panel-header">
              <div className="chat-info">
                <h3>
                  {selectedSession.first_name 
                    ? `${selectedSession.first_name} ${selectedSession.last_name || ''}`
                    : `Guest (${selectedSession.visitor_ip})`
                  }
                </h3>
                <span className="session-duration">
                  Active for {formatDuration(selectedSession.started_at)}
                </span>
              </div>
              <div className="chat-actions">
                {!selectedSession.assigned_agent && (
                  <button className="assign-btn" onClick={assignToSelf}>
                    Assign to Me
                  </button>
                )}
                <button className="end-btn" onClick={endSession}>
                  End Chat
                </button>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`chat-message ${message.sender_type}`}
                >
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender-name">
                        {message.sender_type === 'user' 
                          ? selectedSession.first_name 
                            ? `${selectedSession.first_name} ${selectedSession.last_name || ''}`
                            : 'Guest'
                          : message.first_name 
                            ? `${message.first_name} ${message.last_name || ''}`
                            : 'Agent'
                        }
                      </span>
                      <span className="message-time">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <p>{message.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input">
              <div className="input-container">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  disabled={isTyping}
                />
                <button
                  className="send-button"
                  onClick={sendMessage}
                  disabled={!messageText.trim() || isTyping}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-session-selected">
            <MessageSquare size={64} />
            <h3>Select a chat session</h3>
            <p>Choose an active session from the list to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatManagementPage
