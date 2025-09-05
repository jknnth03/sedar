import { useSearchParams } from "react-router";

interface QueryConfig {
  retain?: boolean;
}

type QueryValue = string | number | boolean | null | undefined;

type SetQueryParamsAction = (
  params: Record<string, QueryValue>,
  config?: QueryConfig
) => void;

export const useRememberQueryParams = (): [
  Record<string, string>,
  SetQueryParamsAction,
  (paramKey?: string | string[]) => void
] => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Convert searchParams to a regular object
  const currentParams = Object.fromEntries(searchParams.entries());

  // Function to set query parameters
  const setQueryParams: SetQueryParamsAction = (
    params,
    config = { retain: false }
  ) => {
    const newParams = {
      ...(config.retain ? Object.fromEntries(searchParams.entries()) : {}),
    };

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        delete newParams[key];
      } else {
        newParams[key] = String(value);
      }
    });

    setSearchParams(newParams);
  };
  // Function to remove query parameters - now handles no arguments
  const removeQueryParams = (paramKey?: string | string[]) => {
    if (!paramKey) {
      // Actually clear all parameters when called with no arguments
      setSearchParams({});
      return;
    }

    // Convert searchParams to a plain object
    const newParams = Object.fromEntries(searchParams.entries());

    const keysToRemove = Array.isArray(paramKey) ? paramKey : [paramKey];

    keysToRemove.forEach((key) => {
      delete newParams[key];
    });

    setSearchParams(newParams);
  };

  return [currentParams, setQueryParams, removeQueryParams];
};
