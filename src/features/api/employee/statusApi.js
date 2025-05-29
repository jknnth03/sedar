import { sedarApi } from "..";

const statusApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Status"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Fetch a paginated list of statuses
      getStatus: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `employees/statuses?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: (result) =>
          result && result.data
            ? [
                { type: "Status", id: "LIST" },
                ...result.data.map(({ id }) => ({ type: "Status", id })),
              ]
            : [{ type: "Status", id: "LIST" }],
      }),

      updateStatus: build.mutation({
        query: ({ id, ...data }) => ({
          url: `employees/statuses/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "Status", id },
          { type: "Status", id: "LIST" },
        ],
      }),

      deleteStatus: build.mutation({
        query: (id) => ({
          url: `employees/statuses/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Status", id },
          { type: "Status", id: "LIST" },
        ],
      }),
    }),
  });

export const {
  useGetStatusQuery,
  useUpdateStatusMutation,
  useDeleteStatusMutation,
} = statusApi;
