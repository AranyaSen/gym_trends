export type AssignedMember = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  memberships: { endDate: string; plan: { name: string } }[];
};

export type FetchAssignedMembersResponse = {
  members: AssignedMember[];
};
