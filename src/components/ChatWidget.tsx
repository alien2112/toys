import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Minimize2, Maximize2, User } from 'lucide-react'
import { apiService } from '../services/api'
import { websocketService } from '../services/websocket'
import { useAuth } from '../context/AuthContext'
import './ChatWidget.css'

interface ChatMessage {
  id: number
  message: string
  sender_type: 'user' | 'agent' | 'system'
  sender_id?: number
  created_at: string
  is_read: boolean
}

interface ChatSession {
  id: number
  session_id: string
  status: 'active' | 'ended' | 'transferred'
  assigned_agent?: number
  messages: ChatMessage[]
}

const ChatWidget: React.FC = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && !session) {
      startChatSession()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Set up WebSocket event listeners
    const handleOpen = (data: any) => {
      setIsConnected(true)
      if (data.usingWebSockets) {
        console.log('Connected via WebSocket')
      } else {
        console.log('Connected via HTTP polling')
      }
    }

    const handleMessage = (data: any) => {
      switch (data.type) {
        case 'sessionJoined':
          setSession(data.session)
          setMessages(data.messages || [])
          break
        case 'newMessage':
          setMessages(prev => [...prev, data])
          scrollToBottom()
          break
        case 'messagesLoaded':
          setMessages(data || [])
          scrollToBottom()
          break
        case 'typing':
          setIsTyping(data.typing)
          break
        case 'error':
          console.error('Chat error:', data.message)
          break
      }
    }

    const handleError = () => {
      setIsConnected(false)
    }

    const handleClose = () => {
      setIsConnected(false)
    }

    websocketService.on('open', handleOpen)
    websocketService.on('sessionJoined', handleMessage)
    websocketService.on('newMessage', handleMessage)
    websocketService.on('messagesLoaded', handleMessage)
    websocketService.on('typing', handleMessage)
    websocketService.on('error', handleError)
    websocketService.on('close', handleClose)

    return () => {
      websocketService.off('open', handleOpen)
      websocketService.off('sessionJoined', handleMessage)
      websocketService.off('newMessage', handleMessage)
      websocketService.off('messagesLoaded', handleMessage)
      websocketService.off('typing', handleMessage)
      websocketService.off('error', handleError)
      websocketService.off('close', handleClose)
    }
  }, [])

  useEffect(() => {
    // Disconnect WebSocket when chat is closed
    if (!isOpen) {
      websocketService.disconnect()
    }
  }, [isOpen])

  const startChatSession = async () => {
    try {
      // Create or get existing session
      const response = await apiService.post('/chat/sessions', {
        user_id: user?.id || null
      })
      
      if ((response as any).session_id) {
        setSession(response as any)
        
        // Connect to WebSocket
        websocketService.connect(
          (response as any).session_id,
          user?.id || null,
          false // Not an agent
        )
      }
    } catch (err) {
      console.error('Error starting chat session:', err)
      setIsConnected(false)
    }
  }

  const loadMessages = async () => {
    // No longer needed - WebSocket handles this
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !websocketService.isConnected()) return

    const messageText = newMessage.trim()
    setNewMessage('')

    // Send via WebSocket
    websocketService.sendMessage(messageText)

    // Add message to local state immediately for better UX
    const tempMessage: ChatMessage = {
      id: Date.now(),
      message: messageText,
      sender_type: 'user',
      sender_id: user?.id,
      created_at: new Date().toISOString(),
      is_read: false
    }
    setMessages(prev => [...prev, tempMessage])
    scrollToBottom()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const endChatSession = async () => {
    if (!session) return

    try {
      await apiService.put(`/chat/sessions/${session.id}/end`)
      setSession(null)
      setMessages([])
      setIsOpen(false)
    } catch (err) {
      console.error('Error ending chat session:', err)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isOpen) {
    return (
      <div className="chat-widget-bubble" onClick={() => setIsOpen(true)}>
        <MessageSquare size={24} />
        <span className="chat-bubble-text">Chat with us</span>
      </div>
    )
  }

  return (
    <div className={`chat-widget ${isMinimized ? 'minimized' : ''}`}>
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-status">
            <div className={`status-dot ${isConnected ? 'online' : 'offline'}`}></div>
            <span>
              {isConnected ? 'Online' : 'Connecting...'}
              {session?.assigned_agent && ' • Agent Assigned'}
            </span>
          </div>
          <div className="chat-actions">
            <button 
              className="chat-action-btn"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button 
              className="chat-action-btn"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <User size={48} />
                <h3>Welcome to our chat!</h3>
                <p>How can we help you today?</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${message.sender_type}`}
                >
                  <div className="message-content">
                    <p>{message.message}</p>
                    <span className="message-time">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="typing-indicator">
                <span>Agent is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!isConnected}
              />
              <button
                className="send-button"
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
              >
                <Send size={18} />
              </button>
            </div>
            {session && (
              <div className="chat-footer">
                <button className="end-chat-btn" onClick={endChatSession}>
                  End Chat
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ChatWidget
