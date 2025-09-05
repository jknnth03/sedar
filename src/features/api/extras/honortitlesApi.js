import { sedarApi } from "..";

const honorTitlesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["honor-titles"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postHonorTitles: build.mutation({
        query: (body) => ({
          url: "honor-titles",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["honor-titles"],
      }),

      getShowHonorTitles: build.query({
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

          return { url: `honor-titles?${queryParams.toString()}` };
        },
        providesTags: ["honor-titles"],
      }),

      updateHonorTitles: build.mutation({
        query: ({ id, ...body }) => ({
          url: `honor-titles/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["honor-titles"],
      }),

      deleteHonorTitles: build.mutation({
        query: ({ id, restore }) => ({
          url: `honor-titles/${id}`,
          method: "DELETE",
          body: {
            deleted_at: restore ? null : new Date().toISOString(), // Archive or Restore
          },
        }),
        invalidatesTags: ["honor-titles"],
      }),

      getAllShowHonorTitles: build.query({
        query: ({ page = 1, per_page = 1000, status = "active" } = {}) => {
          const queryParams = new URLSearchParams();
          queryParams.append("page", page);
          queryParams.append("per_page", per_page);
          queryParams.append("status", status);
          queryParams.append("pagination", "true");

          return { url: `honor-titles?${queryParams.toString()}` };
        },
        providesTags: ["honor-titles"],
      }),
    }),
  });

export const {
  usePostHonorTitlesMutation,
  useGetShowHonorTitlesQuery,
  useUpdateHonorTitlesMutation,
  useDeleteHonorTitlesMutation,
  useGetAllShowHonorTitlesQuery, // Added this export
  useLazyGetAllShowHonorTitlesQuery, // This was already there
} = honorTitlesApi;
