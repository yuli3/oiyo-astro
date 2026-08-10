import * as React from "react";

import { cn } from "@/lib/system/utils";

// block을 유지한다. flex로 바꾸면 FieldLegend의 float이 무시돼(flex item에는
// float이 적용되지 않는다) legend가 다시 테두리에 걸터앉는다.
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      className={cn("min-w-0 space-y-4", className)}
      data-slot="field-set"
      {...props}
    />
  );
}

// float-left는 장식이 아니다. 테두리를 가진 fieldset의 첫 <legend>는 브라우저가
// "rendered legend"로 취급해 padding box 밖 상단 테두리 위에 얹는다 — 질문이 두
// 줄이면 테두리를 끊고 아래에 죽은 여백이 생긴다. CSS 규격상 float된 legend는
// rendered legend가 아니므로 평범한 블록으로 흘러 padding 안에 들어온다.
// 뒤따르는 FieldGroup의 clear-both와 한 세트다.
const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.ComponentPropsWithoutRef<"legend">
>(({ className, ...props }, ref) => (
  <legend
    className={cn(
      "float-left w-full text-balance text-center text-lg font-bold leading-7 outline-none",
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
      className={cn("clear-both grid gap-2", className)}
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
