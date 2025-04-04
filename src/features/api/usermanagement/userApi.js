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
        query: ({
          page = 1,
          perPage = 10,
          status = "active",
          search = "",
        }) => ({
          url: `users?pagination=1&page=${page}&per_page=${perPage}&status=${status}&search=${search}`,
        }),
        transformResponse: (response) => response.result?.data || [],
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
