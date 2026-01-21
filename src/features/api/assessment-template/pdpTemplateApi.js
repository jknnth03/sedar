import { sedarApi } from "..";

const pdpTemplateApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["pdpTemplate"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getPdpTemplates: build.query({
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
            type: "pdp",
            search,
          },
        }),
        providesTags: ["pdpTemplate"],
      }),
      getPdpTemplateById: build.query({
        query: (id) => ({
          url: `assessment-templates/${id}`,
          method: "GET",
        }),
        providesTags: ["pdpTemplate"],
      }),
      createPdpTemplate: build.mutation({
        query: (data) => ({
          url: "assessment-templates",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["pdpTemplate"],
      }),
      updatePdpTemplate: build.mutation({
        query: ({ id, ...data }) => ({
          url: `assessment-templates/${id}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: ["pdpTemplate"],
      }),
    }),
  });

export const {
  useGetPdpTemplatesQuery,
  useGetPdpTemplateByIdQuery,
  useCreatePdpTemplateMutation,
  useUpdatePdpTemplateMutation,
} = pdpTemplateApi;

export default pdpTemplateApi;
