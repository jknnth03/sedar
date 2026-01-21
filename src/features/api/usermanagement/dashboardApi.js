import { sedarApi } from "..";

export const dashboardApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["Dashboard", "Notifications"], // ← UPDATED: Added Notifications tag
  })
  .injectEndpoints({
    endpoints: (build) => ({
      showDashboard: build.query({
        query: () => ({
          url: "dashboard/summary-counts",
          method: "GET",
        }),
        providesTags: ["Dashboard", "Notifications"], // ← UPDATED: Added both tags
      }),
    }),
  });

export const { useShowDashboardQuery } = dashboardApi;

// ← ALSO export as default for backward compatibility
export default dashboardApi;
