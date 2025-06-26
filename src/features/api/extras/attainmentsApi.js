import { sedarApi } from "..";

const attainmentsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["attainments"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postAttainments: build.mutation({
        query: (body) => ({
          url: "attainments",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["attainments"],
      }),

      getShowAttainments: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status,
          search = "",
          pagination = true,
        }) => {
          const queryParams = new URLSearchParams();

          queryParams.append("page", page);
          queryParams.append("per_page", per_page);
          queryParams.append("pagination", pagination);

          if (status) queryParams.append("status", status);
          if (search) queryParams.append("search", search);

          return { url: `attainments?${queryParams.toString()}` };
        },
        providesTags: ["attainments"],
      }),

      updateAttainments: build.mutation({
        query: ({ id, ...body }) => ({
          url: `attainments/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["attainments"],
      }),

      deleteAttainments: build.mutation({
        query: (id) => ({
          url: `attainments/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["attainments"],
      }),

      getAllShowAttainments: build.query({
        query: ({ page = 1, per_page = 1000, status = "active" } = {}) => {
          const queryParams = new URLSearchParams();
          queryParams.append("page", page);
          queryParams.append("per_page", per_page);
          queryParams.append("status", status);
          queryParams.append("pagination", "true");

          return { url: `attainments?${queryParams.toString()}` };
        },
        providesTags: ["attainments"],
      }),
    }),
  });

export const {
  usePostAttainmentsMutation,
  useGetShowAttainmentsQuery,
  useUpdateAttainmentsMutation,
  useDeleteAttainmentsMutation,
  useGetAllShowAttainmentsQuery, // Added this export
  useLazyGetAllShowAttainmentsQuery, // This was already there
} = attainmentsApi;
