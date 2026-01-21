import { sedarApi } from "..";

const nationalitiesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["nationalities"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postNationalities: build.mutation({
        query: (body) => ({
          url: "nationalities",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["nationalities"],
      }),

      getShowNationalities: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status,
          search = "",
          pagination = true,
        }) => {
          const queryParams = new URLSearchParams();

          queryParams.append("page", page);
          queryParams.append("per_page", per_page);
          queryParams.append("pagination", pagination);

          if (status) queryParams.append("status", status);
          if (search) queryParams.append("search", search);

          return { url: `nationalities?${queryParams.toString()}` };
        },
        providesTags: ["nationalities"],
      }),

      updateNationalities: build.mutation({
        query: ({ id, ...body }) => ({
          url: `nationalities/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["nationalities"],
      }),

      deleteNationalities: build.mutation({
        query: (id) => ({
          url: `nationalities/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["nationalities"],
      }),

      importNationalities: build.mutation({
        query: (body) => ({
          url: "nationalities/import",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["nationalities"],
      }),

      exportNationalities: build.mutation({
        query: (body) => ({
          url: "nationalities/export",
          method: "POST",
          body: body,
        }),
      }),

      getAllShowNationalities: build.query({
        query: ({ page = 1, per_page = 1000, status = "active" } = {}) => {
          const queryParams = new URLSearchParams();
          queryParams.append("page", page);
          queryParams.append("per_page", per_page);
          queryParams.append("status", status);
          queryParams.append("pagination", "true");

          return { url: `nationalities?${queryParams.toString()}` };
        },
        providesTags: ["nationalities"],
      }),
    }),
  });

export const {
  usePostNationalitiesMutation,
  useGetShowNationalitiesQuery,
  useUpdateNationalitiesMutation,
  useDeleteNationalitiesMutation,
  useImportNationalitiesMutation,
  useExportNationalitiesMutation,
  useGetAllShowNationalitiesQuery,
  useLazyGetAllShowNationalitiesQuery,
  useLazyGetShowNationalitiesQuery,
} = nationalitiesApi;
