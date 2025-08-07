import { sedarApi } from "..";

const generalApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["general"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // POST - Create Employee General Info (for new records only)
      postGeneral: build.mutation({
        query: (body) => ({
          url: "employees/general-info",
          method: "POST",
          body,
        }),
        invalidatesTags: ["general"],
      }),

      // PATCH - Update Employee General Info (Fixed endpoint structure)
      updateGeneral: build.mutation({
        query: ({ id, ...body }) => ({
          url: `employees/${id}/general-info`, // Correct endpoint: employees/{id}/general-info
          method: "PATCH", // Correct method as confirmed by your error message
          body,
        }),
        invalidatesTags: ["general"],
      }),

      // GET - Show All Employees General Info
      getGenerals: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `employees/general-info?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: ["general"],
      }),

      // GET - Show All (No Pagination)
      getAllGenerals: build.query({
        query: () => ({
          url: `employees/general-info?pagination=none&status=active`,
        }),
        providesTags: ["general"],
      }),

      // GET - Show an Employee General Info
      getSingleGeneral: build.query({
        query: (id) => ({
          url: `employees/${id}/general-info`, // Updated to match backend expectation
        }),
        providesTags: ["general"],
      }),

      // GET - All Manpower
      getAllManpower: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `mrf/open?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: ["general"],
      }),

      // DELETE - Delete Employee General Info (Updated endpoint)
      deleteGeneral: build.mutation({
        query: (id) => ({
          url: `employees/${id}/general-info`, // Changed from employees/general-info/${id}
          method: "DELETE",
        }),
        invalidatesTags: ["general"],
      }),
    }),
  });

export const {
  usePostGeneralMutation,
  useGetGeneralsQuery,
  useGetAllGeneralsQuery,
  useLazyGetAllGeneralsQuery, // Added the lazy query hook
  useGetSingleGeneralQuery,
  useGetAllManpowerQuery,
  useUpdateGeneralMutation,
  useDeleteGeneralMutation,
} = generalApi;
