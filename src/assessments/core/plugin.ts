import type { AssessmentLocaleBundle } from "./locale";
import type { AssessmentManifest } from "./manifest";
import type { InstrumentDefinition } from "./instrument";
import type { InterpretationComposer } from "./interpretation";
import type { ResultMigration } from "./migration";
import type { OntologyContribution } from "./ontology";
import type { AssessmentScorer } from "./scoring";
import type { SourceBundle } from "./source";
import type { ExportPolicy } from "./export";

export interface AssessmentPlugin {
  exportPolicy: ExportPolicy;
  id: string;
  instrument: InstrumentDefinition;
  interpreter: InterpretationComposer;
  locale: AssessmentLocaleBundle;
  manifest: AssessmentManifest;
  migrations: ResultMigration[];
  ontology: OntologyContribution;
  schemaVersion: 2;
  scorer: AssessmentScorer;
  sources: SourceBundle;
}
