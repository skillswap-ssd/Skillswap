declare namespace React {
  type ReactNode = any;
  type ComponentType<P = {}> = (props: P) => any;
  interface HTMLAttributes<T> { [key: string]: any; className?: string; children?: ReactNode; key?: string | number }
  interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> { type?: "button" | "submit" | "reset"; disabled?: boolean; onClick?: any }
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> { type?: string; placeholder?: string; required?: boolean; defaultChecked?: boolean; name?: string; value?: any; checked?: boolean; "aria-label"?: string }
}

declare namespace JSX {
  type Element = any;
  interface ElementChildrenAttribute { children: {}; }
  interface IntrinsicAttributes { key?: string | number; [key: string]: any }
  interface IntrinsicElements { [elemName: string]: any }
}
