export const SvgButton = ({
  onClick,
  icon,
  customClass = '',
}: SvgButtonProps) => {
  return (
    <svg onClick={onClick} className={`w-7 h-7 cursor-pointer fill-black/80 hover:fill-black dark:fill-white/80 hover:dark:fill-white ${customClass}`}>
      <use href={`/assets/images/svg-bundle.svg#${icon}`} />
    </svg>
  )
}

type SvgButtonProps = {
  onClick?: () => void;
  icon: string;
  customClass?: string;
}
