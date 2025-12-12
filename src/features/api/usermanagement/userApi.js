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
      getAllUsers: build.query({
        query: () => ({
          url: "users",
          method: "GET",
          params: {
            pagination: 0,
            per_page: 1000,
            status: "active",
          },
        }),
        transformResponse: (response) => {
          console.log("Raw API Response (getAllUsers):", response);

          if (response && response.result) {
            if (response.result.data && Array.isArray(response.result.data)) {
              return { result: response.result.data };
            }
            if (Array.isArray(response.result)) {
              return { result: response.result };
            }
            return { result: response.result };
          }

          if (response && response.data) {
            return {
              result: Array.isArray(response.data) ? response.data : [],
            };
          }

          return { result: [] };
        },
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
          }&status=${params.status || "active"}&role=${params.role || ""}`,
          method: "GET",
        }),
        transformResponse: (response) => {
          console.log("Raw API Response (getShowUser):", response);
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
      getPendingRequests: build.query({
        query: (params = {}) => ({
          url: `pending-requests?pagination=${params.pagination || 1}&page=${
            params.page || 1
          }&per_page=${params.per_page || 10}&status=${
            params.status || "active"
          }&search=${params.searchQuery || ""}`,
          method: "GET",
        }),
        transformResponse: (response) => {
          console.log("Raw API Response (getPendingRequests):", response);
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
      updatePendingRequest: build.mutation({
        query: ({ id, ...body }) => ({
          url: `pending-requests/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["users"],
      }),
      getAllApprovers: build.query({
        query: () => ({
          url: "users",
          method: "GET",
          params: {
            pagination: 0,
            per_page: 1000,
            status: "active",
            role: "approver",
          },
        }),
        transformResponse: (response) => {
          console.log("Raw API Response (getAllApprovers):", response);

          if (response && response.result) {
            if (response.result.data && Array.isArray(response.result.data)) {
              return { result: { data: response.result.data } };
            }
            if (Array.isArray(response.result)) {
              return { result: { data: response.result } };
            }
            return { result: { data: response.result } };
          }

          if (response && response.data) {
            return {
              result: {
                data: Array.isArray(response.data) ? response.data : [],
              },
            };
          }

          return { result: { data: [] } };
        },
        providesTags: ["users"],
      }),
      getAllReceivers: build.query({
        query: () => ({
          url: "users",
          method: "GET",
          params: {
            pagination: 0,
            per_page: 1000,
            status: "active",
            role: "receiver",
          },
        }),
        transformResponse: (response) => {
          console.log("Raw API Response (getAllReceivers):", response);

          if (response && response.result) {
            if (response.result.data && Array.isArray(response.result.data)) {
              return { result: { data: response.result.data } };
            }
            if (Array.isArray(response.result)) {
              return { result: { data: response.result } };
            }
            return { result: { data: response.result } };
          }

          if (response && response.data) {
            return {
              result: {
                data: Array.isArray(response.data) ? response.data : [],
              },
            };
          }

          return { result: { data: [] } };
        },
        providesTags: ["users"],
      }),
    }),
  });

export const {
  useGetSingleUserQuery,
  useGetEmployeeIdNumbersQuery,
  useLazyGetAllUsersQuery,
  useGetAllUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetShowUserQuery,
  useGetPendingRequestsQuery,
  useUpdatePendingRequestMutation,
  useGetAllApproversQuery,
  useGetAllReceiversQuery,
} = userApi;
