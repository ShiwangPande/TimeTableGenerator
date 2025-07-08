import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Customizable SVG Logo */}
      <div className={cn("flex items-center justify-center rounded-lg bg-gradient-to-br from-school-primary to-school-secondary", sizeClasses[size])}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3/4 w-3/4 text-white"
        >
          {/* Calendar/Clock Icon */}
          <path
            d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 14H10V16H8V14ZM12 14H14V16H12V14ZM16 14H18V16H16V14Z"
            fill="currentColor"
          />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-heading font-bold text-foreground", textSizes[size])}>
            TimeTable
          </span>
          <span className={cn("text-xs text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
            Generator
          </span>
        </div>
      )}
    </div>
  )
} 