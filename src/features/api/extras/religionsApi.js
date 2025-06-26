import { sedarApi } from "..";

const religionsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["religions"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postReligions: build.mutation({
        query: (body) => ({
          url: "religions",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["religions"],
      }),

      getShowReligions: build.query({
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

          return { url: `religions?${queryParams.toString()}` };
        },
        providesTags: ["religions"],
      }),

      updateReligions: build.mutation({
        query: ({ id, ...body }) => ({
          url: `religions/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["religions"],
      }),

      deleteReligions: build.mutation({
        query: (id) => ({
          url: `religions/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["religions"],
      }),

      getAllShowReligions: build.query({
        query: () => ({
          url: "religions?pagination=none&status=active",
        }),
        providesTags: ["showReligions"],
      }),
    }),
  });

export const {
  usePostReligionsMutation,
  useGetShowReligionsQuery,
  useUpdateReligionsMutation,
  useDeleteReligionsMutation,
  useGetAllShowReligionsQuery,
  useLazyGetAllShowReligionsQuery,
} = religionsApi;
