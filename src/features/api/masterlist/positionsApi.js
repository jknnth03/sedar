import { sedarApi } from "..";
const positionsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["positions"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postPosition: build.mutation({
        query: (formDataToSend) => ({
          url: `positions`,
          method: "POST",
          body: formDataToSend,
          formData: true,
        }),
        invalidatesTags: ["positions"],
      }),
      getPositions: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `positions`,
          params: {
            pagination: 1,
            page,
            per_page,
            status,
            search,
          },
        }),
        providesTags: ["positions"],
      }),
      getAllPositions: build.query({
        query: () => ({
          url: `positions`,
          params: {
            pagination: "none",
            status: "active",
          },
        }),
        providesTags: ["positions"],
      }),
      getSuperiorOptions: build.query({
        query: ({ search = "" } = {}) => ({
          url: `positions/superior-options`,
          params: {
            search,
          },
        }),
        providesTags: ["positions"],
      }),
      getPositionEmployees: build.query({
        query: (id) => ({
          url: `positions/${id}/employees`,
        }),
        providesTags: ["positions"],
      }),
      getPositionApprovers: build.query({
        query: (id) => ({
          url: `approval-flows/${id}`,
        }),
        providesTags: ["positions"],
      }),
      getPositionKpis: build.query({
        query: (id) => ({
          url: `positions/${id}/kpis`,
        }),
        providesTags: ["positions"],
      }),
      getPositionHistory: build.query({
        query: (id) => ({
          url: `positions/${id}/history`,
        }),
        providesTags: ["positions"],
      }),
      getManpowerOptions: build.query({
        query: () => ({
          url: `positions/manpower-options`,
          params: {
            pagination: "none",
            status: "active",
          },
        }),
        providesTags: ["positions"],
      }),
      getPositionById: build.query({
        query: (id) => ({
          url: `positions/${id}`,
        }),
        providesTags: ["positions"],
      }),
      getPositionModal: build.query({
        query: (id) => ({
          url: `positions/${id}`,
          params: {
            modal: 1,
          },
        }),
        providesTags: ["positions"],
      }),
      updatePosition: build.mutation({
        query: ({ formData, id }) => ({
          url: `positions/${id}`,
          method: "POST",
          body: formData,
          formData: true,
        }),
        invalidatesTags: ["positions"],
      }),
      changePositionsSuperior: build.mutation({
        query: ({ position_ids, superior_id }) => ({
          url: `positions/superior`,
          method: "PATCH",
          body: { position_ids, superior_id },
        }),
        invalidatesTags: ["positions"],
      }),
      deletePosition: build.mutation({
        query: (id) => ({
          url: `positions/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["positions"],
      }),
    }),
  });
export const {
  usePostPositionMutation,
  useGetPositionsQuery,
  useLazyGetPositionsQuery,
  useGetAllPositionsQuery,
  useLazyGetAllPositionsQuery,
  useGetSuperiorOptionsQuery,
  useLazyGetSuperiorOptionsQuery,
  useGetPositionEmployeesQuery,
  useGetPositionApproversQuery,
  useGetPositionKpisQuery,
  useGetPositionHistoryQuery,
  useGetManpowerOptionsQuery,
  useLazyGetManpowerOptionsQuery,
  useGetPositionByIdQuery,
  useLazyGetPositionByIdQuery,
  useGetPositionModalQuery,
  useLazyGetPositionModalQuery,
  useUpdatePositionMutation,
  useChangePositionsSuperiorMutation,
  useDeletePositionMutation,
} = positionsApi;
