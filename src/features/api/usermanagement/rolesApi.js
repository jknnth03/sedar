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
        query: (params = {}) => {
          const url = `roles?pagination=1&page=${params.page || 1}&per_page=${
            params.rowsPerPage || params.per_page || 5 // Now accepts both rowsPerPage and per_page
          }&search=${params.searchQuery || params.search || ""}&status=${
            params.status || "active"
          }`;

          // Add this console.log to see what URL is being constructed
          console.log("API URL:", url);
          console.log("Params received:", params);

          return {
            url: url,
            method: "GET",
          };
        },
        transformResponse: (response) => {
          console.log("API Response:", response); // Add this to see the actual response
          return response.result ? response.result : [];
        },
        providesTags: ["roles"],
      }),

      getAllShowRoles: build.query({
        query: (params = {}) => ({
          url: `roles?pagination=none&status=${
            params.status || "active"
          }&search=${params.search || ""}`,
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
  useGetAllShowRolesQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;

export default rolesApi;
