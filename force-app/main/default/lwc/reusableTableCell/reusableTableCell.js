import { api, LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class ReusableTableCell extends LightningElement {
    
    @api tHead;
    @api tData;

    allowedEditableFields = ['number','picklist','checkbox'];

    connectedCallback() {
        // console.log('JSON Head',JSON.stringify(this.tHead));
        // console.log('JSON DATA', JSON.stringify(this.tData));
    }

    extractNestedObjectValue(key, objectValue) {
        if (key.includes('.')) {
            const nestedPath = key.split('.');
            let processedValue = objectValue;
            nestedPath.map(path => {
                processedValue = processedValue[path];
            });
            return processedValue;
        } else {
            return objectValue[key];
        }
    }

    get cellValue() {
        const { key } = this.tHead
        try {
            const value = this.extractNestedObjectValue(key, this.tData);
            // if(!value){
            //     // console.log('Cell Value ==> tdata: ',this.tData,' ::key:: ',key)
            // }
            return value;
        } catch (e) {
            console.log('Error while extracting value', e);
            return 'Error';
        }
    }


    get isInputConfig(){
        return !!this.tHead.inputConfig
    }

    get isInputTypeNumber(){
        return this.tHead?.inputConfig?.type == 'number'
    }

    get isInputPickList(){
        return this.tHead?.inputConfig?.type == 'picklist';
    }

    get isInputCheckBox(){
        return this.tHead?.inputConfig?.type == 'checkbox';
    }

    get isNotAllowedInputType(){
        return !this.allowedEditableFields.includes(this.tHead?.inputConfig?.type);
    }


    get subTHead() {
        const { subTHead } = this.tHead
        return subTHead;
    }

    get processedTHead(){
        let newProcessedThead = {...this.tHead};
        let {inputConfig}  = newProcessedThead;
        if(!!inputConfig){
            let newInputConfig = {...inputConfig}
            Object.keys(inputConfig)?.map(keyName =>{
                if(typeof inputConfig[keyName] == 'function'){
                    newInputConfig = {
                        ...newInputConfig,
                        [keyName] : inputConfig[keyName](this.tData)
                    }
                }
            });
            newProcessedThead = {
                ...newProcessedThead,
                inputConfig : newInputConfig
            }
        }
        
        return newProcessedThead;
    }

    get subTData() {
        try {
            const { key, uniqueKey } = this.tHead
            return this.extractNestedObjectValue(key, this.tData).map(item => ({...item, key: item[uniqueKey] }));
        } catch (e) {
            console.log('Error', e.message)
            console.log('JSON DATA', JSON.stringify(this.tData));
            return [];
        }

    }

    handleClick(event) {
        const buttonName = event.currentTarget.dataset.buttonName;
        const payLoad = event.currentTarget.dataset.payLoad;
        const tHead = this.tHead;
        const tData = this.tData;
        const customEvent = new CustomEvent('actionclick', {
            detail: {
                buttonName,
                tHead,
                tData,
                payLoad
            },
            bubbles: true,
            composed: true
        })
        this.dispatchEvent(customEvent);
    }

    async handleRecordLink(event){
        const recordId = event.currentTarget.dataset.recordId;
        if(this.processedTHead.inputConfig.openInNewTab){
            const link = await this[NavigationMixin.GenerateUrl]({
                type: "standard__recordPage",
                attributes: {
                    recordId,
                    actionName: 'view'
                }
            });
            window.open(link, "_blank")
        }else{
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    actionName: 'view',
                    recordId
                }
            });
        }
    }


    handleInputChange(event){
        const value = event.currentTarget.type == 'checkbox' ? event.currentTarget.checked : event.currentTarget.value;
        const validity = event.currentTarget.validity
        const tHead = this.tHead;
        const tData = this.tData;
        const tableCellChange  = new CustomEvent('tablecellchange',{
            detail : {
                value,
                tHead,
                tData,
                validity
            },
            bubbles: true,
            composed:true
        })
        this.dispatchEvent(tableCellChange);
    }

    handlePreviewContentDocument(event){
        const recordIds = [event.currentTarget.dataset.contentDocumentId].join(',');
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview'
            },
            state : {
                recordIds
                //selectedRecordId:'069xx0000000001AAA'
            }
          })
    }

    get mainClass(){
        return this.processedTHead.isNestedTable && !!this.processedTHead.nestedTableMainClass ? this.processedTHead.nestedTableMainClass : 'slds-table lol-table-nested slds-table_cell-buffer slds-table_borderedX slds-border_leftX slds-border_rightX'
    }
}