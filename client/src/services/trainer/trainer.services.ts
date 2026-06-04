import { apiClient } from "../apiClient";
import { ApiResponse } from "../../types/api";
import { AssignedMember, FetchAssignedMembersResponse } from "./trainer.types";

export async function fetchAssignedMembers(): Promise<AssignedMember[]> {
  const { data } = await apiClient.get<ApiResponse<FetchAssignedMembersResponse>>("/trainer/members");
  return data.data.members;
}
