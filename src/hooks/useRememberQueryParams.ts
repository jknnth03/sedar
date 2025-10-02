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
  const currentParams = Object.fromEntries(searchParams.entries());

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
  const removeQueryParams = (paramKey?: string | string[]) => {
    if (!paramKey) {
      setSearchParams({});
      return;
    }

    const newParams = Object.fromEntries(searchParams.entries());

    const keysToRemove = Array.isArray(paramKey) ? paramKey : [paramKey];

    keysToRemove.forEach((key) => {
      delete newParams[key];
    });

    setSearchParams(newParams);
  };

  return [currentParams, setQueryParams, removeQueryParams];
};
