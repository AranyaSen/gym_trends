import { apiClient } from "../apiClient";
import { ApiResponse } from "../../types/api";
import { API_ROUTES } from "../../constants/apiRoutes";
import { AssignedMember, FetchAssignedMembersResponse } from "./trainer.types";

export async function fetchAssignedMembers(): Promise<AssignedMember[]> {
  const { data } = await apiClient.get<ApiResponse<FetchAssignedMembersResponse>>(
    API_ROUTES.TRAINERS.MY_MEMBERS,
  );
  return data.data.members;
}
