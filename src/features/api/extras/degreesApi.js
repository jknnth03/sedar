import { sedarApi } from "..";

const degreesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["degrees"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postDegrees: build.mutation({
        query: (body) => ({
          url: "degrees",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["degrees"],
      }),

      getShowDegrees: build.query({
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

          return { url: `degrees?${queryParams.toString()}` };
        },
        providesTags: ["degrees"],
      }),

      updateDegrees: build.mutation({
        query: ({ id, ...body }) => ({
          url: `degrees/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["degrees"],
      }),

      deleteDegrees: build.mutation({
        query: (id) => ({
          url: `degrees/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["degrees"],
      }),

      getAllShowDegrees: build.query({
        query: ({ page = 1, per_page = 1000, status = "active" } = {}) => {
          const queryParams = new URLSearchParams();
          queryParams.append("page", page);
          queryParams.append("per_page", per_page);
          queryParams.append("status", status);
          queryParams.append("pagination", "true");

          return { url: `degrees?${queryParams.toString()}` };
        },
        providesTags: ["degrees"],
      }),
    }),
  });

export const {
  usePostDegreesMutation,
  useGetShowDegreesQuery,
  useUpdateDegreesMutation,
  useDeleteDegreesMutation,
  useGetAllShowDegreesQuery, // Added this export
  useLazyGetAllShowDegreesQuery, // This was already there
} = degreesApi;
