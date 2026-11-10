import { Star } from 'lucide-react';
import './StarRating.css';

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  editable?: boolean;
};

export function StarRating({ value, onChange, size = 18, editable = false }: Props) {
  return (
    <div className={`star-rating${editable ? ' is-editable' : ''}`} role={editable ? 'radiogroup' : 'img'} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        if (!editable) {
          return (
            <Star
              key={star}
              size={size}
              className={active ? 'is-on' : 'is-off'}
              fill={active ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
          );
        }
        return (
          <button
            key={star}
            type="button"
            className={active ? 'is-on' : 'is-off'}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            aria-checked={active && star === value}
            role="radio"
            onClick={() => onChange?.(star)}
          >
            <Star size={size} fill={active ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
