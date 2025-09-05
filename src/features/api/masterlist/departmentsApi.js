import { sedarApi } from "..";

const departmentsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["departments", "showDepartments"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postDepartments: build.mutation({
        query: (body) => ({
          url: "departments/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["departments"],
      }),

      getShowDepartments: build.query({
        query: (params) => ({
          url: `departments?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showDepartments"],
      }),

      getAllShowDepartments: build.query({
        query: () => ({
          url: "departments?pagination=none&status=active",
        }),
        providesTags: ["showDepartments"],
      }),
    }),
  });

export const {
  usePostDepartmentsMutation,
  useGetShowDepartmentsQuery,
  useGetAllShowDepartmentsQuery,
} = departmentsApi;
