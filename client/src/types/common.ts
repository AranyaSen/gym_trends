export type UserRoles = "TRAINER" | "MEMBER";
export type RoleTypes = "ADMIN" | "TRAINER" | "MEMBER";
export type Gym = {
  onlinePaymentsEnabled: boolean;
  geoFencingEnabled: boolean;
};

export type UserType = {
  id: string;
  email: string;
  name: string;
  role: RoleTypes;
  gymId: string;
};
