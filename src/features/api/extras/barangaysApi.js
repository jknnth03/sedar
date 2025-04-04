import { sedarApi } from "..";

const barangaysApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["barangays"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postBarangays: build.mutation({
        query: (body) => ({
          url: "barangays",
          method: "POST",
          body,
        }),
        invalidatesTags: ["barangays"],
      }),

      getBarangays: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status,
          search = "",
          pagination = true,
        }) => {
          const queryParams = new URLSearchParams({
            page,
            per_page,
            pagination,
          });
          if (status) queryParams.append("status", status);
          if (search) queryParams.append("search", search);

          return { url: `barangays?${queryParams.toString()}` };
        },
        providesTags: ["barangays"],
      }),

      updateBarangays: build.mutation({
        query: ({ id, ...body }) => ({
          url: `barangays/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["barangays"],
      }),

      deleteBarangays: build.mutation({
        query: (id) => ({
          url: `barangays/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["barangays"],
      }),
    }),
  });

export const {
  usePostBarangaysMutation,
  useGetBarangaysQuery,
  useUpdateBarangaysMutation,
  useDeleteBarangaysMutation,
} = barangaysApi;
