import { sedarApi } from "..";

const dataChangeMonitoringApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["DataChangeMonitoring", "DataChangeMonitoringMaster"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getDataChangeMonitoring: build.query({
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

          // Remove view_mode if it exists
          params.delete("view_mode");

          return {
            url: `monitoring/data-change-submissions?${params.toString()}`,
          };
        },
        providesTags: (result) =>
          result && result.result && result.result.data
            ? [
                { type: "DataChangeMonitoring", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "DataChangeMonitoring",
                  id,
                })),
              ]
            : [{ type: "DataChangeMonitoring", id: "LIST" }],
      }),
      getAllDataChangeMonitoring: build.query({
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

          // Remove view_mode if it exists
          params.delete("view_mode");

          return {
            url: `monitoring/data-change-submissions?${params.toString()}`,
          };
        },
        providesTags: (result) =>
          result?.result?.data || result?.data || result
            ? [
                { type: "DataChangeMonitoringMaster", id: "ALL" },
                ...(result?.result?.data || result?.data || result || []).map(
                  ({ id }) => ({
                    type: "DataChangeMonitoringMaster",
                    id,
                  })
                ),
              ]
            : [{ type: "DataChangeMonitoringMaster", id: "ALL" }],
      }),
      getDataChangeMonitoringById: build.query({
        query: (submissionId) => ({
          url: `monitoring/data-change-submissions/${submissionId}`,
        }),
        providesTags: (result, error, submissionId) => [
          { type: "DataChangeMonitoring", id: submissionId },
        ],
      }),
    }),
  });

export const {
  useGetDataChangeMonitoringQuery,
  useGetAllDataChangeMonitoringQuery,
  useGetDataChangeMonitoringByIdQuery,
} = dataChangeMonitoringApi;

export default dataChangeMonitoringApi;
