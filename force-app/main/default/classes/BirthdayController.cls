public with sharing class BirthdayController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getTodayBirthdays(){

        return [
            SELECT Id, Name, Email, Birthdate
            FROM Contact
            WHERE DAY_IN_MONTH(Birthdate) = :Date.today().day()
            AND CALENDAR_MONTH(Birthdate) = :Date.today().month()
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Contact> getNext30DaysBirthdays(){

        Date todayDate = Date.today();
        Date futureDate = todayDate.addDays(30);

        return [
            SELECT Id, Name, Email, Birthdate
            FROM Contact
            WHERE Birthdate != null
        ];
    }

    @AuraEnabled
    public static void sendBirthdayWish(String email,String name){

        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

        mail.setToAddresses(new String[]{email});
        mail.setSubject('Happy Birthday 🎉');

        mail.setPlainTextBody('Dear ' + name + ',\n\nHappy Birthday! Wishing you a wonderful year ahead.\n\nBest Wishes.');

        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }
}