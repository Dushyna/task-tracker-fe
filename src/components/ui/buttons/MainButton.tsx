import React from "react";

type ButtonVariant = "primary" | "danger";

interface MainButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    width?: number;
}

export default function MainButton({children, variant = "primary", width, className = "", ...props}: MainButtonProps) {

    const baseStyles = "rounded-xl px-6 py-2.5 text-sm font-black text-white transition-all duration-300 ease-in-out hover:scale-[1.20]";

    const variantStyles = {
        primary:
            "bg-cyan-700 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-500 hover:shadow-[0_0_35px_rgba(6,182,212,0.8)]",
        danger:
            "bg-red-500 border border-red-300/50 shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:bg-red-700 hover:shadow-[0_0_35px_rgba(239,68,68,0.9)]",
    };

    return (
        <button
            type={props.type ?? "button"}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={width ? { width: `${width}px` } : undefined}
            {...props}
        >
            {children}
        </button>
    );
}