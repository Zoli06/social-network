import { useEffect, useState } from 'react';
import { Artboard } from 'react-daisyui';
import { SvgButton } from './SvgButton';

export let showNotification: (props: NotificationProps) => void = () => {};

export const Notification = () => {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [borderColor, setBorderColor] = useState('');
  const [onClick, setOnClick] = useState(() => () => {});
  const [duration, setDuration] = useState(0);

  showNotification = ({
    title,
    description,
    backgroundColor,
    textColor,
    borderColor,
    onClick,
    duration,
  }) => {
    setShow(true);
    setTitle(title);
    setDescription(description || '');
    setBackgroundColor(backgroundColor || '#fff');
    setTextColor(textColor || '#000');
    setBorderColor(borderColor || '#000');
    // https://medium.com/swlh/how-to-store-a-function-with-the-usestate-hook-in-react-8a88dd4eede1
    setOnClick(() => () => onClick);
    setDuration(duration || 20000);
  };

  useEffect(() => {
    if (duration) {
      setTimeout(() => {
        setShow(false);
      }, duration);
    }
  }, [duration]);

  return (
    <Artboard
      className={`${
        show ? 'absolute' : 'hidden'
      } bottom-4 right-4 p-4 rounded-md shadow-lg w-fit border-2`}
      style={{ backgroundColor, color: textColor, borderColor }}
      onClick={onClick}
    >
      <div className='flex items-center justify-between gap-4'>
        <div>
          <div>{title}</div>
          <div>{description}</div>
        </div>
        <SvgButton
          customClass='!fill-transparent !h-10 !w-10'
          onClick={() => setShow(false)}
          icon='close-button'
        />
      </div>
    </Artboard>
  );
};

type NotificationProps = {
  title: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  onClick?: () => void;
  duration?: number;
};
