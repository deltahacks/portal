type ScanYearsStatusProps = {
  isError: boolean;
  isFetching: boolean;
  onRetry: () => void;
};

const ScanYearsStatus: React.FC<ScanYearsStatusProps> = ({
  isError,
  isFetching,
  onRetry,
}) => {
  if (isError) {
    return (
      <div role="alert" className="alert alert-error flex flex-wrap gap-4">
        <span>Could not load DeltaHacks years. Please try again.</span>
        <button
          type="button"
          className="btn btn-sm"
          onClick={onRetry}
          disabled={isFetching}
        >
          {isFetching ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <div role="status" className="flex flex-col items-center gap-3 py-8">
      <progress className="progress progress-primary w-56" />
      <span>Loading DeltaHacks years...</span>
    </div>
  );
};

export default ScanYearsStatus;
