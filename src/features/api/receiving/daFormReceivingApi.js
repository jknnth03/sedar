import { sedarApi } from "..";
import dashboardApi from "../usermanagement/dashboardApi";

const daFormReceivingApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["daFormReceiving"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getDaSubmissionsForReceiving: build.query({
        query: (params = {}) => {
          const {
            pagination = 1,
            page = 1,
            per_page = 10,
            status = "active",
            search = "",
            tab = "pending",
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();
          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);
          queryParams.append("search", search);
          queryParams.append("tab", tab);

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          return {
            url: `hr-od/da-submissions`,
            params: Object.fromEntries(queryParams),
          };
        },
        providesTags: ["daFormReceiving"],
      }),

      getSingleDaSubmissionForReceiving: build.query({
        query: (submissionId) => `hr-od/da-submissions/${submissionId}`,
        providesTags: (result, error, submissionId) => [
          { type: "daFormReceiving", id: submissionId },
          "daFormReceiving",
        ],
      }),

      startDaSubmission: build.mutation({
        query: (submissionId) => ({
          url: `hr-od/da-submissions/${submissionId}/start`,
          method: "POST",
        }),
        invalidatesTags: (result, error, submissionId) => [
          { type: "daFormReceiving", id: submissionId },
          "daFormReceiving",
        ],
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"])
            );
          } catch (err) {
            console.error("Failed to start DA submission:", err);
          }
        },
      }),
    }),
  });

export const {
  useGetDaSubmissionsForReceivingQuery,
  useGetSingleDaSubmissionForReceivingQuery,
  useLazyGetSingleDaSubmissionForReceivingQuery,
  useStartDaSubmissionMutation,
} = daFormReceivingApi;

export default daFormReceivingApi;
