import React from 'react';
import { BaseIconProps } from '@/types/icons';

interface EmojiIconProps extends BaseIconProps {
  emoji: string;
}

const EmojiIcon: React.FC<EmojiIconProps> = ({ 
  emoji, 
  filled = false, 
  className = "", 
  "aria-label": ariaLabel 
}) => {
  return (
    <span 
      className={`inline-flex items-center justify-center select-none ${className}`}
      role="img"
      aria-label={ariaLabel || 'emoji icon'}
      style={{ fontSize: 'inherit', lineHeight: 1 }}
    >
      {emoji}
    </span>
  );
};

export default EmojiIcon;