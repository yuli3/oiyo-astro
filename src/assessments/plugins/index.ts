import { getAssessmentPlugin, registerAssessmentPlugin } from "../core";
import { bigFivePlugin } from "./big5/plugin";
import { mbtiPlugin } from "./mbti/plugin";
import { riasecFullPlugin, riasecQuickPlugin } from "./riasec/plugin";

export * from "./big5/plugin";
export * from "./big5/scoring";
export * from "./mbti";
export * from "./riasec";

export function registerBuiltinAssessments(): void {
  if (!getAssessmentPlugin(bigFivePlugin.id)) registerAssessmentPlugin(bigFivePlugin);
  if (!getAssessmentPlugin(mbtiPlugin.id)) registerAssessmentPlugin(mbtiPlugin);
  if (!getAssessmentPlugin(riasecFullPlugin.id)) registerAssessmentPlugin(riasecFullPlugin);
  if (!getAssessmentPlugin(riasecQuickPlugin.id)) registerAssessmentPlugin(riasecQuickPlugin);
}
