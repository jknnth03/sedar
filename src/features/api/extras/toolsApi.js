import { sedarApi } from "..";

const toolsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["tools"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postTools: build.mutation({
        query: (body) => ({
          url: "tools",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["tools"],
      }),

      getShowTools: build.query({
        query: (params) => ({
          url: `tools?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["tools"],
      }),

      getAllShowTools: build.query({
        query: () => ({
          url: `tools?pagination=none&status=active`,
        }),
        providesTags: ["tools"],
      }),

      updateTools: build.mutation({
        query: ({ id, ...body }) => ({
          url: `tools/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["tools"],
      }),

      deleteTools: build.mutation({
        query: (id) => ({
          url: `tools/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["tools"],
      }),
    }),
  });

export const {
  usePostToolsMutation,
  useGetShowToolsQuery,
  useGetAllShowToolsQuery,
  useUpdateToolsMutation,
  useDeleteToolsMutation,
} = toolsApi;
