import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaBell,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import "./Navbar.css";
import { getUserProfile, ProfileData } from "../../service/Profile_service";
import {
  getBusinessProfile,
  BusinessProfile,
} from "../../service/Profile_B_service";

// Declare global properties for Google Translate to prevent TypeScript errors
declare global {
  interface Window {
    google: any; // Google's global object
    googleTranslateElementInit: () => void; // Callback function for Google Translate
    doGTranslate: (lang_pair: string) => void; // Unofficial API function used for programmatic translation
    hideGoogleTranslateToolbar: () => void; // Our custom function to hide toolbar
  }
}

const fetchNotifications = async () => {
  try {
    const response = await fetch("/api/notifications");
    if (!response.ok) throw new Error("Failed to fetch notifications");
    const data = await response.json();
    return data.notifications || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

const NotificationBell = ({ count }: { count: number }) => {
  return (
    <div className="notification-bell-icon">
      <FaBell size={18} />
      {count > 0 && <span className="notification-badge">{count}</span>}
    </div>
  );
};

interface SearchMatch {
  text: string;
  element: HTMLElement;
  position: number;
}

const SearchBar = ({
  isSearchExpanded,
  setIsSearchExpanded,
}: {
  isSearchExpanded: boolean;
  setIsSearchExpanded: (expanded: boolean) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [matches, setMatches] = useState<SearchMatch[]>([]); // Reset matches on query clear
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null); // Ref for the search container itself

  useEffect(() => {
    // Debounce search to prevent excessive DOM manipulation
    const handler = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        findMatches(searchQuery);
      } else {
        clearHighlights();
        setMatches([]);
        setCurrentMatchIndex(0); // Reset index
      }
    }, 300); // Debounce time

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (matches.length > 0) {
      highlightMatches();
      // Only scroll if search is currently active and there's a current match
      if (isSearchExpanded && currentMatchIndex !== -1) {
        scrollToMatch(currentMatchIndex);
      }
    } else {
      clearHighlights(); // Clear highlights if matches become empty
    }
  }, [matches, currentMatchIndex, isSearchExpanded]);

  // Effect to handle clicks outside the search bar to collapse it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        // Only collapse if it's currently expanded
        if (isSearchExpanded) {
          setIsSearchExpanded(false);
          setSearchQuery(""); // Clear query when collapsing
        }
      }
    };

    if (isSearchExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchExpanded, setIsSearchExpanded]);

  const findMatches = (query: string) => {
    if (query.trim().length === 0) {
      clearHighlights();
      setMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    clearHighlights(); // Clear existing highlights before finding new ones

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const searchText = query.toLowerCase(); // Fixed: Add eslint-disable-next-line
    const newMatches: SearchMatch[] = [];

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          // Exclude script, style, and elements related to the navbar/search bar itself or Google Translate
          if (
            parent.tagName === "SCRIPT" ||
            parent.tagName === "STYLE" ||
            parent.tagName === "NOSCRIPT" ||
            parent.closest(".header") || // Exclude anything inside the navbar itself
            parent.closest("#google_translate_element") ||
            parent.closest(".goog-tooltip") ||
            parent.closest(".skiptranslate")
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          if (
            node.textContent &&
            node.textContent.toLowerCase().includes(searchText) // This is where `searchText` is used.
          ) {
            return NodeFilter.FILTER_ACCEPT;
          }

          return NodeFilter.FILTER_REJECT;
        },
      } as NodeFilter
    );

    let node;
    let position = 0;
    while ((node = walker.nextNode())) {
      const text = node.textContent || "";
      // To get the actual element for scrolling/highlighting, we target the parent of the text node
      // This is a common pattern to avoid breaking text nodes into tiny pieces.
      const parentElement = node.parentElement as HTMLElement;
      if (text.toLowerCase().includes(searchText) && parentElement) { // This is where `searchText` is also used.
        newMatches.push({
          text,
          element: parentElement, // Store the parent element
          position: position,
        });
        position++;
      }
    }

    setMatches(newMatches);
    setCurrentMatchIndex(newMatches.length > 0 ? 0 : -1);
  };

  const clearHighlights = () => {
    const highlights = document.querySelectorAll(".search-highlight");
    highlights.forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        // Create a text node from the highlighted content
        const textNode = document.createTextNode(el.textContent || "");
        parent.replaceChild(textNode, el);
        parent.normalize(); // Merge adjacent text nodes back
      }
    });
  };

  const highlightMatches = () => {
    clearHighlights();

    if (searchQuery.trim().length === 0 || matches.length === 0) return;

    const searchText = searchQuery.toLowerCase(); // This `searchText` is local to `highlightMatches`

    // Re-apply highlights after clearing
    matches.forEach((match, idx) => {
      const element = match.element;
      if (!element || !element.childNodes) return;

      const originalHTML = element.innerHTML;
      // Use a more robust regex to find all instances of the search text case-insensitively
      // Use the local `searchText` here
      const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");


      const newHTML = originalHTML.replace(regex, (match) => {
        const isActive = idx === currentMatchIndex;
        // Ensure we don't double highlight by checking if it's already a highlight span
        if (match.includes('<span class="search-highlight')) {
            return match; // Already highlighted, return as is
        }
        return `<span class="search-highlight ${isActive ? "search-highlight-active" : ""}">${match}</span>`;
      });
      element.innerHTML = newHTML;
    });
  };

  const scrollToMatch = (index: number) => {
    if (index < 0 || index >= matches.length) return;

    const allHighlights = document.querySelectorAll(".search-highlight");
    if (allHighlights.length > 0) {
        // First, ensure the current active highlight is correctly marked.
        allHighlights.forEach((el, i) => {
            if (i === index) {
                el.classList.add("search-highlight-active");
            } else {
                el.classList.remove("search-highlight-active");
            }
        });

        // Then, scroll the correct one into view
        const targetHighlight = allHighlights[index] as HTMLElement;
        if (targetHighlight) {
            targetHighlight.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSearch = () => {
    const newState = !isSearchExpanded;
    setIsSearchExpanded(newState);
    if (newState && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery(""); // Clear search when collapsing
    }
  };

  const navigateToNextMatch = () => {
    if (matches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIndex);
  };

  const navigateToPrevMatch = () => {
    if (matches.length === 0) return;
    const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prevIndex);
  };

  return (
    <>
      <div
        ref={searchBarRef}
        className={`search-container ${isSearchExpanded ? "expanded" : ""}`}
      >
        <div className="search-icon">
          <FaSearch size={16} />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search on page"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        {searchQuery.trim().length > 0 && matches.length > 0 && (
          <div className="search-results-info">
            <span>
              {currentMatchIndex + 1} of {matches.length}
            </span>
            <button className="search-nav-button" onClick={navigateToPrevMatch}>
              <FaChevronUp size={14} />
            </button>
            <button className="search-nav-button" onClick={navigateToNextMatch}>
              <FaChevronDown size={14} />
            </button>
          </div>
        )}
      </div>
      {/* This button toggles the search bar's visibility on small screens */}
      <button className="search-toggle" onClick={toggleSearch}>
        <FaSearch size={18} />
      </button>
    </>
  );
};

