import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import * as React from 'react';
import {cn} from '@/lib/utils';

type Props = {
  className?: string;
  placeholderClassName?: string;
  placeholder: string;
};

export default function LexicalContentEditable({
  className,
  placeholder,
  placeholderClassName,
}: Props): JSX.Element {
  return (
    <ContentEditable
      className={cn(
        'border-0 text-[15px] block relative outline-none px-7 pb-10 pt-2 min-h-[150px] md:px-2 ',
        className
      )}
      aria-placeholder={placeholder}
      placeholder={
        <div className={cn(
          'text-[15px] text-[#999] overflow-hidden absolute truncate top-2 left-7 right-7 select-none whitespace-nowrap inline-block pointer-events-none md:left-2 md:right-2',
          placeholderClassName
        )}>
          {placeholder}
        </div>
      }
    />
  );
}