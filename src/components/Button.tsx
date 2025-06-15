"use client"

import type React from "react"

interface CustomButtonProps {
  text: string
  className?: string
  onClick?: () => void
  variant?: "primary" | "secondary" | "outline" | "danger" | "success"
  disabled?: boolean
  type?: "button" | "submit" | "reset" // Added type prop
  size?: "small" | "medium" | "large" // Added size prop
  loading?: boolean // Added loading state
  icon?: React.ReactNode // Added icon prop
  iconPosition?: "left" | "right" // Added icon position
  fullWidth?: boolean // Added full width option
  id?: string // Added id prop
  name?: string // Added name prop
  value?: string // Added value prop
  title?: string // Added title prop for tooltip
  "aria-label"?: string // Added aria-label for accessibility
  "aria-describedby"?: string // Added aria-describedby for accessibility
  onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void // Added onFocus
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void // Added onBlur
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void // Added onKeyDown
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void // Added onMouseEnter
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void // Added onMouseLeave
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  className = "",
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  size = "medium",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  id,
  name,
  value,
  title,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  onFocus,
  onBlur,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  // Determine if button should be disabled (either explicitly disabled or loading)
  const isDisabled = disabled || loading

  // Build CSS classes
  const buttonClasses = [
    "custom-button",
    `custom-${variant}-button`,
    `custom-button-${size}`,
    fullWidth ? "custom-button-full-width" : "",
    loading ? "custom-button-loading" : "",
    isDisabled ? "custom-button-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  // Handle click with loading state
  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick()
    }
  }

  // Render loading spinner
  const LoadingSpinner = () => (
    <span className="custom-button-spinner" aria-hidden="true">
      <svg className="custom-spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="custom-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
          className="custom-spinner-path"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>
  )

  // Render button content
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner />
          <span className="custom-button-text">{text}</span>
        </>
      )
    }

    if (icon && iconPosition === "left") {
      return (
        <>
          <span className="custom-button-icon custom-button-icon-left" aria-hidden="true">
            {icon}
          </span>
          <span className="custom-button-text">{text}</span>
        </>
      )
    }

    if (icon && iconPosition === "right") {
      return (
        <>
          <span className="custom-button-text">{text}</span>
          <span className="custom-button-icon custom-button-icon-right" aria-hidden="true">
            {icon}
          </span>
        </>
      )
    }

    return <span className="custom-button-text">{text}</span>
  }

  return (
    <button
      type={type}
      id={id}
      name={name}
      value={value}
      className={buttonClasses}
      onClick={handleClick}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={isDisabled}
      title={title}
      aria-label={ariaLabel || (loading ? `${text} (Loading)` : text)}
      aria-describedby={ariaDescribedBy}
      aria-disabled={isDisabled}
      {...props}
    >
      {renderContent()}
    </button>
  )
}

export default CustomButton