const UserAvatar = ({ imageUrl }: { imageUrl: string }) => {
  return (
    <div className="user-avatar">
      <img src={imageUrl} alt="User profile" />
    </div>
  );
};

interface NavbarProps {
  sidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarToggle, isSidebarOpen }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile | null>(null);
  const [isArabic, setIsArabic] = useState<boolean>(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false); // State for search bar expansion

  // Function to delete a cookie
  const deleteCookie = (name: string) => {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;";
  };

  // Function to hide Google Translate elements
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
    ];

    elementsToHide.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        (el as HTMLElement).style.display = "none";
        (el as HTMLElement).style.visibility = "hidden";
        (el as HTMLElement).style.opacity = "0";
        (el as HTMLElement).style.position = "absolute";
        (el as HTMLElement).style.left = "-9999px";
        (el as HTMLElement).style.top = "-9999px";
      });
    });

    // Ensure body positioning is correct
    document.body.style.marginTop = "0";
    document.body.style.top = "0";
    document.body.style.position = "static";
  };

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await fetchNotifications();
      setNotifications(data);
    };

    const loadUserProfile = async () => {
      try {
        const userData = await getUserProfile();
        setProfileData(userData);
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };

    const loadBusinessProfile = async () => {
      try {
        const businessData = await getBusinessProfile();
        setBusinessProfile(businessData);
      } catch (error) {
        console.error("Error loading business profile:", error);
      }
    };

    loadNotifications();
    loadUserProfile();
    loadBusinessProfile();

    // Check translation state
    const checkTranslationState = () => {
      const googtransCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("googtrans="));

      if (googtransCookie && googtransCookie.includes("/ar")) {
        setIsArabic(true);
      } else {
        setIsArabic(false);
      }
    };

    // Check immediately
    checkTranslationState();

    // Set up interval to monitor cookie changes
    const translationMonitor = setInterval(checkTranslationState, 500);

    // Cleanup function to hide Google Translate elements periodically
    const hideTranslateElements = setInterval(() => {
      hideGoogleTranslateElements();
    }, 1000);

    // Initial cleanup
    setTimeout(hideGoogleTranslateElements, 100);

    return () => {
      clearInterval(translationMonitor);
      clearInterval(hideTranslateElements);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleToggleSidebar = () => {
    if (sidebarToggle) {
      sidebarToggle();
    }
  };

  // Enhanced function to handle language translation toggle
  const handleTranslateToggle = () => {
    if (isArabic) {
      // If currently in Arabic, revert to original (English)
      deleteCookie("googtrans"); // Delete the main translation cookie
      deleteCookie("googtrans_session"); // Delete session cookie

      // Force page reload to revert to original content
      window.location.reload();
    } else {
      // If currently in English, translate to Arabic
      if (window.doGTranslate) {
        window.doGTranslate("en|ar"); // Translate from English to Arabic
        setIsArabic(true); // Set state to Arabic

        // Additional cleanup after translation
        setTimeout(() => {
          hideGoogleTranslateElements();
        }, 1000);

        setTimeout(() => {
          hideGoogleTranslateElements();
        }, 2000);

        setTimeout(() => {
          hideGoogleTranslateElements();
        }, 3000);
      } else {
        console.warn(
          "Google Translate function (doGTranslate) not found. Ensure the script is loaded correctly in index.html."
        );
        alert(
          "Translation service not ready. Please try again or check your internet connection."
        );
      }
    }
  };

  // Use business profile image first, then fall back to user profile image
  const profileImageUrl =
    businessProfile?.image || profileData?.image || "/photos/boy1.png";

  return (
    <header className={`header ${isSearchExpanded ? "search-expanded" : ""}`}>
      <div className="header-left">
        <button className="menu-toggle" onClick={handleToggleSidebar}>
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <div className="logo">
          <Link to="/home" className="logo-link">
            GoOrder
          </Link>
        </div>
      </div>

      <div className="header-center">
        {/* Pass isSearchExpanded and setIsSearchExpanded to SearchBar */}
        <SearchBar
          isSearchExpanded={isSearchExpanded}
          setIsSearchExpanded={setIsSearchExpanded}
        />
      </div>

      <div className="header-actions">
        {/* Translate Button: No icon, text changes based on language view */}
        <button className="translate-button" onClick={handleTranslateToggle}>
          <span className="translate-button-text">
            {isArabic ? "English" : "عربي"}
          </span>
        </button>

        <div className="notification-bell" onClick={toggleDropdown}>
          <NotificationBell count={notifications.length} />
        </div>

        <Link to="/profile_b" className="profile-link">
          <UserAvatar imageUrl={profileImageUrl} />
        </Link>
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          <h3>Notifications</h3>
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <div key={index} className="notification-item">
                <p>{notif.message}</p>
              </div>
            ))
          ) : (
            <p>No new notifications</p>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;