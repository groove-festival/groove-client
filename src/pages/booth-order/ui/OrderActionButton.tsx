interface OrderActionButtonProps {
  disabled?: boolean;
  label: string;
  onClick: () => void;
}

export const OrderActionButton = ({
  disabled = false,
  label,
  onClick,
}: OrderActionButtonProps) => {
  return (
    <button
      className="flex h-16 w-full items-center justify-center rounded-2xl bg-[#cfff04] p-2.5 text-xl leading-6 font-semibold text-[#1c1c1c] disabled:opacity-60"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
};
