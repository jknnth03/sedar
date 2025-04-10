import { sedarApi } from "..";

const subMunicipalitiesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["subMunicipalities"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postSubMunicipality: build.mutation({
        query: (body) => ({
          url: "sub-municipalities",
          method: "POST",
          body,
        }),
        invalidatesTags: ["subMunicipalities"],
      }),

      getSubMunicipalities: build.query({
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

          return { url: `sub-municipalities?${queryParams.toString()}` };
        },
        providesTags: ["subMunicipalities"],
      }),

      updateSubMunicipality: build.mutation({
        query: ({ id, ...body }) => ({
          url: `sub-municipalities/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["subMunicipalities"],
      }),

      deleteSubMunicipality: build.mutation({
        query: (id) => ({
          url: `sub-municipalities/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["subMunicipalities"],
      }),
    }),
  });

export const {
  usePostSubMunicipalityMutation,
  useGetSubMunicipalitiesQuery,
  useUpdateSubMunicipalityMutation,
  useDeleteSubMunicipalityMutation,
} = subMunicipalitiesApi;
