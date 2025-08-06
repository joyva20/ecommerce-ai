import React, { useState } from 'react';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, product, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const quickComments = [
    "Wah Produk Ini Bagus Sekali!!!",
    "Barangnya Bagus!",
    "Keren!",
    "Kualitas sesuai harga",
    "Pengiriman cepat",
    "Recommended!"
  ];

  const addQuickComment = (quickComment) => {
    if (comment) {
      setComment(comment + ' ' + quickComment);
    } else {
      setComment(quickComment);
    }
  };

  const removeQuickComment = (quickComment) => {
    setComment(comment.replace(quickComment, '').trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    onSubmit({
      productId: product._id,
      orderId: product.orderId,
      rating,
      comment
    });
    
    // Reset form
    setRating(0);
    setComment('');
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay">
      <div className="review-modal">
        <div className="modal-header">
          <h3>Write a Review</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="product-info">
            <img src={product.image && product.image[0]} alt={product.name} />
            <h4>{product.name}</h4>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="rating-section">
              <label>Rating</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`star ${star <= (hoveredStar || rating) ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            
            <div className="comment-section">
              <label>Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here..."
                rows="4"
              />
              
              <div className="quick-comments">
                <p>Quick comments:</p>
                <div className="quick-comment-buttons">
                  {quickComments.map((quickComment, index) => (
                    <div key={index} className="quick-comment-item">
                      <button
                        type="button"
                        className="quick-comment-btn"
                        onClick={() => addQuickComment(quickComment)}
                      >
                        {quickComment}
                      </button>
                      {comment.includes(quickComment) && (
                        <button
                          type="button"
                          className="remove-comment-btn"
                          onClick={() => removeQuickComment(quickComment)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit">Submit Review</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
