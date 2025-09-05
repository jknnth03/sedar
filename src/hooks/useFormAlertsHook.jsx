const useFormAlerts = () => {
  const getAlerts = ({
    errorMessage,
    religionsError,
    prefixesError,
    generalsError,
  }) => {
    const alerts = [];

    if (errorMessage) {
      alerts.push({
        key: "error-message",
        severity: "error",
        message: errorMessage,
      });
    }

    if (religionsError) {
      alerts.push({
        key: "religions-error",
        severity: "warning",
        message: "Failed to load religions from server.",
      });
    }

    if (prefixesError) {
      alerts.push({
        key: "prefixes-error",
        severity: "warning",
        message: "Failed to load prefixes from server.",
      });
    }

    if (generalsError) {
      alerts.push({
        key: "generals-error",
        severity: "warning",
        message: "Failed to load referrers from server.",
      });
    }

    return alerts.length > 0 ? alerts : null;
  };

  return { getAlerts };
};

export default useFormAlerts;
