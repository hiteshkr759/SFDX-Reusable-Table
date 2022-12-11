import { api, LightningElement } from 'lwc';

export default class ReusableTable extends LightningElement {
    
    @api tableHead = [];
    @api tableData = [];
    @api hideHeader;
    @api mainClass ;

    get tDataJSON(){
        return JSON.stringify(this.tableData,null,2);
    }

    get proccessedShowHead(){
        return !this.hideHeader;
    }

    get tableDataLength(){
        return this.tableData?.length
    }

    get isEmptyRow(){
        return !this.tableData?.length;
    }

    get processedTableHead(){
        const newTableHead = this.tableHead.map(item =>({showColumn : true, ...item}));
        return newTableHead;
    }


    get mainProcessedClass(){
        const defaultClass = 'slds-table slds-table_cell-buffer slds-table_bordered slds-border_left slds-border_right ';
        let finalClassName =  (!!this.mainClass ? this.mainClass : defaultClass)  + (this.proccessedShowHead ? ' ms-table-header-hidden ' : '') ;
        return finalClassName;
    }
}