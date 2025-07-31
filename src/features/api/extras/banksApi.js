import { sedarApi } from "..";

const banksApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["banks"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postBanks: build.mutation({
        query: (body) => ({
          url: "banks",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["banks"],
      }),

      getShowBanks: build.query({
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

          return { url: `banks?${queryParams.toString()}` };
        },
        providesTags: ["banks"],
      }),

      updateBanks: build.mutation({
        query: ({ id, ...body }) => ({
          url: `banks/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: ["banks"],
      }),

      deleteBanks: build.mutation({
        query: (id) => ({
          url: `banks/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["banks"],
      }),

      getAllShowBanks: build.query({
        query: () => ({
          url: "banks?pagination=none&status=active",
        }),
        providesTags: ["banks"],
      }),
    }),
  });

export const {
  usePostBanksMutation,
  useGetShowBanksQuery,
  useUpdateBanksMutation,
  useDeleteBanksMutation,
  useGetAllShowBanksQuery,
  useLazyGetAllShowBanksQuery,
} = banksApi;
