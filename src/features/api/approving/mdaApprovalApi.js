// import { sedarApi } from "..";

// const mdaApprovalApi = sedarApi
//   .enhanceEndpoints({
//     addTagTypes: ["mdaApprovals"],
//   })
//   .injectEndpoints({
//     endpoints: (build) => ({
//       getMyMdaApprovals: build.query({
//         query: (params = {}) => {
//           const {
//             pagination = true,
//             page = 1,
//             per_page = 10,
//             status = "active",
//             search,
//             approval_status = "",
//             ...otherParams
//           } = params;

//           const queryParams = new URLSearchParams();

//           queryParams.append("pagination", pagination.toString());
//           queryParams.append("page", page.toString());
//           queryParams.append("per_page", per_page.toString());
//           queryParams.append("status", status);
//           queryParams.append("approval_status", approval_status);

//           if (search && search.trim() !== "") {
//             queryParams.append("search", search.trim());
//           }

//           Object.entries(otherParams).forEach(([key, value]) => {
//             if (value !== undefined && value !== null && value !== "") {
//               queryParams.append(key, value.toString());
//             }
//           });

//           const queryString = queryParams.toString();
//           const url = queryString
//             ? `me/mda-approvals?${queryString}`
//             : "me/mda-approvals";

//           return {
//             url,
//             method: "GET",
//           };
//         },
//         providesTags: ["mdaApprovals"],
//       }),
//       getMdaApprovalById: build.query({
//         query: (id) => ({
//           url: `me/mda-approvals/${id}`,
//           method: "GET",
//         }),
//         providesTags: (result, error, id) => [{ type: "mdaApprovals", id }],
//       }),
//       approveMda: build.mutation({
//         query: ({ id, comments, reason }) => ({
//           url: `submission-approvals/${id}/approve`,
//           method: "POST",
//           body: {
//             comments,
//             reason,
//           },
//         }),
//         invalidatesTags: (result, error, { id }) => [
//           { type: "mdaApprovals", id },
//           "mdaApprovals",
//         ],
//       }),
//       rejectMda: build.mutation({
//         query: ({ id, comments, reason }) => ({
//           url: `submission-approvals/${id}/reject`,
//           method: "POST",
//           body: {
//             comments,
//             reason,
//           },
//         }),
//         invalidatesTags: (result, error, { id }) => [
//           { type: "mdaApprovals", id },
//           "mdaApprovals",
//         ],
//       }),
//     }),
//   });

// export const {
//   useGetMyMdaApprovalsQuery,
//   useGetMdaApprovalByIdQuery,
//   useApproveMdaMutation,
//   useRejectMdaMutation,
// } = mdaApprovalApi;

// export default mdaApprovalApi;
import { sedarApi } from "..";

const mdaApprovalApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["mdaApprovals"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMyMdaApprovals: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status = "active",
            search,
            approval_status = "",
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());
          queryParams.append("status", status);
          queryParams.append("approval_status", approval_status);

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
            ? `me/mda-approvals?${queryString}`
            : "me/mda-approvals";

          return {
            url,
            method: "GET",
          };
        },
        keepUnusedDataFor: 60,
        providesTags: (result) => [
          { type: "mdaApprovals", id: "LIST" },
          ...(result?.result?.data || []).map(({ id }) => ({
            type: "mdaApprovals",
            id,
          })),
        ],
      }),
      getMdaApprovalById: build.query({
        query: (id) => ({
          url: `me/mda-approvals/${id}`,
          method: "GET",
        }),
        keepUnusedDataFor: 300,
        providesTags: (result, error, id) => [{ type: "mdaApprovals", id }],
      }),
      approveMda: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/approve`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
          const patchResult = dispatch(
            mdaApprovalApi.util.updateQueryData(
              "getMyMdaApprovals",
              undefined,
              (draft) => {
                if (draft?.result?.data) {
                  draft.result.data = draft.result.data.filter(
                    (mda) => mda.id !== id
                  );
                  if (draft.result.total) {
                    draft.result.total -= 1;
                  }
                }
              }
            )
          );

          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "mdaApprovals", id: "LIST" },
          { type: "mdaApprovals", id },
        ],
      }),
      rejectMda: build.mutation({
        query: ({ id, comments, reason }) => ({
          url: `submission-approvals/${id}/reject`,
          method: "POST",
          body: {
            comments,
            reason,
          },
        }),
        async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
          const patchResult = dispatch(
            mdaApprovalApi.util.updateQueryData(
              "getMyMdaApprovals",
              undefined,
              (draft) => {
                if (draft?.result?.data) {
                  draft.result.data = draft.result.data.filter(
                    (mda) => mda.id !== id
                  );
                  if (draft.result.total) {
                    draft.result.total -= 1;
                  }
                }
              }
            )
          );

          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "mdaApprovals", id: "LIST" },
          { type: "mdaApprovals", id },
        ],
      }),
    }),
  });

export const {
  useGetMyMdaApprovalsQuery,
  useGetMdaApprovalByIdQuery,
  useApproveMdaMutation,
  useRejectMdaMutation,
} = mdaApprovalApi;

export default mdaApprovalApi;
