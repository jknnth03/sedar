import { sedarApi } from "..";

const cabinetsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["cabinets"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postCabinets: build.mutation({
        query: (body) => ({
          url: "cabinets",
          method: "POST",
          body,
        }),
        invalidatesTags: ["cabinets"],
      }),

      getShowCabinets: build.query({
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

          return { url: `cabinets?${queryParams.toString()}` };
        },
        providesTags: ["cabinets"],
      }),

      getAllCabinets: build.query({
        query: () => ({
          url: "cabinets?pagination=none&status=active",
        }),
        providesTags: ["cabinets"],
      }),

      updateCabinets: build.mutation({
        query: ({ id, ...body }) => ({
          url: `cabinets/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["cabinets"],
      }),

      deleteCabinets: build.mutation({
        query: (id) => ({
          url: `cabinets/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["cabinets"],
      }),
    }),
  });

export const {
  usePostCabinetsMutation,
  useGetShowCabinetsQuery,
  useLazyGetShowCabinetsQuery, // Added lazy version
  useGetAllCabinetsQuery,
  useLazyGetAllCabinetsQuery, // Added lazy version
  useUpdateCabinetsMutation,
  useDeleteCabinetsMutation,
} = cabinetsApi;
