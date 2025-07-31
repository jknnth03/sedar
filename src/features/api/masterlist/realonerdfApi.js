import { sedarApi } from "..";

const oneChargingApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["oneRdf"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getShowOneRdf: build.query({
        query: (params) => ({
          url: `one-charging?pagination=${params.pagination}&per_page=${params.per_page}&page=${params.page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["oneRdf"],
      }),

      getAllOneRdf: build.query({
        query: () => ({
          url: `one-charging?pagination=none&status=active`,
        }),
        providesTags: ["oneRdf"],
      }),
    }),
  });

export const {
  useGetShowOneRdfQuery,
  useLazyGetShowOneRdfQuery,
  useGetAllOneRdfQuery,
  useLazyGetAllOneRdfQuery,
} = oneChargingApi;
