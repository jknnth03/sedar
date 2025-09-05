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
        query: (params) => {
          let url = `provinces?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`;

          if (params.psgc_id) {
            url += `&psgc_id=${params.psgc_id}`;
          }

          return { url };
        },
        providesTags: ["showProvinces"],
      }),

      getAllShowProvinces: build.query({
        query: (params = {}) => {
          let url = "provinces?pagination=none&status=active";

          if (params.psgc_id) {
            url += `&psgc_id=${params.psgc_id}`;
          }

          return { url };
        },
        providesTags: ["showProvinces"],
      }),

      getProvincesByRegion: build.query({
        query: (regionPsgcId) => ({
          url: `provinces?pagination=none&status=active&psgc_id=${regionPsgcId}`,
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
  useGetProvincesByRegionQuery,
  useLazyGetProvincesByRegionQuery,
  useGetProvinceByIdQuery,
  useLazyGetProvinceByIdQuery,
} = provincesApi;
