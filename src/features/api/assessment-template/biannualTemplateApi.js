import { sedarApi } from "..";

const biAnnualTemplateApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["biAnnualTemplate"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getBiAnnualTemplates: build.query({
        query: ({
          pagination = 1,
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: "assessment-templates",
          method: "GET",
          params: {
            pagination,
            page,
            per_page,
            status,
            type: "performance_evaluation",
            search,
          },
        }),
        providesTags: ["biAnnualTemplate"],
      }),
      getBiAnnualTemplateById: build.query({
        query: (id) => ({
          url: `assessment-templates/${id}`,
          method: "GET",
        }),
        providesTags: ["biAnnualTemplate"],
      }),
      createBiAnnualRankFileTemplate: build.mutation({
        query: (data) => ({
          url: "assessment-templates",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["biAnnualTemplate"],
      }),
      createBiAnnualSupervisoryTemplate: build.mutation({
        query: (data) => ({
          url: "assessment-templates",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["biAnnualTemplate"],
      }),
      updateBiAnnualTemplate: build.mutation({
        query: ({ id, ...data }) => ({
          url: `assessment-templates/${id}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: ["biAnnualTemplate"],
      }),
      archiveBiAnnualTemplate: build.mutation({
        query: (id) => ({
          url: `assessment-templates/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["biAnnualTemplate"],
      }),
    }),
  });

export const {
  useGetBiAnnualTemplatesQuery,
  useGetBiAnnualTemplateByIdQuery,
  useCreateBiAnnualRankFileTemplateMutation,
  useCreateBiAnnualSupervisoryTemplateMutation,
  useUpdateBiAnnualTemplateMutation,
  useArchiveBiAnnualTemplateMutation,
} = biAnnualTemplateApi;

export default biAnnualTemplateApi;
