import React from "react";
import { cn } from "@/lib/ui";
import { SectionBackgroundProps } from "@/types/components";

export const SectionBackground: React.FC<SectionBackgroundProps> = ({ 
  className,
  variant = "default" 
}) => {
  const variantStyles = {
    green: "from-starbucks-green/10 via-transparent to-starbucks-green/15 dark:from-starbucks-green/20 dark:to-starbucks-green/10",
    neutral: "from-gray-100 via-transparent to-gray-200 dark:from-zinc-900 dark:to-zinc-800",
    default: "from-starbucks-green/5 via-transparent to-starbucks-green/10 dark:from-starbucks-green/10 dark:to-starbucks-green/5"
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Animated Gradient Background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br",
        variantStyles[variant]
      )}></div>

      {/* Animated Orbs - Large blurry shapes */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-starbucks-green/10 dark:bg-starbucks-green/20 rounded-full blur-[100px] animate-float opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-starbucks-green/5 dark:bg-starbucks-green/15 rounded-full blur-[80px] animate-float-delayed opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-[300px] h-[300px] bg-starbucks-green/8 dark:bg-starbucks-green/12 rounded-full blur-[60px] animate-pulse-slow opacity-40"></div>

      {/* Premium Dots/Points with Glow & Advanced Animations */}
      
      {/* Group 1: Floating Organic Points */}
      <div className="absolute top-20 left-[10%] w-3 h-3 bg-starbucks-green/40 dark:bg-starbucks-green/60 rounded-full blur-[1px] animate-float-organic shadow-[0_0_8px_rgba(0,98,65,0.4)]"></div>
      <div className="absolute bottom-40 right-[15%] w-2 h-2 bg-starbucks-green/30 dark:bg-starbucks-green/50 rounded-full blur-[0.5px] animate-float-organic [animation-delay:2s] shadow-[0_0_6px_rgba(0,98,65,0.3)]"></div>
      
      {/* Group 2: Twinkling Stars */}
      <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-starbucks-green/60 dark:bg-starbucks-green/80 rounded-full animate-twinkle"></div>
      <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-starbucks-green/50 dark:bg-starbucks-green/70 rounded-full animate-twinkle [animation-delay:1.5s]"></div>
      <div className="absolute top-10 right-[10%] w-1 h-1 bg-starbucks-green/70 dark:bg-starbucks-green/90 rounded-full animate-twinkle [animation-delay:3s]"></div>
      
      {/* Group 3: Pinging/Pulsing Pulse */}
      <div className="absolute bottom-20 left-[20%] w-2.5 h-2.5 bg-starbucks-green/40 dark:bg-starbucks-green/60 rounded-full animate-ping-slow shadow-[0_0_10px_rgba(0,98,65,0.5)]"></div>
      <div className="absolute top-[40%] right-[30%] w-2 h-2 bg-starbucks-green/35 dark:bg-starbucks-green/55 rounded-full animate-pulse-slower shadow-[0_0_8px_rgba(0,98,65,0.3)]"></div>

      {/* Group 4: Shooting Stars (Occasional highlight) */}
      <div className="absolute top-[20%] left-0 h-[2px] bg-gradient-to-r from-transparent via-starbucks-green/60 to-transparent animate-shooting-star rotate-[-45deg] blur-[1px]"></div>
      <div className="absolute top-[60%] right-[-100px] h-[1px] bg-gradient-to-r from-transparent via-starbucks-green/40 to-transparent animate-shooting-star [animation-delay:4s] rotate-[-45deg] blur-[1px]"></div>

      {/* Decorative Orbs with different delays */}
      <div className="absolute top-1/3 left-[5%] w-1 h-1 bg-starbucks-green/40 dark:bg-starbucks-green/60 rounded-full animate-bounce-slow"></div>
      <div className="absolute bottom-1/4 left-[40%] w-1.5 h-1.5 bg-starbucks-green/35 dark:bg-starbucks-green/55 rounded-full animate-float-dot [animation-delay:1s]"></div>
    </div>
  );
};


