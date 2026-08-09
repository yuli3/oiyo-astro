import * as React from "react";

import { cn } from "@/lib/system/utils";

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      className={cn("min-w-0 space-y-4", className)}
      data-slot="field-set"
      {...props}
    />
  );
}

const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.ComponentPropsWithoutRef<"legend">
>(({ className, ...props }, ref) => (
  <legend
    className={cn(
      "w-full text-balance text-center text-lg font-bold leading-7 outline-none",
      className,
    )}
    data-slot="field-legend"
    ref={ref}
    {...props}
  />
));
FieldLegend.displayName = "FieldLegend";

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid gap-2", className)}
      data-slot="field-group"
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      data-slot="field-description"
      {...props}
    />
  );
}

export { FieldDescription, FieldGroup, FieldLegend, FieldSet };
