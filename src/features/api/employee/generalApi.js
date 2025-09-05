import { sedarApi } from "..";

const generalApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["general"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postGeneral: build.mutation({
        query: (body) => ({
          url: "employees/general-info",
          method: "POST",
          body,
        }),
        invalidatesTags: ["general"],
      }),

      updateGeneral: build.mutation({
        query: ({ id, ...body }) => ({
          url: `employees/${id}/general-info`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["general"],
      }),

      getGenerals: build.query({
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

          return { url: `employees/general-info?${params.toString()}` };
        },
        providesTags: ["general"],
      }),

      getAllGenerals: build.query({
        query: () => ({
          url: `employees/general-info?pagination=none&status=active`,
        }),
        providesTags: ["general"],
      }),

      getSingleGeneral: build.query({
        query: (id) => ({
          url: `employees/${id}/general-info`,
        }),
        providesTags: ["general"],
      }),

      getAllManpower: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `mrf/open?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: ["general"],
      }),

      getEmployeeStatuses: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
          employment_status,
        }) => {
          const params = new URLSearchParams({
            pagination: "1",
            page: page.toString(),
            per_page: per_page.toString(),
            status,
            search,
          });

          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          return { url: `employees/statuses?${params.toString()}` };
        },
        providesTags: ["general"],
      }),

      getAllEmployeeStatuses: build.query({
        query: () => ({
          url: `employees/statuses?pagination=none&status=active`,
        }),
        providesTags: ["general"],
      }),

      deleteGeneral: build.mutation({
        query: (id) => ({
          url: `employees/${id}/general-info`,
          method: "DELETE",
        }),
        invalidatesTags: ["general"],
      }),
    }),
  });

export const {
  usePostGeneralMutation,
  useGetGeneralsQuery,
  useGetAllGeneralsQuery,
  useLazyGetAllGeneralsQuery,
  useGetSingleGeneralQuery,
  useGetAllManpowerQuery,
  useLazyGetAllManpowerQuery,
  useGetEmployeeStatusesQuery,
  useLazyGetEmployeeStatusesQuery,
  useGetAllEmployeeStatusesQuery,
  useLazyGetAllEmployeeStatusesQuery,
  useUpdateGeneralMutation,
  useDeleteGeneralMutation,
} = generalApi;
