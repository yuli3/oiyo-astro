import type { AssessmentPlugin } from "./plugin";

export interface AssessmentRegistry {
  get(id: string): AssessmentPlugin | undefined;
  list(): readonly AssessmentPlugin[];
  register(plugin: AssessmentPlugin): void;
}

function assertPluginIdentity(plugin: AssessmentPlugin): void {
  if (!plugin.id.trim()) throw new Error("Assessment plugin id must not be empty");
  if (plugin.manifest.id !== plugin.id) {
    throw new Error(
      `Assessment plugin id mismatch: ${plugin.id} !== ${plugin.manifest.id}`,
    );
  }
  if (!plugin.instrument.version.trim()) {
    throw new Error(`Assessment plugin ${plugin.id} has an empty instrument version`);
  }
  if (!plugin.scorer.version.trim()) {
    throw new Error(`Assessment plugin ${plugin.id} has an empty scoring version`);
  }
  if (!plugin.interpreter.version.trim()) {
    throw new Error(`Assessment plugin ${plugin.id} has an empty interpretation version`);
  }
}

export function createAssessmentRegistry(): AssessmentRegistry {
  const plugins = new Map<string, AssessmentPlugin>();

  return {
    get(id) {
      return plugins.get(id);
    },
    list() {
      return Object.freeze([...plugins.values()]);
    },
    register(plugin) {
      assertPluginIdentity(plugin);
      if (plugins.has(plugin.id)) {
        throw new Error(`Duplicate assessment plugin id: ${plugin.id}`);
      }
      plugins.set(plugin.id, plugin);
    },
  };
}

const staticRegistry = createAssessmentRegistry();

export const getAssessmentPlugin = (id: string): AssessmentPlugin | undefined =>
  staticRegistry.get(id);

export const listAssessmentPlugins = (): readonly AssessmentPlugin[] =>
  staticRegistry.list();

export const registerAssessmentPlugin = (plugin: AssessmentPlugin): void =>
  staticRegistry.register(plugin);
