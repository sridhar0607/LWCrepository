import { LightningElement, api } from 'lwc';
import processFile from '@salesforce/apex/FileUploadController.processFile';
 
export default class FileUploadComponent extends LightningElement {
 
    @api recordId;
 
    isUploading = false;
    uploadSuccess = false;
 
    handleUploadFinished(event) {
 
        this.isUploading = true;
        this.uploadSuccess = false;
 
        const uploadedFiles = event.detail.files;
 
        uploadedFiles.forEach(file => {
 
            console.log('Uploaded File:', file);
 
            const contentVersionId = file.contentVersionId;
 
            console.log('ContentVersionId:', contentVersionId);
 
            // Small delay to ensure file is committed
            setTimeout(() => {
 
                processFile({ contentVersionId: contentVersionId })
                .then(() => {
 
                    this.isUploading = false;
                    this.uploadSuccess = true;
 
                    setTimeout(() => {
                        this.uploadSuccess = false;
                    }, 3000);
 
                })
                .catch(error => {
 
                    console.error('Apex Error:', error);
                    this.isUploading = false;
 
                });
 
            }, 1500);
 
        });
 
    }
 
}