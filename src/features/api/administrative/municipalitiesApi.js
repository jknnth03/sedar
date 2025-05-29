import { sedarApi } from "..";

const municipalitiesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["municipalities", "showMunicipalities"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postMunicipalities: build.mutation({
        query: (body) => ({
          url: "cities-municipalities/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["municipalities"],
      }),

      getShowMunicipalities: build.query({
        query: (params) => ({
          url: `cities-municipalities?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showMunicipalities"],
      }),

      getAllShowMunicipalities: build.query({
        query: () => ({
          url: "cities-municipalities?pagination=none&status=active",
        }),
        providesTags: ["showMunicipalities"],
      }),
    }),
  });

export const {
  usePostMunicipalitiesMutation,
  useGetShowMunicipalitiesQuery,
  useGetAllShowMunicipalitiesQuery,
} = municipalitiesApi;
