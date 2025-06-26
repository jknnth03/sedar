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
        query: (params) => ({
          url: `barangays?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showBarangays"],
      }),

      getAllShowBarangays: build.query({
        query: () => ({
          url: "barangays?pagination=none&status=active",
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
  useGetBarangayByIdQuery,
  useLazyGetBarangayByIdQuery,
} = barangaysApi;
