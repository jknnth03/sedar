import { sedarApi } from "..";

const provincesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["provinces"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postProvinces: build.mutation({
        query: (body) => ({
          url: "provinces",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["provinces"],
      }),

      getShowProvinces: build.query({
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

          return { url: `provinces?${queryParams.toString()}` };
        },
        providesTags: ["provinces"],
      }),

      updateProvinces: build.mutation({
        query: ({ id, ...body }) => ({
          url: `provinces/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["provinces"],
      }),

      deleteProvinces: build.mutation({
        query: (id) => ({
          url: `provinces/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["provinces"],
      }),
    }),
  });

export const {
  usePostProvincesMutation,
  useGetShowProvincesQuery,
  useUpdateProvincesMutation,
  useDeleteProvincesMutation,
} = provincesApi;
