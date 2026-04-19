import { cva, type VariantProps } from "class-variance-authority";

const capsule = cva(
  "rounded-md p-1 px-3 text-sm",
  {
    variants: {
      theme: {
        blue: "rounded-sm bg-[#B2B8FF] dark:bg-[#7480FFCC]",
        green: "bg-[#3cc923]",
      },
    },
    defaultVariants: {
      theme: "blue",
    },
  }
);

export interface CapsuleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof capsule> {}

export function Capsule({ children, theme, ...props }: CapsuleProps) {
  return (
    <div className={capsule({ theme })} {...props}>
      {children}
    </div>
  );
}
