import { sedarApi } from "..";

const mdaMonitoringApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["MDAMonitoring", "MDAMonitoringMaster"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMDAMonitoring: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          approval_status = "",
          search = "",
        }) => {
          const params = new URLSearchParams({
            pagination: "1",
            page: page.toString(),
            per_page: per_page.toString(),
            status,
            approval_status,
            search,
          });

          return {
            url: `monitoring/mda-submissions?${params.toString()}`,
          };
        },
        providesTags: (result) =>
          result && result.result && result.result.data
            ? [
                { type: "MDAMonitoring", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "MDAMonitoring",
                  id,
                })),
              ]
            : [{ type: "MDAMonitoring", id: "LIST" }],
      }),
      getAllMDAMonitoring: build.query({
        query: ({
          page = 1,
          per_page = 100,
          status = "active",
          approval_status = "",
          search = "",
        } = {}) => {
          const params = new URLSearchParams({
            pagination: "1",
            page: page.toString(),
            per_page: per_page.toString(),
            status,
            approval_status,
            search,
          });

          return {
            url: `monitoring/mda-submissions?${params.toString()}`,
          };
        },
        providesTags: (result) =>
          result?.result?.data || result?.data || result
            ? [
                { type: "MDAMonitoringMaster", id: "ALL" },
                ...(result?.result?.data || result?.data || result || []).map(
                  ({ id }) => ({
                    type: "MDAMonitoringMaster",
                    id,
                  })
                ),
              ]
            : [{ type: "MDAMonitoringMaster", id: "ALL" }],
      }),
      getMDAMonitoringById: build.query({
        query: (submissionId) => ({
          url: `monitoring/mda-submissions/${submissionId}`,
        }),
        providesTags: (result, error, submissionId) => [
          { type: "MDAMonitoring", id: submissionId },
        ],
      }),
    }),
  });

export const {
  useGetMDAMonitoringQuery,
  useGetAllMDAMonitoringQuery,
  useGetMDAMonitoringByIdQuery,
} = mdaMonitoringApi;

export default mdaMonitoringApi;
