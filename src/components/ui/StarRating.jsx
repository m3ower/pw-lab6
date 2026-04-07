import { useState } from 'react';
import './StarRating.css';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div
      className={`star-rating star-rating--${size} ${readOnly ? 'star-rating--readonly' : ''}`}
      role={readOnly ? 'img' : 'group'}
      aria-label={`Rating: ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star ${(hovered || value) >= star ? 'star--filled' : ''}`}
          onClick={() => !readOnly && onChange?.(star === value ? 0 : star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          disabled={readOnly}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          {(hovered || value) >= star ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}
