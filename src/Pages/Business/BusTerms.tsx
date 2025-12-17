"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/navbar copy/Navbar"
import "../../styles/BusTerms.css"
import {
  FaArrowLeft,
  FaFileContract,
  FaUserCheck,
  FaShoppingCart,
  FaTruck,
  FaShieldAlt,
  FaExclamationTriangle,
  FaGavel,
  FaEdit,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaHandshake,
  FaInfoCircle,
} from "react-icons/fa"

const TermsConditions: React.FC = () => {
  const navigate = useNavigate()

  const handleBackClick = () => {
    navigate(-1) // Go back to previous page
  }

  return (
      <div className="terms-page">
            <Navbar/>

        {/* Enhanced Header */}
        <header className="terms-header">
          <div className="terms-header-content">
            <button className="terms-back-button" onClick={handleBackClick} aria-label="Go back to previous page">
              <FaArrowLeft />
              <span>Back</span>
            </button>
            <div className="terms-header-info">
              <div className="terms-header-icon">
                <FaFileContract />
              </div>
              <div className="terms-header-text">
                <h1>Terms & Conditions</h1>
                <p>Legal agreement and service terms</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="terms-content">
          {/* Hero Section */}
          <section className="terms-hero">
            <div className="hero-icon">
              <FaHandshake />
            </div>
            <div className="hero-content">
              <h2>Welcome to GoOrder</h2>
              <p>
                These Terms & Conditions govern your use of our mobile application and services. By accessing or using{" "}
                <strong>GoOrder</strong>, you agree to be bound by these terms. Please read them carefully before using
                our platform.
              </p>
              <div className="last-updated">
                <FaClock />
                <span>Last Updated: January 2025</span>
              </div>
            </div>
          </section>

          {/* Terms Sections */}
          <div className="terms-sections">
            {/* Section 1: Acceptance of Terms */}
            <section className="terms-section" id="acceptance">
              <div className="section-header">
                <div className="section-number">1</div>
                <div className="section-title">
                  <h2>Acceptance of Terms</h2>
                  <FaUserCheck className="section-icon" />
                </div>
              </div>
              <div className="section-content">
                <p>
                  By downloading, installing, or using the GoOrder application, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms & Conditions.
                </p>
                <div className="important-notice warning">
                  <div className="notice-icon">
                    <FaExclamationTriangle />
                  </div>
                  <div className="notice-content">
                    <p>
                      <strong>Important:</strong> You must be at least 18 years old or have parental consent to use our
                      services. If you do not agree to these terms, please discontinue use immediately.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: User Responsibilities */}
            <section className="terms-section" id="user-responsibilities">
              <div className="section-header">
                <div className="section-number">2</div>
                <div className="section-title">
                  <h2>User Responsibilities</h2>
                  <FaUserCheck className="section-icon" />
                </div>
              </div>
              <div className="section-content">
                <p>As a user of GoOrder, you agree to:</p>
                <ul>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Use the service only for lawful purposes and in compliance with these terms</li>
                  <li>Not engage in any fraudulent, harmful, or illegal activities</li>
                  <li>Not impersonate another person or misrepresent your identity</li>
                  <li>Respect the intellectual property rights of GoOrder and third parties</li>
                  <li>Report any suspicious activities or security breaches immediately</li>
                </ul>
              </div>
            </section>

            {/* Section 3: Orders & Payments */}
            <section className="terms-section" id="orders-payments">
              <div className="section-header">
                <div className="section-number">3</div>
                <div className="section-title">
                  <h2>Orders & Payments</h2>
                  <FaShoppingCart className="section-icon" />
                </div>
              </div>
              <div className="section-content">
                <p>Our ordering and payment system operates under the following terms:</p>
                <ul>
                  <li>All orders are subject to availability and restaurant acceptance</li>
                  <li>Prices displayed include applicable taxes and fees</li>
                  <li>Payment is required at the time of order placement</li>
                  <li>We reserve the right to refuse or cancel orders for any reason</li>
                  <li>Refunds are processed according to our refund policy</li>
                  <li>Payment information is securely processed through certified payment providers</li>
                  <li>You are responsible for any charges incurred on your account</li>
                </ul>
                <div className="important-notice info">
                  <div className="notice-icon">
                    <FaInfoCircle />
                  </div>
                  <div className="notice-content">
                    <p>
                      <strong>Payment Security:</strong> We use industry-standard encryption to protect your payment
                      information. However, you are responsible for keeping your payment methods secure.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Delivery Service */}
            <section className="terms-section" id="delivery-service">
              <div className="section-header">
                <div className="section-number">4</div>
                <div className="section-title">
                  <h2>Delivery Service</h2>
                  <FaTruck className="section-icon" />
                </div>
              </div>
              <div className="section-content">
                <p>Our delivery service is subject to the following conditions:</p>
                <ul>
                  <li>Delivery times are estimates and may vary due to various factors</li>
                  <li>We are not responsible for delays caused by restaurants, traffic, or weather</li>
                  <li>Accurate delivery information must be provided to avoid delays</li>
                  <li>Delivery personnel have the right to refuse delivery to unsafe locations</li>
                  <li>You must be available to receive your order at the specified location</li>
                  <li>Additional charges may apply for special delivery requests</li>
                  <li>Delivery areas are subject to availability and may change</li>
                </ul>
              </div>
            </section>

            {/* Section 5: Privacy & Data Protection */}
            <section className="terms-section" id="privacy-data">
              <div className="section-header">
                <div className="section-number">5</div>
                <div className="section-title">
                  <h2>Privacy & Data Protection</h2>
                  <FaShieldAlt className="section-icon" />
                </div>
              </div>
              <div className="section-content">
                <p>
                  Your privacy is important to us. We collect, store, and process personal data as described in our
                  Privacy Policy, which forms an integral part of these Terms & Conditions.
                </p>
                <ul>
                  <li>We collect only necessary information to provide our services</li>
                  <li>Your data is protected using industry-standard security measures</li>
                  <li>We do not sell your personal information to third parties</li>
                  <li>You have the right to access, modify, or delete your personal data</li>
                  <li>We may share data with service providers necessary for order fulfillment</li>
                </ul>
              </div>
            </section>

            {/* Section 6: Prohibited Conduct */}
            <section className="terms-section" id="prohibited-conduct">
              <div className="section-header">
                <div className="section-number">6</div>
                <div className="section-title">
                  <h2>Prohibited Conduct</h2>
                  <FaExclamationTriangle className="section-icon" />
                </div>
              </div>
              <div className="section-content">
                <p>The following activities are strictly prohibited:</p>
                <ul>
                  <li>Attempting to hack, disrupt, or damage our systems</li>
                  <li>Using automated systems to access our services</li>
                  <li>Posting false reviews or manipulating ratings</li>
                  <li>Harassing or threatening restaurant staff or delivery personnel</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Creating multiple accounts to circumvent restrictions</li>
                  <li>Sharing account credentials with unauthorized parties</li>
                </ul>
                <div className="important-notice warning">
                  <div className="notice-icon">
                    <FaExclamationTriangle />
                  </div>
                  <div className="notice-content">
                    <p>
                      <strong>Violation Consequences:</strong> Violation of these terms may result in account
                      suspension, termination, and potential legal action.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Limitation of Liability */}
            <section className="terms-section" id="liability-limitation">
              <div className="section-header">
                <div className="section-number">7</div>
                <div className="section-title">
                  <h2>Limitation of Liability</h2>
                  <FaGavel className="section-icon" />
                </div>
              </div>
              <div className="section-content">
                <p>
                  GoOrder provides services "as is" and "as available" without warranties of any kind. Our liability is
                  limited as follows:
                </p>
                <ul>
                  <li>We are not liable for indirect, incidental, or consequential damages</li>
                  <li>Our total liability shall not exceed the amount paid for the specific service</li>
                  <li>We are not responsible for restaurant food quality or preparation</li>
                  <li>Force majeure events are beyond our control and responsibility</li>
                  <li>Third-party service failures are not our responsibility</li>
                  <li>User-generated content is not endorsed or verified by us</li>
                </ul>
              </div>
            </section>

            {/* Section 8: Account Termination */}
            <section className="terms-section" id="termination">
              <div className="section-header">
                <div className="section-number">8</div>
                <div className="section-title">
                  <h2>Account Termination</h2>
                  <FaExclamationTriangle className="section-icon" />
                </div>
              </div>
              <div className="section-content">
                <p>Account termination may occur under the following circumstances:</p>
                <ul>
                  <li>Violation of these Terms & Conditions</li>
                  <li>Fraudulent or illegal activities</li>
                  <li>Repeated complaints from restaurants or delivery partners</li>
                  <li>Abuse of refund or promotional systems</li>
                  <li>User request for account deletion</li>
                  <li>Extended period of account inactivity</li>
                </ul>
                <div className="important-notice warning">
                  <div className="notice-icon">
                    <FaExclamationTriangle />
                  </div>
                  <div className="notice-content">
                    <p>
                      <strong>Termination Effects:</strong> Upon termination, you lose access to all account features,
                      order history, and accumulated benefits. Outstanding orders will be completed where possible.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9: Changes to Terms */}
            <section className="terms-section" id="changes-updates">
              <div className="section-header">
                <div className="section-number">9</div>
                <div className="section-title">
                  <h2>Changes to Terms</h2>
                  <FaEdit className="section-icon" />
                </div>
              </div>
              <div className="section-content">
                <p>
                  We reserve the right to modify these Terms & Conditions at any time. Changes will be effective
                  immediately upon posting to our platform.
                </p>
                <ul>
                  <li>Users will be notified of significant changes via email or app notification</li>
                  <li>Continued use of the service constitutes acceptance of updated terms</li>
                  <li>Previous versions of terms will be archived for reference</li>
                  <li>Users may terminate their account if they disagree with changes</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Contact Section */}
          <section className="contact-section">
            <h3>Questions About These Terms?</h3>
            <p>If you have any questions about these Terms & Conditions, please contact us:</p>
            <div className="contact-grid">
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <div className="contact-content">
                  <h4>Email Support</h4>
                  <p>legal@goorder.com</p>
                  <span className="contact-note">Response within 24 hours</span>
                </div>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <div className="contact-content">
                  <h4>Phone Support</h4>
                  <p>+1 987-654-3210</p>
                  <span className="contact-note">Mon-Fri, 9AM-6PM EST</span>
                </div>
              </div>
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <div className="contact-content">
                  <h4>Legal Department</h4>
                  <p>
                    GoOrder Legal Team
                    <br />
                    123 Main Street
                    <br />
                    City, Country
                  </p>
                  <span className="contact-note">For legal correspondence</span>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="terms-footer">
            <div className="footer-content">
              <div className="footer-main">
                <h3>Agreement Acknowledgment</h3>
                <p>
                  By using GoOrder, you acknowledge that you have read, understood, and agree to be bound by these Terms
                  & Conditions. Thank you for choosing our platform for your food delivery needs.
                </p>
              </div>
              <div className="footer-meta">
                <div className="footer-item">
                  <strong>Last Updated:</strong> January 2025
                </div>
                <div className="footer-item">
                  <strong>Version:</strong> 3.1
                </div>
                <div className="footer-item">
                  <strong>Effective Date:</strong> January 1, 2025
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
  )
}

export default TermsConditions
