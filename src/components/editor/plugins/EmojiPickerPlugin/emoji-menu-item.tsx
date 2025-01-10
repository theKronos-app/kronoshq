import * as React from 'react';
import { cn } from '@/lib/utils';
import { EmojiOption } from './types';

interface EmojiMenuItemProps {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: EmojiOption;
}

export function EmojiMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: EmojiMenuItemProps) {
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={cn(
        "flex items-center px-2 py-1.5 text-sm cursor-pointer min-w-[180px]",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground outline-none",
        "rounded-md transition-colors",
        isSelected && "bg-accent text-accent-foreground"
      )}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <span className="flex items-center gap-2 flex-grow min-w-[150px]">
        <span className="flex w-5 h-5 items-center justify-center select-none">
          {option.emoji}
        </span>
        <span>{option.title}</span>
      </span>
    </li>
  );
}
