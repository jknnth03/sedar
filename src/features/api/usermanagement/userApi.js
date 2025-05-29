import { sedarApi } from "..";

const userApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["users"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getSingleUser: build.query({
        query: (params) => ({ url: `users/${params.id}` }),
        providesTags: ["users"],
      }),

      getEmployeeIdNumbers: build.query({
        query: () => ({
          url: "users/id-numbers",
        }),
        providesTags: ["users"],
      }),

      createUser: build.mutation({
        query: (body) => ({
          url: "users",
          method: "POST",
          body,
        }),
        invalidatesTags: ["users"],
      }),

      updateUser: build.mutation({
        query: ({ id, ...body }) => ({
          url: `users/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["users"],
      }),
      deleteUser: build.mutation({
        query: (id) => ({
          url: `users/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["users"],
      }),

      getShowUser: build.query({
        query: (params = {}) => ({
          url: `users?pagination=${params.pagination || 1}&page=${
            params.page || 1
          }&per_page=${params.per_page || 10}&search=${
            params.searchQuery || ""
          }&status=${params.status || "active"}`,
          method: "GET",
        }),
        transformResponse: (response) => {
          console.log("Raw API Response:", response);

          if (response.result) {
            return {
              data: response.result.data || [],
              totalCount:
                response.result.total_count || response.result.total || 0,
              currentPage: response.result.current_page,
              lastPage: response.result.last_page,
            };
          }
          return { data: [], totalCount: 0 };
        },
        providesTags: ["users"],
      }),
    }),
  });

export const {
  useGetSingleUserQuery,
  useGetEmployeeIdNumbersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetShowUserQuery,
} = userApi;
