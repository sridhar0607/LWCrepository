import { LightningElement, wire } from 'lwc';
import getTodayBirthdays from '@salesforce/apex/BirthdayController.getTodayBirthdays';
import getNext30DaysBirthdays from '@salesforce/apex/BirthdayController.getNext30DaysBirthdays';
import sendBirthdayWish from '@salesforce/apex/BirthdayController.sendBirthdayWish';

export default class BirthdayWishList extends LightningElement {
    todayContacts;
    nextContacts;

    @wire(getTodayBirthdays)
    wiredToday({data,error}){
        if(data){
            this.todayContacts = data;
        }
    }

    @wire(getNext30DaysBirthdays)
    wiredNext({data,error}){
        if(data){
            this.nextContacts = data;
        }
    }

    sendWish(event){
        const contactId = event.target.dataset.id;
        const email = event.target.dataset.email;
        const name = event.target.dataset.name;

        sendBirthdayWish({email:email,name:name})
        .then(()=>{
            alert('Birthday wishes sent!');

            // Remove the contact from today's list
        this.todayContacts = this.todayContacts.filter(
            contact => contact.Id !== contactId
        );

    })
    .catch(error=>{
        console.log(error);
        });
    }
}