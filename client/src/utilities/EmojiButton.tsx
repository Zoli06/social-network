import { forwardRef } from 'react';
import Twemoji from 'react-twemoji';

export const EmojiButton = ({
  onClick,
  emoji,
  customClass = '',
}: EmojiButtonProps) => {
  return <span
    onClick={onClick}
    className={`[&>img]:w-7 [&>img]:h-7 inline-block [&>img]:max-w-none cursor-pointer ${customClass}`}
  >{emoji}</span>;
};

EmojiButton.Wrapper = forwardRef(
  ({ children, ...props }: any, ref: any) => {
    return (
      // noWrapper breaks the code for some reason
      <Twemoji ref={ref} {...props}>
        {children}
      </Twemoji>
    );
  }
);

type EmojiButtonProps = {
  onClick?: () => void;
  emoji: string;
  customClass?: string;
};
