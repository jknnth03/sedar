import { sedarApi } from "..";

const receiverApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["receivers"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getReceivers: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status = "active",
            search,
            ...otherParams
          } = params;
          const queryParams = new URLSearchParams();
          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);
          if (search && search.trim() !== "") {
            queryParams.append("search", search.trim());
          }
          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });
          const queryString = queryParams.toString();
          const url = queryString
            ? `users/receivers?${queryString}`
            : "users/receivers";
          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["receivers"],
      }),
      getAllReceivers: build.query({
        query: (params = {}) => {
          const {
            pagination = false, // Default to false for "get all"
            status = "active",
            search,
            ...otherParams
          } = params;
          const queryParams = new URLSearchParams();
          queryParams.append("pagination", pagination.toString());
          queryParams.append("status", status);
          if (search && search.trim() !== "") {
            queryParams.append("search", search.trim());
          }
          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });
          const queryString = queryParams.toString();
          const url = queryString
            ? `users/receivers?${queryString}`
            : "users/receivers";
          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["receivers"],
      }),
      createReceiver: build.mutation({
        query: (receiverData) => ({
          url: "users/receivers",
          method: "POST",
          body: receiverData,
        }),
        invalidatesTags: ["receivers"],
      }),
      deleteReceiver: build.mutation({
        query: (receiverId) => ({
          url: `users/receivers/${receiverId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["receivers"],
      }),
    }),
  });

export const {
  useGetReceiversQuery,
  useGetAllReceiversQuery,
  useLazyGetAllReceiversQuery,
  useCreateReceiverMutation,
  useDeleteReceiverMutation,
} = receiverApi;

export default receiverApi;
