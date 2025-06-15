"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaBell,
  FaChevronUp,
  FaChevronDown,
  FaTimes as FaClear,
  FaChartBar,
  FaUser,
  FaCog,
  FaUserPlus,
  FaBuilding,
  FaMotorcycle,
  FaPlusSquare,
  FaLayerGroup,
  FaSignOutAlt,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa"
import "./Navbar.css"
import { getUserProfile, type ProfileData } from "../../service/Profile_service"

// Declare global properties for Google Translate to prevent TypeScript errors
declare global {
  interface Window {
    google: any
    googleTranslateElementInit: () => void
    doGTranslate: (lang_pair: string) => void
    hideGoogleTranslateToolbar: () => void
  }
}

// Type definition for user data
interface User {
  name: string
  email: string
  avatarUrl?: string
}

const fetchNotifications = async () => {
  try {
    const response = await fetch("/api/notifications")
    if (!response.ok) throw new Error("Failed to fetch notifications")
    const data = await response.json()
    return data.notifications || []
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

const NotificationBell = ({ count }: { count: number }) => {
  return (
    <div className="integrated-notification-bell-icon">
      <FaBell size={18} />
      {count > 0 && <span className="integrated-notification-badge">{count}</span>}
    </div>
  )
}

interface SearchMatch {
  text: string
  element: HTMLElement
  position: number
}

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [matches, setMatches] = useState<SearchMatch[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      findMatches(searchQuery)
    } else {
      clearHighlights()
      setMatches([])
    }
  }, [searchQuery])

  useEffect(() => {
    if (matches.length > 0) {
      highlightMatches()
      scrollToMatch(currentMatchIndex)
    }
  }, [matches, currentMatchIndex])

  const findMatches = (query: string) => {
    if (query.trim().length === 0) return

    clearHighlights()

    const searchText = query.toLowerCase()
    const matches: SearchMatch[] = []

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT

        if (
          parent.tagName === "SCRIPT" ||
          parent.tagName === "STYLE" ||
          parent.tagName === "NOSCRIPT" ||
          parent.classList.contains("integrated-search-input") ||
          parent.classList.contains("integrated-search-results-info") ||
          parent.closest("#google_translate_element") ||
          parent.closest(".goog-tooltip") ||
          parent.closest(".skiptranslate")
        ) {
          return NodeFilter.FILTER_REJECT
        }

        if (node.textContent && node.textContent.toLowerCase().includes(searchText)) {
          return NodeFilter.FILTER_ACCEPT
        }

        return NodeFilter.FILTER_REJECT
      },
    } as NodeFilter)

    let position = 0
    let node

    while ((node = walker.nextNode())) {
      const text = node.textContent || ""
      const parent = node.parentElement as HTMLElement

      if (text.toLowerCase().includes(searchText)) {
        matches.push({
          text,
          element: parent,
          position: position,
        })
        position++
      }
    }

    setMatches(matches)
    setCurrentMatchIndex(matches.length > 0 ? 0 : -1)
  }

  const clearHighlights = () => {
    const highlights = document.querySelectorAll(".integrated-search-highlight")
    highlights.forEach((el) => {
      const parent = el.parentNode
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ""), el)
        parent.normalize()
      }
    })

    const activeHighlight = document.querySelector(".integrated-search-highlight-active")
    if (activeHighlight) {
      activeHighlight.classList.remove("integrated-search-highlight-active")
    }
  }

  const highlightMatches = () => {
    clearHighlights()

    if (searchQuery.trim().length === 0 || matches.length === 0) return

    const searchText = searchQuery.toLowerCase()

    matches.forEach((match, idx) => {
      const element = match.element
      const text = element.innerHTML

      const regex = new RegExp(`(${searchText})`, "gi")

      const highlightedText = text.replace(regex, (match) => {
        const isActive = idx === currentMatchIndex
        return `<span class="integrated-search-highlight ${isActive ? "integrated-search-highlight-active" : ""}">${match}</span>`
      })

      element.innerHTML = highlightedText
    })
  }

  const scrollToMatch = (index: number) => {
    if (index < 0 || index >= matches.length) return

    const activeHighlight = document.querySelector(".integrated-search-highlight-active")
    if (activeHighlight) {
      activeHighlight.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery("")
    clearHighlights()
    setMatches([])
    searchInputRef.current?.focus()
  }

  const navigateToNextMatch = () => {
    if (matches.length === 0) return
    const nextIndex = (currentMatchIndex + 1) % matches.length
    setCurrentMatchIndex(nextIndex)
  }

  const navigateToPrevMatch = () => {
    if (matches.length === 0) return
    const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length
    setCurrentMatchIndex(prevIndex)
  }

  return (
    <div className="integrated-search-container">
      <div className="integrated-search-icon">
        <FaSearch size={16} />
      </div>
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search on page..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="integrated-search-input"
      />
      {searchQuery.trim().length > 0 && (
        <>
          <button className="integrated-search-clear-button" onClick={clearSearch} title="Clear search">
            <FaClear size={12} />
          </button>
          {matches.length > 0 && (
            <div className="integrated-search-results-info">
              <span className="integrated-search-counter">
                {currentMatchIndex + 1} of {matches.length}
              </span>
              <div className="integrated-search-navigation">
                <button className="integrated-search-nav-button" onClick={navigateToPrevMatch} title="Previous match">
                  <FaChevronUp size={12} />
                </button>
                <button className="integrated-search-nav-button" onClick={navigateToNextMatch} title="Next match">
                  <FaChevronDown size={12} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const UserAvatar = ({ imageUrl }: { imageUrl: string }) => {
  return (
    <div className="integrated-user-avatar">
      <img src={imageUrl || "/placeholder.svg"} alt="User profile" />
    </div>
  )
}

// Navigation items for sidebar
const navItems = [
  {
    label: "Dashboard",
    icon: <FaChartBar />,
    path: "/dashboard",
  },
  { label: "Profile", icon: <FaUser />, path: "/profile" },
  { label: "Settings", icon: <FaCog />, path: "/settings" },
  { label: "Add Admin", icon: <FaUserPlus />, path: "/add-admin" },
  { label: "Manage Business", icon: <FaBuilding />, path: "/manage-business" },
  {
    label: "Manage Delivery Man",
    icon: <FaMotorcycle />,
    path: "/manage-delivery",
  },
  { label: "Add New Category", icon: <FaPlusSquare />, path: "/add-category" },
  {
    label: "Add Subcategory",
    icon: <FaLayerGroup />,
    path: "/add-subcategory",
  },
  { label: "Accept Register", icon: <FaCheck />, path: "/accept-register" },
  { label: "Logout", icon: <FaSignOutAlt />, path: "/logout" },
]

interface NavbarProps {
  children?: React.ReactNode
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isArabic, setIsArabic] = useState<boolean>(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const sidebarRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const deleteCookie = (name: string) => {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;"
  }

  const hideGoogleTranslateElements = () => {
    const elementsToHide = [
      "#goog-gt-tt",
      ".goog-te-banner-frame",
      ".goog-te-ftab-frame",
      ".goog-tooltip",
      ".goog-tooltip-wrapper",
      ".goog-te-balloon-frame",
      ".goog-te-menu-frame",
      ".goog-te-spinner-pos",
      ".skiptranslate.goog-te-gadget",
    ]

    elementsToHide.forEach((selector) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach((el) => {
        ;(el as HTMLElement).style.display = "none"
        ;(el as HTMLElement).style.visibility = "hidden"
        ;(el as HTMLElement).style.opacity = "0"
        ;(el as HTMLElement).style.position = "absolute"
        ;(el as HTMLElement).style.left = "-9999px"
        ;(el as HTMLElement).style.top = "-9999px"
      })
    })

    document.body.style.marginTop = "0"
    document.body.style.top = "0"
    document.body.style.position = "static"
  }

  // Check authentication status
  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token")
      const refreshToken = localStorage.getItem("refreshToken")

      if (token || refreshToken) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        navigate("/login")
        return
      }
      setAuthChecked(true)
    }

    checkAuthentication()
  }, [navigate])

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await fetchNotifications()
      setNotifications(data)
    }

    const loadUserProfile = async () => {
      try {
        const userData = await getUserProfile()
        setProfileData(userData)
        setUserData({
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          avatarUrl: userData.image || "/photos/boy1.png",
        })
      } catch (error) {
        console.error("Error loading user profile:", error)
        setIsAuthenticated(false)
        navigate("/login")
      }
    }

    if (authChecked && isAuthenticated) {
      loadNotifications()
      loadUserProfile()
      setIsLoading(false)
    }

    const checkTranslationState = () => {
      const googtransCookie = document.cookie.split("; ").find((row) => row.startsWith("googtrans="))

      if (googtransCookie && googtransCookie.includes("/ar")) {
        setIsArabic(true)
      } else {
        setIsArabic(false)
      }
    }

    checkTranslationState()

    const translationMonitor = setInterval(checkTranslationState, 500)
    const hideTranslateElements = setInterval(() => {
      hideGoogleTranslateElements()
    }, 1000)

    setTimeout(hideGoogleTranslateElements, 100)

    return () => {
      clearInterval(translationMonitor)
      clearInterval(hideTranslateElements)
    }
  }, [authChecked, isAuthenticated, navigate])

  // Handle click outside sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isSidebarOpen])

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const handleTranslateToggle = () => {
    if (isArabic) {
      deleteCookie("googtrans")
      deleteCookie("googtrans_session")
      window.location.reload()
    } else {
      if (window.doGTranslate) {
        window.doGTranslate("en|ar")
        setIsArabic(true)

        setTimeout(() => {
          hideGoogleTranslateElements()
        }, 1000)

        setTimeout(() => {
          hideGoogleTranslateElements()
        }, 2000)

        setTimeout(() => {
          hideGoogleTranslateElements()
        }, 3000)
      } else {
        console.warn("Google Translate function (doGTranslate) not found.")
        alert("Translation service not ready. Please try again or check your internet connection.")
      }
    }
  }

  const handleLogoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    localStorage.removeItem("userRole")
    localStorage.removeItem("authExpiration")
    localStorage.removeItem("id")

    setShowLogoutModal(false)
    setIsAuthenticated(false)
    navigate("/login")
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  // Modified line: Use profileData.image directly
  const profileImageUrl = profileData?.image || "/photos/boy1.png"

  // Don't render if not authenticated
  if (!authChecked || !isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Fixed Navbar Header */}
      <header className="integrated-header">
        <div className="integrated-header-left">
          <button className="integrated-menu-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <div className="integrated-logo">
            <Link to="/home" className="integrated-logo-link">
              GoOrder
            </Link>
          </div>
        </div>

        <div className="integrated-header-center">
          <SearchBar />
        </div>

        <div className="integrated-header-actions">
          <button className="integrated-translate-button" onClick={handleTranslateToggle}>
            <span className="integrated-translate-button-text">{isArabic ? "English" : "عربي"}</span>
          </button>

          <button className="integrated-notification-bell" onClick={toggleDropdown}>
            <NotificationBell count={notifications.length} />
          </button>

          {/* Modified Link: Navigate to /profile */}
          <Link to="/profile" className="integrated-profile-link">
            <UserAvatar imageUrl={profileImageUrl} />
          </Link>
        </div>

        {showDropdown && (
          <div className="integrated-notification-dropdown">
            <h3>Notifications</h3>
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <div key={index} className="integrated-notification-item">
                  <p>{notif.message}</p>
                </div>
              ))
            ) : (
              <p>No new notifications</p>
            )}
          </div>
        )}
      </header>

      {/* Fixed Sidebar */}
      <div ref={sidebarRef} className={`integrated-sidebar ${isSidebarOpen ? "integrated-open" : ""}`}>
        <div className="integrated-sidebar-gradient"></div>
        <div className="integrated-sidebar-content">
          <ul className="integrated-nav-list">
            {navItems.map((item, index) => {
              const isLogout = item.label === "Logout"
              return (
                <li className="integrated-nav-item" key={item.label} style={{ animationDelay: `${index * 0.05}s` }}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => (isActive ? "integrated-active" : "")}
                    onClick={(e) => {
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false)
                      }
                      if (isLogout) {
                        handleLogoutClick(e)
                      }
                    }}
                  >
                    <span className="integrated-nav-icon">{item.icon}</span>
                    <span className="integrated-nav-label">{item.label}</span>
                    <div className="integrated-nav-item-hover"></div>
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <div className="integrated-user-info">
            {isLoading ? (
              <div className="integrated-loading-state">
                <div className="integrated-loading-spinner"></div>
                <span>Loading profile...</span>
              </div>
            ) : userData ? (
              <>
                <div className="integrated-user-avatar-container">
                  <img
                    src={userData.avatarUrl || "/photos/boy1.png"}
                    alt="User Avatar"
                    className="integrated-user-avatar-sidebar"
                  />
                  <div className="integrated-user-status-indicator"></div>
                </div>
                <div className="integrated-user-details">
                  <h4>{userData.name}</h4>
                  <p>{userData.email}</p>
                </div>
              </>
            ) : (
              <div className="integrated-error-state">
                <FaExclamationTriangle />
                <span>Could not load profile</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && <div className="integrated-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main Content Area */}
      <div className={`integrated-main-content ${isSidebarOpen ? 'integrated-sidebar-visible' : 'integrated-sidebar-hidden'}`}>{children}</div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="integrated-logout-modal-overlay">
          <div className="integrated-logout-modal">
            <div className="integrated-logout-modal-header">
              <div className="integrated-logout-icon">
                <FaSignOutAlt />
              </div>
              <button className="integrated-close-modal" onClick={cancelLogout}>
                <FaTimes />
              </button>
            </div>
            <div className="integrated-logout-modal-body">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to sign out of your account?</p>
            </div>
            <div className="integrated-logout-modal-actions">
              <button className="integrated-cancel-btn" onClick={cancelLogout}>
                <span>Cancel</span>
              </button>
              <button className="integrated-confirm-btn" onClick={confirmLogout}>
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar