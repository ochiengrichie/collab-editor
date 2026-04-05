import { inviteMember as inviteMemberService, listMembers as listMembersServices, updateMemberRole as updateMemberRoleService, 
    removeMember as removeMemberService } from "../services/docs.members.services.js";

export const inviteMember = async (req, res) => {
  return inviteMemberService(req, res);
};

export const listMembers = async (req, res) => {
  return listMembersServices(req, res);
};  

export const updateMemberRole = async (req, res) => {
  return updateMemberRoleService(req, res);
};

export const removeMember = async (req, res) => {
  return removeMemberService(req, res);
};
