public with sharing class AccountController {

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(String fieldName, String operator, String value, Id lastId) {

        // 🔒 Validate field name (prevents SOQL injection)
        Map<String, Schema.SObjectField> fieldsMap = Schema.SObjectType.Account.fields.getMap();

        if (!fieldsMap.containsKey(fieldName)) {
            throw new AuraHandledException('Invalid field name');
        }

        // 🔒 Validate operator
        if (!(operator == '=' || operator == '!=' || operator == '<' || 
              operator == '>' || operator == '<=' || operator == '>=')) {
            throw new AuraHandledException('Invalid operator');
        }

        // 🔥 Base query
        String query = 'SELECT Id, Name, ' + fieldName + 
                       ' FROM Account WHERE ' + fieldName + ' ' + operator + ' :value';

        // 🔥 Cursor Pagination
        if (lastId != null) {
            query += ' AND Id > :lastId';
        }

        // 🔥 ORDER + LIMIT (MANDATORY for pagination)
        query += ' ORDER BY Id LIMIT 10';

        System.debug('Final Query: ' + query);

        return Database.query(query);
    }
}