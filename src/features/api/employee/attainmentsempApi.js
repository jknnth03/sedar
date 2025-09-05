import { sedarApi } from "..";

const attainmentsEmpApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Attainment", "AttainmentMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getAttainments: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
          employment_status,
          statuses = [],
        }) => {
          const params = new URLSearchParams({
            pagination: "1",
            page: page.toString(),
            per_page: per_page.toString(),
            status,
            search,
          });

          // Handle single employment_status
          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          // Handle multiple statuses - send as comma-separated or multiple employment_status params
          if (statuses && statuses.length > 0) {
            // Option 1: Send as comma-separated string
            params.append("employment_status", statuses.join(","));

            // Option 2: Send as multiple employment_status parameters (uncomment if needed)
            // statuses.forEach(status => {
            //   params.append("employment_status", status);
            // });
          }

          return { url: `employees/attainments?${params.toString()}` };
        },
        providesTags: (result) =>
          result && result.result && result.result.data
            ? [
                { type: "Attainment", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "Attainment",
                  id,
                })),
              ]
            : [{ type: "Attainment", id: "LIST" }],
      }),
      getAllAttainments: build.query({
        query: ({
          page = 1,
          per_page = 100,
          status = "active",
          search = "",
          employment_status,
          statuses = [],
        } = {}) => {
          const params = new URLSearchParams({
            pagination: "1",
            page: page.toString(),
            per_page: per_page.toString(),
            status,
            search,
          });

          // Handle single employment_status
          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          // Handle multiple statuses - send as comma-separated or multiple employment_status params
          if (statuses && statuses.length > 0) {
            // Option 1: Send as comma-separated string
            params.append("employment_status", statuses.join(","));

            // Option 2: Send as multiple employment_status parameters (uncomment if needed)
            // statuses.forEach(status => {
            //   params.append("employment_status", status);
            // });
          }

          return { url: `employees/attainments?${params.toString()}` };
        },
        providesTags: (result) =>
          result?.result?.data || result?.data || result
            ? [
                { type: "AttainmentMaster", id: "ALL" },
                ...(result?.result?.data || result?.data || result || []).map(
                  ({ id }) => ({
                    type: "AttainmentMaster",
                    id,
                  })
                ),
              ]
            : [{ type: "AttainmentMaster", id: "ALL" }],
      }),
      getAttainmentAttachment: build.query({
        query: (attainmentId) => ({
          url: `employees/attainments/${attainmentId}/attachment`,
          responseHandler: async (response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch attachment");
            }
            return await response.blob();
          },
        }),
        providesTags: (result, error, attainmentId) => [
          { type: "Attainment", id: attainmentId },
        ],
      }),
      updateAttainment: build.mutation({
        query: ({ employeeId, attainmentId, ...data }) => ({
          url: `employees/${employeeId}/attainments/${attainmentId}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (result, error, { attainmentId }) => [
          { type: "Attainment", id: attainmentId },
          { type: "Attainment", id: "LIST" },
          { type: "AttainmentMaster", id: "ALL" },
        ],
      }),
      deleteAttainment: build.mutation({
        query: ({ employeeId, attainmentId }) => ({
          url: `employees/${employeeId}/attainments/${attainmentId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { attainmentId }) => [
          { type: "Attainment", id: attainmentId },
          { type: "Attainment", id: "LIST" },
          { type: "AttainmentMaster", id: "ALL" },
        ],
      }),
    }),
  });

export const {
  useGetAttainmentsQuery,
  useGetAllAttainmentsQuery,
  useGetAttainmentAttachmentQuery,
  useUpdateAttainmentMutation,
  useDeleteAttainmentMutation,
} = attainmentsEmpApi;

export default attainmentsEmpApi;
