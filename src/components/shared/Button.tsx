import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { css } from "~/utils/styles";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button({
  children,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      {...props}
      className={css(
        "border border-border px-8 py-1",
        "hover:bg-red-400 hover:text-red-900",
        "focus:outline-none disabled:opacity-50"
      )}
    >
      {children}
    </button>
  );
}
