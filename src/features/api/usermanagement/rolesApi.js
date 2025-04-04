import { sedarApi } from "..";

const rolesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["roles"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postRole: build.mutation({
        query: (body) => ({
          url: "roles",
          method: "POST",
          body,
        }),
        invalidatesTags: ["roles"],
      }),

      getShowRoles: build.query({
        query: () => ({
          url: `roles?pagination=none`,
          method: "GET",
        }),
        // transformResponse: (response) => response.result?.data || [],
        providesTags: ["roles"],
      }),

      updateRole: build.mutation({
        query: ({ id, ...body }) => ({
          url: `roles/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["roles"],
      }),

      deleteRole: build.mutation({
        query: (id) => ({
          url: `roles/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["roles"],
      }),
    }),
  });

export const {
  usePostRoleMutation,
  useGetShowRolesQuery,
  // useLazyGetRolesDropDownQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;

export default rolesApi;
