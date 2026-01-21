import { sedarApi } from "..";

const catOneTemplateApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["catOneTemplate"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getCatOneTemplates: build.query({
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
            type: "cat1",
            search,
          },
        }),
        providesTags: ["catOneTemplate"],
      }),
      getCatOneTemplateById: build.query({
        query: (id) => ({
          url: `assessment-templates/${id}`,
          method: "GET",
        }),
        providesTags: ["catOneTemplate"],
      }),
      createCatOneTemplate: build.mutation({
        query: (data) => ({
          url: "assessment-templates",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["catOneTemplate"],
      }),
      updateCatOneTemplate: build.mutation({
        query: ({ id, ...data }) => ({
          url: `assessment-templates/${id}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: ["catOneTemplate"],
      }),
    }),
  });

export const {
  useGetCatOneTemplatesQuery,
  useGetCatOneTemplateByIdQuery,
  useCreateCatOneTemplateMutation,
  useUpdateCatOneTemplateMutation,
} = catOneTemplateApi;

export default catOneTemplateApi;
