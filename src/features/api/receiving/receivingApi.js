import { sedarApi } from "..";

const receivingApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["receiving"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getReceiverTasks: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
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
          const url = `me/receiver/tasks?${queryString}`;

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["receiving"],
      }),

      getReceiverHistory: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
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
          const url = `me/receiver/history?${queryString}`;

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["receiving"],
      }),

      getSingleFormForReceiving: build.query({
        query: (formId) => ({
          url: `me/forms-for-receiving/${formId}`,
          method: "GET",
        }),
        providesTags: (result, error, formId) => [
          { type: "receiving", id: formId },
          "receiving",
        ],
      }),

      receiveSubmission: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submissions/${id}/receive`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "receiving", id },
          "receiving",
        ],
      }),

      returnSubmission: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submissions/${id}/return`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "receiving", id },
          "receiving",
        ],
      }),
    }),
  });

export const {
  useGetReceiverTasksQuery,
  useGetReceiverHistoryQuery,
  useGetSingleFormForReceivingQuery,
  useReceiveSubmissionMutation,
  useReturnSubmissionMutation,
} = receivingApi;

export default receivingApi;
