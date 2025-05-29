import { sedarApi } from "..";

const attainmentsEmpApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Attainment"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Fetch a paginated list of attainments
      getAttainments: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `employees/attainments?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: (result) =>
          result && result.data
            ? [
                { type: "Attainment", id: "LIST" },
                ...result.data.map(({ id }) => ({ type: "Attainment", id })),
              ]
            : [{ type: "Attainment", id: "LIST" }],
      }),

      updateAttainment: build.mutation({
        query: ({ id, ...data }) => ({
          url: `employees/attainments/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "Attainment", id },
          { type: "Attainment", id: "LIST" },
        ],
      }),

      deleteAttainment: build.mutation({
        query: (id) => ({
          url: `employees/attainments/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Attainment", id },
          { type: "Attainment", id: "LIST" },
        ],
      }),
    }),
  });

export const {
  useGetAttainmentsQuery,
  useUpdateAttainmentMutation,
  useDeleteAttainmentMutation,
} = attainmentsEmpApi;
