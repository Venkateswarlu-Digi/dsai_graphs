export default function ModelInfo({ meta }) {
  if (!meta) return null;
  return (
    <div className="foot-note">
      <span>
        model_suite: {meta.modelSuite} · sub_models: {meta.subModels} · model_version: {meta.modelVersion}
      </span>
      <span>
        run_id: {meta.runId} · confidence: {meta.confidence}
      </span>
    </div>
  );
}
