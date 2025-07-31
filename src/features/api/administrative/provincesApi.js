import { sedarApi } from "..";

const provincesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["provinces", "showProvinces"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postProvinces: build.mutation({
        query: (body) => ({
          url: "provinces/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["provinces"],
      }),

      getShowProvinces: build.query({
        query: (params) => ({
          url: `provinces?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showProvinces"],
      }),

      getAllShowProvinces: build.query({
        query: () => ({
          url: "provinces?pagination=none&status=active",
        }),
        providesTags: ["showProvinces"],
      }),

      getProvinceById: build.query({
        query: (id) => ({
          url: `provinces/${id}`,
        }),
        providesTags: ["showProvinces"],
      }),
    }),
  });

export const {
  usePostProvincesMutation,
  useGetShowProvincesQuery,
  useLazyGetShowProvincesQuery,
  useGetAllShowProvincesQuery,
  useLazyGetAllShowProvincesQuery,
  useGetProvinceByIdQuery,
  useLazyGetProvinceByIdQuery,
} = provincesApi;
