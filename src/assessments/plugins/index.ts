import { getAssessmentPlugin, registerAssessmentPlugin } from "../core";
import { bigFivePlugin } from "./big5/plugin";
import { attachmentPlugin } from "./attachment/plugin";
import { lifeValuesPlugin } from "./life-values/plugin";
import { careerValuesPlugin } from "./career-values/plugin";
import { mbtiPlugin } from "./mbti/plugin";
import { riasecFullPlugin, riasecQuickPlugin } from "./riasec/plugin";

export * from "./big5/plugin";
export * from "./big5/scoring";
export * from "./attachment";
export * from "./life-values";
export * from "./career-values";
export * from "./mbti";
export * from "./riasec";

export function registerBuiltinAssessments(): void {
  if (!getAssessmentPlugin(attachmentPlugin.id)) registerAssessmentPlugin(attachmentPlugin);
  if (!getAssessmentPlugin(lifeValuesPlugin.id)) registerAssessmentPlugin(lifeValuesPlugin);
  if (!getAssessmentPlugin(careerValuesPlugin.id)) registerAssessmentPlugin(careerValuesPlugin);
  if (!getAssessmentPlugin(bigFivePlugin.id)) registerAssessmentPlugin(bigFivePlugin);
  if (!getAssessmentPlugin(mbtiPlugin.id)) registerAssessmentPlugin(mbtiPlugin);
  if (!getAssessmentPlugin(riasecFullPlugin.id)) registerAssessmentPlugin(riasecFullPlugin);
  if (!getAssessmentPlugin(riasecQuickPlugin.id)) registerAssessmentPlugin(riasecQuickPlugin);
}
