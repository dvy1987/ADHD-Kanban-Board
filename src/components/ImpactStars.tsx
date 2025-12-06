import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImpactStarsProps {
  count: 1 | 2 | 3;
  onChange?: (count: 1 | 2 | 3) => void;
  readonly?: boolean;
}

export function ImpactStars({ count, onChange, readonly = false }: ImpactStarsProps) {
  const handleClick = (starIndex: number) => {
    if (readonly || !onChange) return;
    onChange((starIndex + 1) as 1 | 2 | 3);
  };

  const isHighImpact = count === 3;

  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleClick(index)}
          disabled={readonly}
          className={cn(
            'p-0.5 transition-all duration-200',
            !readonly && 'hover:scale-110 cursor-pointer',
            readonly && 'cursor-default',
            isHighImpact && index < count && 'animate-star-pulse'
          )}
          style={{
            animationDelay: `${index * 0.5}s`,
          }}
        >
          <Star
            className={cn(
              'w-5 h-5 transition-colors duration-200',
              index < count
                ? 'fill-[hsl(200_55%_55%)] text-[hsl(200_55%_55%)]'
                : 'fill-transparent text-[hsl(209_21%_21%/0.25)]'
            )}
          />
        </button>
      ))}
    </div>
  );
}