import { sedarApi } from "..";
const prefixesApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["prefixes"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postPrefixes: build.mutation({
        query: (body) => ({
          url: "prefixes",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["prefixes"],
      }),
      getShowPrefixes: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status,
          search = "",
          pagination = true,
        }) => {
          const queryParams = new URLSearchParams();
          queryParams.append("page", page);
          queryParams.append("per_page", per_page);
          queryParams.append("pagination", pagination);
          if (status) queryParams.append("status", status);
          if (search) queryParams.append("search", search);
          return { url: `prefixes?${queryParams.toString()}` };
        },
        providesTags: ["prefixes"],
      }),
      updatePrefixes: build.mutation({
        query: ({ id, ...body }) => ({
          url: `prefixes/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["prefixes"],
      }),
      deletePrefixes: build.mutation({
        query: (id) => ({
          url: `prefixes/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["prefixes"],
      }),
      getAllShowPrefixes: build.query({
        query: () => ({
          url: "prefixes?pagination=none&status=active",
        }),
        providesTags: ["prefixes"],
      }),
      getEmployeeNextId: build.query({
        query: (prefixId) => ({
          url: `employees/next-id/${prefixId}`,
          method: "GET",
        }),
      }),
      checkEmployeeIdUnique: build.query({
        query: ({ prefixId, idNumber }) => ({
          url: `employees/check-unique-id/${prefixId}/${idNumber}`,
          method: "GET",
        }),
      }),
    }),
  });
export const {
  usePostPrefixesMutation,
  useGetShowPrefixesQuery,
  useUpdatePrefixesMutation,
  useDeletePrefixesMutation,
  useGetAllShowPrefixesQuery,
  useLazyGetAllShowPrefixesQuery,
  useGetEmployeeNextIdQuery,
  useLazyGetEmployeeNextIdQuery,
  useCheckEmployeeIdUniqueQuery,
  useLazyCheckEmployeeIdUniqueQuery,
} = prefixesApi;
