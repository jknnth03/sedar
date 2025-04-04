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

          return { url: `tools?${queryParams.toString()}` };
        },
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
  useUpdateToolsMutation,
  useDeleteToolsMutation,
} = toolsApi;
