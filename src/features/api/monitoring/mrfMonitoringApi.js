import { sedarApi } from "..";

const mrfMonitoringApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["MRFSubmission", "MRFSubmissionMaster"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMRFSubmissions: build.query({
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
            url: `monitoring/mrf-submissions?${params.toString()}`,
          };
        },
        providesTags: (result) =>
          result && result.result && result.result.data
            ? [
                { type: "MRFSubmission", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "MRFSubmission",
                  id,
                })),
              ]
            : [{ type: "MRFSubmission", id: "LIST" }],
      }),
      getAllMRFSubmissions: build.query({
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
            url: `monitoring/mrf-submissions?${params.toString()}`,
          };
        },
        providesTags: (result) =>
          result?.result?.data || result?.data || result
            ? [
                { type: "MRFSubmissionMaster", id: "ALL" },
                ...(result?.result?.data || result?.data || result || []).map(
                  ({ id }) => ({
                    type: "MRFSubmissionMaster",
                    id,
                  })
                ),
              ]
            : [{ type: "MRFSubmissionMaster", id: "ALL" }],
      }),
      getMRFSubmissionById: build.query({
        query: (submissionId) => ({
          url: `monitoring/mrf-submissions/${submissionId}`,
        }),
        providesTags: (result, error, submissionId) => [
          { type: "MRFSubmission", id: submissionId },
        ],
      }),
    }),
  });

export const {
  useGetMRFSubmissionsQuery,
  useGetAllMRFSubmissionsQuery,
  useGetMRFSubmissionByIdQuery,
} = mrfMonitoringApi;

export default mrfMonitoringApi;
