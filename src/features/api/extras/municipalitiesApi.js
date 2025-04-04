import { sedarApi } from "..";

const municipalitiesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["municipalities"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postMunicipality: build.mutation({
        query: (body) => ({
          url: "cities-municipalities",
          method: "POST",
          body,
        }),
        invalidatesTags: ["municipalities"],
      }),

      getMunicipalities: build.query({
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

          return { url: `cities-municipalities?${queryParams.toString()}` };
        },
        providesTags: ["municipalities"],
      }),

      updateMunicipality: build.mutation({
        query: ({ id, ...body }) => ({
          url: `cities-municipalities/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["municipalities"],
      }),

      deleteMunicipality: build.mutation({
        query: (id) => ({
          url: `cities-municipalities/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["municipalities"],
      }),
    }),
  });

export const {
  usePostMunicipalityMutation,
  useGetMunicipalitiesQuery,
  useUpdateMunicipalityMutation,
  useDeleteMunicipalityMutation,
} = municipalitiesApi;
