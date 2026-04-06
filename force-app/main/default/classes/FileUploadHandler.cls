public with sharing class FileUploadHandler {

    @AuraEnabled
    public static void moveFileToLibrary(Id contentDocId, String fileName) {

        // Get latest file version
        ContentVersion cv = [
            SELECT Id, Title, VersionData
            FROM ContentVersion
            WHERE ContentDocumentId = :contentDocId
            ORDER BY VersionNumber DESC
            LIMIT 1
        ];

        String fileText = cv.VersionData.toString();

        // Prepare request body
        Map<String,Object> body = new Map<String,Object>();
        body.put('promptTemplateName','Document_Library_Classifier');

        Map<String,Object> inputParams = new Map<String,Object>();
        inputParams.put('DocumentText', fileText);

        body.put('inputParams', inputParams);

        HttpRequest req = new HttpRequest();
        req.setEndpoint(URL.getOrgDomainUrl().toExternalForm() +
            '/services/data/v60.0/einstein/prompt-template/generations');
        req.setMethod('POST');
        req.setHeader('Authorization','Bearer ' + UserInfo.getSessionId());
        req.setHeader('Content-Type','application/json');
        req.setBody(JSON.serialize(body));

        Http http = new Http();
        HttpResponse res = http.send(req);

        String aiOutput = '';
        String libraryName = 'General Library';

        if(res.getStatusCode() == 200){

            Map<String,Object> result =
                (Map<String,Object>) JSON.deserializeUntyped(res.getBody());

            System.debug('FULL RESPONSE: ' + result);

            List<Object> generations =
                (List<Object>) result.get('generations');

            if(!generations.isEmpty()){

                Map<String,Object> g =
                    (Map<String,Object>) generations[0];

                aiOutput = String.valueOf(g.get('outputText'));

                System.debug('AI OUTPUT: ' + aiOutput);

                if(aiOutput != null){

                    String output = aiOutput.toLowerCase().trim();

                    if(output.contains('invoice')){
                        libraryName = 'Invoice Library';
                    }
                    else if(output.contains('contract')){
                        libraryName = 'Contract Library';
                    }
                    else if(output.contains('personal')){
                        libraryName = 'Personal Library';
                    }
                }
            }
        }

        System.debug('FINAL LIBRARY: ' + libraryName);

        // Find library
        ContentWorkspace library = [
            SELECT Id
            FROM ContentWorkspace
            WHERE Name = :libraryName
            LIMIT 1
        ];

        // Move file
        ContentWorkspaceDoc doc = new ContentWorkspaceDoc(
            ContentWorkspaceId = library.Id,
            ContentDocumentId = contentDocId
        );

        insert doc;
    }
}