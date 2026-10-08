import { sedarApi } from "..";
import dashboardApi from "../usermanagement/dashboardApi";

const toOptions = (list = [], preferId = false) =>
  list.map((item) => {
    const value = preferId ? (item.id ?? item.code) : (item.code ?? item.id);
    return {
      value: String(value),
      label: item.name ?? item.label ?? String(value),
      departmentCode:
        item.department_code != null ? String(item.department_code) : "",
      unitCode: item.unit_code != null ? String(item.unit_code) : "",
      subUnitCode: item.sub_unit_code != null ? String(item.sub_unit_code) : "",
    };
  });

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
            department = "",
            unit = "",
            sub_unit = "",
            charging_id = "",
            from_date = "",
            to_date = "",
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();
          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);
          queryParams.append("search", search);
          queryParams.append("tab", tab);

          if (department) queryParams.append("department", department);
          if (unit) queryParams.append("unit", unit);
          if (sub_unit) queryParams.append("sub_unit", sub_unit);
          if (charging_id) queryParams.append("charging_id", charging_id);
          if (from_date) queryParams.append("from_date", from_date);
          if (to_date) queryParams.append("to_date", to_date);

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

      getDaFilterOptions: build.query({
        query: ({ department, unit, subUnit } = {}) => {
          const params = {};
          if (department) params.department = department;
          if (unit) params.unit = unit;
          if (subUnit) params.sub_unit = subUnit;

          return {
            url: `hr-od/da-submissions/filter-options`,
            params,
          };
        },
        transformResponse: (response) => {
          const result = response?.result ?? response?.data ?? response ?? {};
          return {
            departments: toOptions(result.departments),
            units: toOptions(result.units),
            subUnits: toOptions(result.sub_units ?? result.subUnits),
            chargings: toOptions(result.chargings, true),
          };
        },
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
              dashboardApi.util.invalidateTags(["Dashboard", "Notifications"]),
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
  useGetDaFilterOptionsQuery,
  useGetSingleDaSubmissionForReceivingQuery,
  useLazyGetSingleDaSubmissionForReceivingQuery,
  useStartDaSubmissionMutation,
} = daFormReceivingApi;

export default daFormReceivingApi;
