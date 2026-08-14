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
    padding = "p-8",
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
            case "l": return `pl-${val} pr-0 py-0`;
            case "r": return `pr-${val} pl-0 py-0`;
            default: return p;
        }
    };

    const degree = getDegree(direction);
    const activePadding = getSidesPadding(sides, padding);

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