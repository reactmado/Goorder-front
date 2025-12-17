import React, { useState, useEffect } from "react";
import { FaStar, FaCheckCircle } from "react-icons/fa"; // Import the star and checkmark icons
import "../../styles/Reviews.css"; // Ensure this CSS file is updated
import Navbar from "../../components/navbar copy/Navbar";
import { ReviewsService, ReviewRating } from "../../service/ReviewsService"; // Import the service and interface

const Reviews: React.FC = () => {
  // State for reviews, loading, errors, and pagination
  const [reviews, setReviews] = useState<ReviewRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0); // State to handle pagination
  const [hasMore, setHasMore] = useState(true); // State to track if more reviews are available

  // Fetch reviews when the component mounts or when 'skip' changes
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch reviews with the current 'skip' value
        const fetchedReviews = await ReviewsService.getBusinessRatings(skip);

        // Append new reviews to the existing list
        setReviews((prevReviews) => [...prevReviews, ...fetchedReviews]);

        // If fewer reviews are returned than the limit, assume no more are available
        if (fetchedReviews.length < 10) {
          // Assuming the service returns 10 per page
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setError("Failed to load reviews. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [skip]); // Refetch when 'skip' changes

  // Function to handle the "Load More" button click
  const handleLoadMore = () => {
    setSkip((prevSkip) => prevSkip + 10); // Increment 'skip' to fetch the next page
  };

  // Helper function to render star ratings
  const renderStars = (rating: number) => {
    const clampedRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(clampedRating);

    return (
      <>
        {Array.from({ length: fullStars }).map((_, i) => (
          <FaStar key={`filled-${i}`} className="star-icon filled" />
        ))}
        {Array.from({ length: 5 - fullStars }).map((_, i) => (
          <FaStar key={`empty-${i}`} className="star-icon empty" />
        ))}
      </>
    );
  };

  // Get user initials for the avatar placeholder
  const getInitials = (userId: string) => {
    return userId ? userId.substring(0, 2).toUpperCase() : "NA";
  };

  return (
    <div className="reviews-page">
      <div className="reviews-content">
        <Navbar />
        <h2 className="reviews-title">Customer Reviews</h2>

        {/* Loading, error, and no-reviews messages */}
        {isLoading && reviews.length === 0 && (
          <div className="info-message loading-message">Loading reviews...</div>
        )}
        {error && <div className="info-message error-message">{error}</div>}
        {!isLoading && !error && reviews.length === 0 && (
          <div className="info-message no-reviews-message">
            No reviews found yet.
          </div>
        )}

        {/* Grid of review cards */}
        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <div
              className="review-card"
              key={`${review.userId}-${review.product.id}-${index}`}
            >
              <div className="review-card-header">
                <div className="review-card-left">
                  {/* Avatar Placeholder */}
                  <div className="reviewer-avatar-placeholder">
                    <span className="avatar-initials">
                      {getInitials(review.userId)}
                    </span>
                  </div>
                  <div className="reviewer-info">
                    <h3 className="reviewer-name">
                      {`User ${
                        review.userId ? review.userId.substring(0, 8) : "N/A"
                      }...`}
                    </h3>
                    {/* Placeholder for review date */}
                    <p className="review-date">Reviewed on June 15, 2025</p>
                  </div>
                </div>
                <div className="review-stars">{renderStars(review.value)}</div>
              </div>

              {/* Product Info */}
              {review.product && (
                <div className="review-product-info">
                  <span className="product-label">Product:</span>
                  <span className="product-name">{review.product.name}</span>
                  <span className="product-id">ID: {review.product.id}</span>
                </div>
              )}

              {/* Review Text */}
              <div className="review-text-container">
                <p
                  className={
                    review.text ? "review-text" : "review-text no-text"
                  }
                >
                  {review.text || "No comment provided."}
                </p>
              </div>

              {/* Verified Purchase Badge */}
              <div className="review-verified-badge">
                <FaCheckCircle className="verified-icon" />
                <span>Verified Purchase</span>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="load-more-container">
            <button
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
