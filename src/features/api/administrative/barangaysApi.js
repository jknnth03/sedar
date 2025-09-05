import { sedarApi } from "..";

const barangaysApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["barangays", "showBarangays"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      postBarangays: build.mutation({
        query: (body) => ({
          url: "barangays/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["barangays"],
      }),

      getShowBarangays: build.query({
        query: (params) => {
          let url = `barangays?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`;

          if (params.psgc_id) {
            url += `&psgc_id=${params.psgc_id}`;
          }

          return { url };
        },
        providesTags: ["showBarangays"],
      }),

      getAllShowBarangays: build.query({
        query: (params = {}) => {
          let url = "barangays?pagination=none&status=active";

          if (params.psgc_id) {
            url += `&psgc_id=${params.psgc_id}`;
          }

          return { url };
        },
        providesTags: ["showBarangays"],
      }),

      getBarangaysByMunicipality: build.query({
        query: (municipalityPsgcId) => ({
          url: `barangays?pagination=none&status=active&psgc_id=${municipalityPsgcId}`,
        }),
        providesTags: ["showBarangays"],
      }),

      getBarangayById: build.query({
        query: (id) => ({
          url: `barangays/${id}`,
        }),
        providesTags: ["showBarangays"],
      }),
    }),
  });

export const {
  usePostBarangaysMutation,
  useGetShowBarangaysQuery,
  useLazyGetShowBarangaysQuery,
  useGetAllShowBarangaysQuery,
  useLazyGetAllShowBarangaysQuery,
  useGetBarangaysByMunicipalityQuery,
  useLazyGetBarangaysByMunicipalityQuery,
  useGetBarangayByIdQuery,
  useLazyGetBarangayByIdQuery,
} = barangaysApi;
