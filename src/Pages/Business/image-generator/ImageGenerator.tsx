import React, { useState, useEffect } from "react";
import "./ImageGenerator.css";
import { useNavigate } from "react-router-dom";
import { Copy } from "lucide-react"; // Import the Copy icon

import Nav_2 from "../../../components/navbar copy/Navbar";

const ImageGenerator: React.FC = () => {
  const navigate = useNavigate();

  const [igPrompt, setIgPrompt] = useState<string>("");
  const [igGeneratedImage, setIgGeneratedImage] = useState<string | null>(null);
  const [igIsLoading, setIgIsLoading] = useState<boolean>(false);
  const [igError, setIgError] = useState<string | null>(null);
  const [igShowContent, setIgShowContent] = useState<boolean>(false);
  const [igRecentPrompts, setIgRecentPrompts] = useState<string[]>([]);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null); // State for copy feedback

  const FAL_KEY =
    "5e52d37d-4813-4995-ab5f-bd9483f8b658:87bb47a0e479e43c046cc8cd0c3af2bf";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIgShowContent(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const generateImage = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIgError(
        "You must be logged in to generate images. Redirecting to login..."
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    if (!igPrompt.trim()) {
      setIgError("Please enter a prompt");
      return;
    }

    setIgIsLoading(true);
    setIgError(null);
    setIgGeneratedImage(null);

    try {
      const response = await fetch("https://fal.run/fal-ai/flux/dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${FAL_KEY}`,
        },
        body: JSON.stringify({
          prompt: igPrompt,
          num_images: 1,
          size: "512x512",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error: ${response.status} - ${errorData.detail || "Unknown error"}`
        );
      }

      const data = await response.json();
      if (data.images?.length > 0) {
        setIgGeneratedImage(data.images[0].url);
        setIgRecentPrompts((prev) =>
          [igPrompt, ...prev].filter((value, index, self) => self.indexOf(value) === index).slice(0, 5)
        );
      } else {
        throw new Error("No image was generated. Please try a different prompt.");
      }
    } catch (err: any) {
      console.error("Image generation failed:", err);
      setIgError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIgIsLoading(false);
    }
  };

  const handlePromptSuggestionClick = (suggestion: string) => {
    setIgPrompt(suggestion);
    setIgError(null);
  };

  const handleDownloadImage = () => {
    if (igGeneratedImage) {
      const link = document.createElement('a');
      link.href = igGeneratedImage;
      link.download = `generated_image_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyPrompt = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedPromptIndex(index);
        setTimeout(() => setCopiedPromptIndex(null), 1500); // Show "Copied!" for 1.5 seconds
      })
      .catch(err => {
        console.error('Failed to copy prompt: ', err);
      });
  };


  return (
    <div className="ig-main-layout">
      <Nav_2 />
      <div className={`ig-content-wrapper ${igShowContent ? "ig-show-content" : ""}`}>

        <div className="ig-generator-card">
          <div className="ig-card-inner">
            {/* Image Display Area */}
            <div className="ig-image-display-area">
              <div
                className={`ig-image-frame ${
                  igIsLoading ? "ig-loading-frame" : igGeneratedImage ? "ig-generated-frame" : ""
                }`}
              >
                {igIsLoading ? (
                  <div className="ig-loading-spinner-container">
                    <div className="ig-spinner"></div>
                    <p className="ig-loading-text">Generating image...</p>
                  </div>
                ) : igGeneratedImage ? (
                  <img
                    src={igGeneratedImage}
                    alt="AI Generated"
                    className="ig-generated-image"
                  />
                ) : (
                  <div className="ig-placeholder-wrapper">
                    <img
                      src="/images/nasser.png"
                      alt="Placeholder"
                      className="ig-placeholder-image"
                    />
                    {/* Enhanced placeholder text */}
                    <p className="ig-placeholder-text">💡 Describe your vision to the AI!</p>
                  </div>
                )}
              </div>

              {igGeneratedImage && !igIsLoading && (
                <div className="ig-image-actions">
                  <button
                    onClick={handleDownloadImage}
                    className="ig-action-button ig-download-button"
                    aria-label="Download generated image"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => {
                      setIgGeneratedImage(null);
                      setIgPrompt("");
                      setIgError(null);
                    }}
                    className="ig-action-button ig-new-image-button"
                    aria-label="Generate new image"
                  >
                    New Image
                  </button>
                </div>
              )}
            </div>

            {/* Prompt Input and Controls Area */}
            <div className="ig-input-controls-area">
              <h2 className="ig-internal-heading">Generate Your AI Image Instantly</h2>
              <div className="ig-tagline">
                "Transforming your words into visuals."
              </div>
              <p className="ig-label">Enter your creative prompt:</p>

              <div className="ig-input-group">
                <textarea
                  placeholder="e.g., A majestic dragon flying over a medieval castle at sunset, highly detailed, fantasy art"
                  className="ig-prompt-input"
                  value={igPrompt}
                  onChange={(e) => setIgPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !igIsLoading && generateImage()}
                  rows={3}
                ></textarea>
                {igError && <p className="ig-error-message">{igError}</p>}
              </div>

              <button
                className={`ig-generate-button ${igIsLoading ? "ig-loading-button" : ""}`}
                onClick={generateImage}
                disabled={igIsLoading}
              >
                {igIsLoading ? "Generating..." : "Generate Image"}
              </button>

              {igRecentPrompts.length > 0 && (
                <div className="ig-recent-prompts-section">
                  <p className="ig-section-label">Your Recent Prompts:</p>
                  <div className="ig-prompt-tag-list">
                    {igRecentPrompts.map((prompt, index) => (
                      <span
                        key={index}
                        className="ig-prompt-tag"
                        onClick={() => handlePromptSuggestionClick(prompt)}
                      >
                        {prompt}
                        <button
                          className="ig-copy-prompt-button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent tag click from triggering
                            handleCopyPrompt(prompt, index);
                          }}
                          aria-label={`Copy prompt: ${prompt}`}
                          title="Copy to clipboard"
                        >
                          {copiedPromptIndex === index ? "Copied!" : <Copy size={14} />}
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="ig-prompt-suggestions-section">
                <p className="ig-section-label">Feeling stuck? Try these ideas:</p>
                <div className="ig-prompt-tag-list">
                  {[
                    "A cozy living room with a fireplace and a cat sleeping on the rug, warm lighting, hyperrealistic",
                    "An astronaut exploring a vibrant alien jungle, bioluminescent plants, futuristic, digital painting",
                    "A vintage robot serving coffee in a bustling cafe, steampunk style, intricate gears, sepia tones",
                    "A majestic griffin soaring through a cloud-filled sky above ancient ruins, epic fantasy art",
                    "A minimalist abstract painting with soft pastel colors and flowing lines"
                  ].map((prompt, index) => (
                    <span
                      key={index}
                      className="ig-prompt-tag ig-suggestion-tag"
                      onClick={() => handlePromptSuggestionClick(prompt)}
                    >
                      {prompt}
                      <button
                        className="ig-copy-prompt-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPrompt(prompt, index + igRecentPrompts.length); // Offset index for uniqueness
                        }}
                        aria-label={`Copy suggestion: ${prompt}`}
                        title="Copy to clipboard"
                      >
                        {copiedPromptIndex === (index + igRecentPrompts.length) ? "Copied!" : <Copy size={14} />}
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;