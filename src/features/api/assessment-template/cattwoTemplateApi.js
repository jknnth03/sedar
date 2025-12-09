import { sedarApi } from "..";

const catTwoTemplateApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["catTwoTemplate"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getCatTwoTemplates: build.query({
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
            type: "cat2",
            search,
          },
        }),
        providesTags: ["catTwoTemplate"],
      }),
      getCatTwoTemplateById: build.query({
        query: (id) => ({
          url: `assessment-templates/${id}`,
          method: "GET",
        }),
        providesTags: ["catTwoTemplate"],
      }),
      createCatTwoTemplate: build.mutation({
        query: (data) => ({
          url: "assessment-templates",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["catTwoTemplate"],
      }),
      updateCatTwoTemplate: build.mutation({
        query: ({ id, ...data }) => ({
          url: `assessment-templates/${id}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: ["catTwoTemplate"],
      }),
    }),
  });

export const {
  useGetCatTwoTemplatesQuery,
  useGetCatTwoTemplateByIdQuery,
  useCreateCatTwoTemplateMutation,
  useUpdateCatTwoTemplateMutation,
} = catTwoTemplateApi;

export default catTwoTemplateApi;
