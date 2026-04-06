import { LightningElement , track } from 'lwc';
import searchRecords from '@salesforce/apex/SearchController.searchRecords';

export default class FirstRequirementLWC extends LightningElement {
    searchKey='';
    @track records;
    showTable = false;

    columns=[
        {label:'Name',
            fieldName:'recordLink',
            type:'url',
            typeAttributes:{
                label:{fieldName:'Name'},
                target:'_blank'
            }   
        },
        
        {label:'Reference AccountNumber',fieldName:'AccountNumber'}
    ];

    handleChange(event){
        this.searchKey=event.target.value;
    }

    handleSearch(){
        if(!this.searchKey || this.searchKey.trim()==''){
            this.showTable = false;
            return;
        }
            {
            
        const pattern = /^[a-zA-Z0-9 ]*$/;

    if(!pattern.test(this.searchKey)){
        alert('Only letters and numbers are allowed');
        return;
    }
        searchRecords({searchKey:this.searchKey})
        .then(result=>{
            this.records=result.map(record=>{
                return {
                    ...record,
                    recordLink:`/lightning/r/Account/${record.Id}/view`
                }
            });
            this.showTable = true;
        })
        .catch(error=>{
            console.log(error);
        })
    }
}
}