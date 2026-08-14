import React from "react";

type Direction = "h" | "v" | "diagonal" | "reverse-diagonal";
type BorderSides = "all" | "y" | "x" | "t" | "b" | "l" | "r";

interface HatchedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    direction?: Direction;
    sides?: BorderSides;
    /** سمك البوردر نفسه من الحواف (مثال: "p-4", "p-8", "p-[20px]") */
    padding?: string;
    stripeColor?: string;
    bgColor?: string;
    className?: string;
}

export const HatchedContainer: React.FC<HatchedContainerProps> = ({
    children,
    direction = "diagonal",
    sides = "all",
    padding,
    stripeColor = "rgba(0, 0, 0, 0.12)",
    bgColor = "#f3f3f3",
    className = "",
    ...props
}) => {
    const getDegree = (dir: Direction) => {
        switch (dir) {
            case "h": return "0deg";
            case "v": return "90deg";
            case "diagonal": return "45deg";
            case "reverse-diagonal": return "-45deg";
            default: return "45deg";
        }
    };

    const getSidesPadding = (side: BorderSides, p: string) => {
        const val = p.replace(/^p-/, "");

        switch (side) {
            case "all": return p;
            case "y": return `py-${val} px-0`;
            case "x": return `px-${val} py-0`;
            case "t": return `pt-${val} pb-0 px-0`;
            case "b": return `pb-${val} pt-0 px-0`;
            case "l": return `ps-${val} pe-0 py-0`;
            case "r": return `pe-${val} ps-0 py-0`;
            default: return p;
        }
    };

    const getResponsivePadding = (side: BorderSides) => {
        switch (side) {
            case "all": return "p-3 sm:p-5 lg:p-8";
            case "y": return "px-0 py-3 sm:py-5 lg:py-8";
            case "x": return "py-0 px-3 sm:px-5 lg:px-8";
            case "t": return "px-0 pb-0 pt-3 sm:pt-5 lg:pt-8";
            case "b": return "px-0 pt-0 pb-3 sm:pb-5 lg:pb-8";
            case "l": return "py-0 pe-0 ps-3 sm:ps-5 lg:ps-8";
            case "r": return "py-0 ps-0 pe-3 sm:pe-5 lg:pe-8";
            default: return "p-3 sm:p-5 lg:p-8";
        }
    };

    const degree = getDegree(direction);
    const activePadding = padding
        ? getSidesPadding(sides, padding)
        : getResponsivePadding(sides);

    const backgroundStyle: React.CSSProperties = {
        backgroundImage: `repeating-linear-gradient(
      ${degree},
      ${stripeColor},
      ${stripeColor} 1px,
      ${bgColor} 1px,
      ${bgColor} 3px
    )`,
    };

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={backgroundStyle}
            {...props}
        >
            <div className={`w-full h-full ${activePadding}`}>
                {children}
            </div>
        </div>
    );
};
