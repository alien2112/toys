import React, { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp } from 'lucide-react'
import { apiService } from '../services/api'
import './SearchBox.css'

interface SearchBoxProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  onSearch, 
  placeholder = 'ابحث عن المنتجات...', 
  className = '' 
}) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [popularSearches, setPopularSearches] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showPopular, setShowPopular] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load popular searches on mount
  useEffect(() => {
    const loadPopularSearches = async () => {
      try {
        const popular = await apiService.getPopularSearches(5)
        setPopularSearches(popular || [])
      } catch (error) {
        console.error('Error loading popular searches:', error)
      }
    }
    loadPopularSearches()
  }, [])

  // Handle search suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowPopular(query.length === 0)
      return
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await apiService.getSearchSuggestions(query, 5)
        setSuggestions(results || [])
        setShowPopular(false)
      } catch (error) {
        console.error('Error loading suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setShowPopular(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowSuggestions(true)
  }

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (finalQuery.trim()) {
      onSearch(finalQuery.trim())
      setShowSuggestions(false)
      setShowPopular(false)
      inputRef.current?.blur()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setShowPopular(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.name)
    handleSearch(suggestion.name)
  }

  const handlePopularClick = (popular: any) => {
    setQuery(popular.name)
    handleSearch(popular.name)
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    setShowPopular(false)
    onSearch('')
    inputRef.current?.focus()
  }

  return (
    <div className={`search-box ${className}`} ref={searchRef}>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            setShowSuggestions(true)
            setShowPopular(query.length === 0)
          }}
          placeholder={placeholder}
          className="search-input"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="clear-button"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {(showSuggestions || showPopular) && (
        <div className="search-dropdown">
          {isLoading ? (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <span>جاري البحث...</span>
            </div>
          ) : (
            <>
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">اقتراحات البحث</div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="search-suggestion"
                    >
                      <Search size={16} />
                      <span>{suggestion.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Searches */}
              {popularSearches.length > 0 && showPopular && (
                <div className="search-section">
                  <div className="search-section-title">
                    <TrendingUp size={14} />
                    عمليات البحث الشائعة
                  </div>
                  {popularSearches.map((popular, index) => (
                    <button
                      key={index}
                      onClick={() => handlePopularClick(popular)}
                      className="search-popular"
                    >
                      <TrendingUp size={14} />
                      <span>{popular.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {suggestions.length === 0 && query.length >= 2 && !showPopular && (
                <div className="search-no-results">
                  <Search size={16} />
                  <span>لا توجد نتائج ل "{query}"</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBox
