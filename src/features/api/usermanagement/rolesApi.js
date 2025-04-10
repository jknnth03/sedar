import { sedarApi } from "..";

const rolesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["roles"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postRole: build.mutation({
        query: (body) => ({
          url: "roles",
          method: "POST",
          body: {
            name: body.role_name,
            access_permissions: body.access_permissions,
          },
        }),
        invalidatesTags: ["roles"],
      }),

      getShowRoles: build.query({
        query: (params = {}) => ({
          url: `roles?pagination=none&page=${params.page || 1}&limit=${
            params.rowsPerPage || 10
          }&search=${params.searchQuery || ""}&status=${
            params.status || "active"
          }`,
          method: "GET",
        }),
        transformResponse: (response) => {
          return response.result ? response.result : [];
        },
        providesTags: ["roles"],
      }),

      updateRole: build.mutation({
        query: ({ id, ...body }) => ({
          url: `roles/${id}`,
          method: "PATCH",
          body: {
            name: body.role_name,
            access_permissions: body.access_permissions,
          },
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
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;

export default rolesApi;
