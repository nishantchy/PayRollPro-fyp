"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ChartConfig {
  [key: string]: {
    label: string;
    color?: string;
  };
}

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | undefined>(
  undefined
);

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

function ChartContainer({
  children,
  config,
  className,
  ...props
}: ChartContainerProps) {
  const values = React.useMemo(() => ({ config }), [config]);

  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    Object.entries(config).forEach(([key, value]) => {
      if (value.color) {
        vars[`--color-${key}`] = value.color;
      }
    });
    return vars;
  }, [config]);

  return (
    <ChartContext.Provider value={values}>
      <div
        className={cn("h-[350px] w-full", className)}
        style={cssVars}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
}

function useChartContext() {
  const context = React.useContext(ChartContext);
  if (context === undefined) {
    throw new Error("useChartContext must be used within a ChartProvider");
  }
  return context;
}

interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  indicator?: "dot" | "dashed";
  hideLabel?: boolean;
}

function ChartTooltipContent({
  className,
  indicator = "dot",
  hideLabel = false,
  ...props
}: ChartTooltipContentProps) {
  const { config } = useChartContext();

  return (
    <div
      className={cn(
        "rounded-lg border bg-background px-2.5 py-2 shadow-md",
        className
      )}
      {...props}
    >
      {/* Tooltip content gets populated dynamically by recharts */}
    </div>
  );
}

export { ChartContainer, ChartTooltipContent, ChartTooltip };

// Placeholder component to satisfy the import in the dashboard
function ChartTooltip({ children, ...props }: any) {
  return children;
}
