import { sedarApi } from "..";

const subMunicipalitiesApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["subMunicipalities", "showSubMunicipalities"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      postSubMunicipalities: build.mutation({
        query: (body) => ({
          url: "sub-municipalities/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["subMunicipalities"],
      }),

      getShowSubMunicipalities: build.query({
        query: (params) => ({
          url: `sub-municipalities?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showSubMunicipalities"],
      }),

      getAllShowSubMunicipalities: build.query({
        query: () => ({
          url: "sub-municipalities?pagination=none&status=active",
        }),
        providesTags: ["showSubMunicipalities"],
      }),
    }),
  });

export const {
  usePostSubMunicipalitiesMutation,
  useGetShowSubMunicipalitiesQuery,
  useLazyGetShowSubMunicipalitiesQuery, // Lazy version
  useGetAllShowSubMunicipalitiesQuery,
  useLazyGetAllShowSubMunicipalitiesQuery, // Lazy version
} = subMunicipalitiesApi;

export default subMunicipalitiesApi;
