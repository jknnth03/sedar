import { sedarApi } from "..";

const moduleApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["dashboard"] })
  .injectEndpoints({
    endpoints: (build) => ({
      showDashboard: build.query({
        query: () => ({
          url: "dashboard/summary-counts",
          method: "GET",
        }),
        providesTags: ["dashboard"],
      }),
    }),
  });

export const { useShowDashboardQuery } = moduleApi;

export default moduleApi;
