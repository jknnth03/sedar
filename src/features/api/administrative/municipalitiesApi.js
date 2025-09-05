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
        query: (params) => {
          let url = `cities-municipalities?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`;

          if (params.psgc_id) {
            url += `&psgc_id=${params.psgc_id}`;
          }

          return { url };
        },
        providesTags: ["showMunicipalities"],
      }),

      getAllShowMunicipalities: build.query({
        query: (params = {}) => {
          let url = "cities-municipalities?pagination=none&status=active";

          if (params.psgc_id) {
            url += `&psgc_id=${params.psgc_id}`;
          }

          return { url };
        },
        providesTags: ["showMunicipalities"],
      }),

      getMunicipalitiesByProvince: build.query({
        query: (provincePsgcId) => ({
          url: `cities-municipalities?pagination=none&status=active&psgc_id=${provincePsgcId}`,
        }),
        providesTags: ["showMunicipalities"],
      }),

      getMunicipalityById: build.query({
        query: (id) => ({
          url: `cities-municipalities/${id}`,
        }),
        providesTags: ["showMunicipalities"],
      }),
    }),
  });

export const {
  usePostMunicipalitiesMutation,
  useGetShowMunicipalitiesQuery,
  useLazyGetShowMunicipalitiesQuery,
  useGetAllShowMunicipalitiesQuery,
  useLazyGetAllShowMunicipalitiesQuery,
  useGetMunicipalitiesByProvinceQuery,
  useLazyGetMunicipalitiesByProvinceQuery,
  useGetMunicipalityByIdQuery,
  useLazyGetMunicipalityByIdQuery,
} = municipalitiesApi;

export default municipalitiesApi;
