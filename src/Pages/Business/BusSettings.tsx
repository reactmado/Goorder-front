import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/biz-settings.css"; // Changed import to new CSS file
import Navbar from "../../components/navbar copy/Navbar";
import Sidebar_2 from "../../components/Sidebar_2/Sidebar_2"; // Import Sidebar_2
import { useTranslation } from "react-i18next";

const BusinessSettingsPage = () => { // Renamed component for uniqueness
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English (US)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar visibility

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    if (language === "Arabic") {
      i18n.changeLanguage("ar");
      document.documentElement.dir = "rtl";
    } else {
      i18n.changeLanguage("en");
      document.documentElement.dir = "ltr";
    }
    setShowPopup(false);
  };

  const handleLocationToggle = () => {
    if (!locationEnabled) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Latitude:", latitude);
          console.log("Longitude:", longitude);

          // ✅ Set location toggle ON immediately
          setLocationEnabled(true);

          // ✅ Replace with your actual API endpoint
          fetch("YOUR_API_ENDPOINT", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ latitude, longitude }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("Location sent:", data);
            })
            .catch((err) => {
              console.error("Error sending location:", err);
              // ❗ Optional: Revert if API fails
              // setLocationEnabled(false);
            });
        },
        (error) => {
          console.warn("Location access denied by user:", error.message);
          setLocationEnabled(false);
        }
      );
    } else {
      // User is turning location OFF
      setLocationEnabled(false);
    }
  };

  return (
    <div className="layout-container">
      <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isModalOpen={showPopup} />
      <Sidebar_2 isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} isModalOpen={showPopup} />

      <main className={`biz-settings-page-content ${isSidebarOpen ? "sidebar-shifted" : "sidebar-collapsed"} ${showPopup ? "modal-active" : ""}`}>
        <div className="biz-settings-container">
          <h1 className="biz-settings-title">{t("Settings")}</h1>

          <div className="biz-settings-menu">
            <p className="biz-settings-menu-active">{t("Profile")}</p>
            <hr className="biz-settings-divider" />

            <div className="biz-settings-option">
              <span>{t("Location")}</span>
              <label className="biz-settings-switch">
                <input
                  type="checkbox"
                  checked={locationEnabled}
                  onChange={handleLocationToggle}
                />
                <span className="biz-settings-slider round"></span>
              </label>
            </div>

            <div className="biz-settings-option" onClick={() => setShowPopup(true)}>
              <span>{t("Language")}</span>
              <span className="biz-settings-option-right">{selectedLanguage} &gt;</span>
            </div>

            <div
              className="biz-settings-option"
              onClick={() => navigate("/privacy-policy")}
            >
              <span>{t("Privacy & Policy")}</span>
              <span className="biz-settings-option-right">&gt;</span>
            </div>

            <div
              className="biz-settings-option"
              onClick={() => navigate("/terms-and-conditions")}
            >
              <span>{("Terms & Conditions")}</span>
              <span className="biz-settings-option-right">&gt;</span>
            </div>
          </div>

          {showPopup && (
            <div className="biz-settings-popup-overlay">
              <div className="biz-settings-popup-content">
                <h2>{t("Select Language")}</h2>

                <div
                  className={`biz-settings-language-option ${
                    selectedLanguage === "Arabic" ? "selected" : ""
                  }`}
                  onClick={() => handleLanguageChange("Arabic")}
                >
                  <img
                    src="https://flagcdn.com/w40/sa.png"
                    alt="Arabic"
                    className="biz-settings-flag-icon"
                  />
                  <span>Arabic</span>
                </div>

                <div
                  className={`biz-settings-language-option ${
                    selectedLanguage === "English (US)" ? "selected" : ""
                  }`}
                  onClick={() => handleLanguageChange("English (US)")}
                >
                  <img
                    src="https://flagcdn.com/w40/gb.png"
                    alt="English"
                    className="biz-settings-flag-icon"
                  />
                  <span>English (US)</span>
                </div>

                <button
                  className="biz-settings-select-button"
                  onClick={() => setShowPopup(false)}
                >
                  {t("Select")}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BusinessSettingsPage; // Export renamed component