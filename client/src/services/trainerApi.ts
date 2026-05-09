import { http } from "./http";

type Api<T> = { data: T; error: null };

export type AssignedMember = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  memberships: { endDate: string; plan: { name: string } }[];
};

export async function fetchAssignedMembers() {
  const { data } = await http.get<Api<{ members: AssignedMember[] }>>(
    "/trainer/members"
  );
  return data.data.members;
}
