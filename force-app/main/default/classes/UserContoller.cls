public with sharing class UserContoller {
    @AuraEnabled(cacheable=true)
    public static List<User> getActiveUsers() {
        List<User> userList=[SELECT Id, Name FROM User WHERE IsActive = TRUE ORDER BY Name];
        return userList;

    }
}