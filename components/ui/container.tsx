import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export default function Container({
  children,
  as: Component = "div",
  className = "",
  ...props
}: ContainerProps) {
  return (
    <Component
      className={`mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
