import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import getActiveUsers from '@salesforce/apex/UserContoller.getActiveUsers';
import addTeamMembers from '@salesforce/apex/AccountTeamMemberController.addTeamMembers';

export default class AssignAdvisor extends LightningElement {

    filterName = '';
    fieldValue = '';
    operatorValue = '';
    inputValue = '';
    value = '';

    fieldOptions = [];
    records = [];

    showTable = false;
    showAssign = false;

    options = [];

    // 🔥 Pagination variables
    lastId = null;
    isLoading = false;
    hasMoreData = true;

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Industry', fieldName: 'Industry' }
    ];

    operatorOptions = [
        { label: 'Equals', value: '=' },
        { label: 'Not Equals', value: '!=' },
        { label: 'Less than', value: '<' },
        { label: 'Greater than', value: '>' },
        { label: 'Less or equal', value: '<=' },
        { label: 'Greater or equal', value: '>=' }
    ];

    // 🔹 Filter Modal
    isFilterModalOpen = false;

    handleNewFilter() {
        this.isFilterModalOpen = true;
    }

    closeFilterModal() {
        this.isFilterModalOpen = false;
    }

    // 🔹 Get fields
    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    wiredObjectInfo({ error, data }) {
        if (data) {
            this.fieldOptions = Object.keys(data.fields).map(fieldName => ({
                label: data.fields[fieldName].label,
                value: fieldName
            }));
        } else if (error) {
            console.error(error);
        }
    }

    // 🔹 Handle Input
    handleChange(event) {
        const name = event.target.name;
        const value = event.detail.value || event.target.value;

        if (name === 'View') {
            this.value = value;

            const selectedFilter = this.savedFilters.find(f => f.value === value);

            if (selectedFilter) {
                this.filterName = selectedFilter.label;
                this.fieldValue = selectedFilter.field;
                this.operatorValue = selectedFilter.operator;
                this.inputValue = selectedFilter.input;

                this.handleSearch();
            }
        } else {
            this[name] = value;
        }
    }

    // 🔹 Save Filter
    savedFilters = [];

    handleSave() {

        if (!(this.filterName && this.fieldValue && this.operatorValue && this.inputValue)) {
            return;
        }

        const newFilter = {
            label: this.filterName,
            value: Date.now().toString(),
            field: this.fieldValue,
            operator: this.operatorValue,
            input: this.inputValue
        };

        this.savedFilters = [...this.savedFilters, newFilter];

        this.options = this.savedFilters.map(f => ({
            label: f.label,
            value: f.value
        }));

        this.filterName = '';
        this.fieldValue = '';
        this.operatorValue = '';
        this.inputValue = '';

        this.isFilterModalOpen = false;
    }

    get isSearchDisabled() {
        return !(this.fieldValue && this.operatorValue && this.inputValue);
    }

    // 🔥 SEARCH
    handleSearch() {

        this.records = [];
        this.lastId = null;
        this.hasMoreData = true;

        this.loadAccounts();
    }

    // 🔥 LOAD DATA
    loadAccounts() {

        if (this.isLoading || !this.hasMoreData) return;

        this.isLoading = true;

        getAccounts({
            fieldName: this.fieldValue,
            operator: this.operatorValue,
            value: this.inputValue,
            lastId: this.lastId
        })
        .then(result => {

            if (result.length > 0) {

                this.records = [...this.records, ...result];
                this.lastId = result[result.length - 1].Id;

                if (result.length < 10) {
                    this.hasMoreData = false;
                }

            } else {
                this.hasMoreData = false;
            }

            this.showTable = true;
            this.showAssign = false;
            this.isLoading = false;
        })
        .catch(error => {
            console.error(error);
            this.isLoading = false;
        });
    }

    // 🔥 SCROLL HANDLER (NO LOADER ISSUE)
    handleScroll(event) {

        const el = event.target;

        const isBottom =
            el.scrollHeight - el.scrollTop <= el.clientHeight + 20;

        if (isBottom) {
            this.loadAccounts();
        }
    }

    // 🔹 Row Selection
    selectedRowsIds = [];

    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        this.selectedRowsIds = selectedRows.map(row => row.Id);

        this.showAssign = selectedRows.length > 0;
    }

    // 🔹 Assign Modal
    isModalOpen = false;
    users = [];
    selectedUserId = [];

    handleAssign() {
        this.isModalOpen = true;
        this.fetchUsers();
    }

    fetchUsers() {
        getActiveUsers()
        .then(result => {
            this.users = result;
        })
        .catch(error => {
            console.error(error);
        });
    }

    closeModal() {
        this.isModalOpen = false;
    }

    userColumns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Email', fieldName: 'Email' }
    ];

    handleUserSelection(event) {
        this.selectedUserId = event.detail.selectedRows.map(row => row.Id);
    }

    get isAssignDisabled() {
        return !this.selectedUserId || this.selectedUserId.length === 0;
    }

    // 🔥 ASSIGN USER + TOAST
    assignUser() {
        addTeamMembers({ accIds: this.selectedRowsIds, userIds: this.selectedUserId })
        .then(() => {

            this.isModalOpen = false;

            // ✅ SUCCESS TOAST
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account Team Member assigned successfully',
                    variant: 'success'
                })
            );

        })
        .catch(error => {
            console.error(error);

            // ❌ ERROR TOAST
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error assigning team member',
                    variant: 'error'
                })
            );
        });
    }
}