import { useState, ReactNode } from "react";

interface CollapsibleProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Collapsible({ trigger, children, className }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <button
        onClick={toggle}
        className="w-full text-left font-medium py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        {trigger}
      </button>
      {isOpen && <div className="pl-4">{children}</div>}
    </div>
  );
}
