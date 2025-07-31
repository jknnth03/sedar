import { sedarApi } from "..";

const companiesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["companies", "showCompanies"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postCompanies: build.mutation({
        query: (body) => ({
          url: "companies/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["companies"],
      }),

      getShowCompanies: build.query({
        query: (params) => ({
          url: `companies?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showCompanies"],
      }),

      getAllShowCompanies: build.query({
        query: () => ({
          url: `companies?pagination=none&status=active`,
        }),
        providesTags: ["showCompanies"],
      }),
    }),
  });

export const {
  usePostCompaniesMutation,
  useGetShowCompaniesQuery,
  useGetAllShowCompaniesQuery,
} = companiesApi;
