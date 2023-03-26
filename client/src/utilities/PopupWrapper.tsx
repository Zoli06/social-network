import { ReactNode } from 'react';

export const PopupWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className='fixed top-0 left-0 w-full h-full z-50 bg-black/50 flex flex-col justify-center items-center gap-4 p-4'>
      {children}
    </div>
  );
};
