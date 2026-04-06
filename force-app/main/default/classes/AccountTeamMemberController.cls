public with sharing class AccountTeamMemberController {

    @AuraEnabled
    public static void addTeamMembers(List<Id> accIds, List<Id> userIds) {

        List<AccountTeamMember> teamMemberList = new List<AccountTeamMember>();

        for(Id accId : accIds) {
            for(Id userId : userIds) {

                AccountTeamMember obj = new AccountTeamMember(
                    AccountId = accId,
                    UserId = userId,
                    TeamMemberRole = 'Advisor'
                );

                teamMemberList.add(obj);
            }
        }

        if(!teamMemberList.isEmpty()) {
            insert teamMemberList;
        }
    }
}