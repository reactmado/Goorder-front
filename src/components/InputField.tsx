"use client"

import type React from "react"
import { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"

// Define the props interface for CustomInputField
interface CustomInputFieldProps {
  type?: string
  placeholder?: string
  showEyeIcon?: boolean // Optional prop to show/hide password toggle
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string // Optional CSS class for additional styling
  name?: string // The 'name' attribute for the input element
  disabled?: boolean // Added disabled prop
  id?: string // Added id prop for accessibility
  required?: boolean // Added required prop
  autoComplete?: string // Added autocomplete prop
  maxLength?: number // Added maxLength prop
  minLength?: number // Added minLength prop
  pattern?: string // Added pattern prop for validation
  title?: string // Added title prop for tooltip
  readOnly?: boolean // Added readOnly prop
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void // Added onFocus
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void // Added onBlur
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void // Added onKeyDown
  "aria-label"?: string // Added aria-label for accessibility
  "aria-describedby"?: string // Added aria-describedby for accessibility
}

const CustomInputField: React.FC<CustomInputFieldProps> = ({
  type = "text",
  placeholder = "",
  showEyeIcon = false,
  value = "",
  onChange,
  className = "",
  name,
  disabled = false,
  id,
  required = false,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  title,
  readOnly = false,
  onFocus,
  onBlur,
  onKeyDown,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    if (!disabled && !readOnly) {
      setIsVisible((prev) => !prev)
    }
  }

  // Determine the actual input type based on showEyeIcon and visibility state
  const inputType = isVisible && showEyeIcon ? "text" : type

  // Handle keyboard navigation for eye icon
  const handleEyeIconKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleVisibility()
    }
  }

  return (
    <div className={`custom-input-container ${disabled ? "disabled" : ""} ${readOnly ? "readonly" : ""}`}>
      <input
        type={inputType}
        name={name}
        id={id}
        placeholder={placeholder}
        className={`custom-input-field ${className} ${showEyeIcon ? "with-eye-icon" : ""}`}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        autoComplete={autoComplete}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        title={title}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
      {showEyeIcon && (type === "password" || type === "text") && (
        <div
          className={`custom-eye-icon ${disabled || readOnly ? "disabled" : ""}`}
          onClick={toggleVisibility}
          onKeyDown={handleEyeIconKeyDown}
          role="button"
          tabIndex={disabled || readOnly ? -1 : 0}
          aria-label={isVisible ? "Hide password" : "Show password"}
          title={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? <FaEyeSlash /> : <FaEye />}
        </div>
      )}
    </div>
  )
}

export default CustomInputField
